'use client';

import { debounce } from '@/lib/utils';
import type { SnapshotConfig } from '@/types';
import type Konva from 'konva';
import { useCallback, useEffect, useRef } from 'react';

interface UseSnapshotOptions {
  onSnapshotGenerated?: (activeSide: number, dataURL: string, version?: number) => void;
  debounceMs?: number;
  getCardBounds?: () => { x: number; y: number; width: number; height: number };
  beforeExport?: (activeSide: number) => void;
  afterExport?: (activeSide: number) => void;
}

/**
 * Hook for imperative snapshot generation
 *
 * IMPORTANT: Snapshot is event-driven, not state-watched
 * - Call requestSnapshot() from event handlers (dragEnd, transformEnd, etc.)
 * - Debounced by default, flushed immediately on side switch
 */
export function useSnapshot(
  stageRef: React.RefObject<Konva.Stage | null>,
  transformerRef: React.RefObject<Konva.Transformer | null>,
  options: UseSnapshotOptions = {},
) {
  const { onSnapshotGenerated, debounceMs = 500, getCardBounds } = options;

  const pendingSnapshotRef = useRef<{ activeSide: number; config?: SnapshotConfig } | null>(null);

  const debouncedRequestRef = useRef<(((activeSide: number, config?: SnapshotConfig) => void) & { cancel?: () => void }) | null>(
    null,
  );

  /**
   * Generate snapshot imperatively
   * Normalizes stage (hide transformer, reset scale) before export
   */
  const generateSnapshot = useCallback(
    (activeSide: number, config: SnapshotConfig = {}) => {
      const stage = stageRef.current;
      const transformer = transformerRef.current;

      if (!stage) {
        console.warn('Stage not available for snapshot');
        return null;
      }

      try {
        // Step 1: Normalize stage
        const originalTransformerVisible = transformer?.visible() ?? false;
        if (transformer) {
          transformer.visible(false);
        }

        // Step 2: Generate snapshot
        const {
          pixelRatio = 0.5, // Low res for thumbnails
          quality = 0.7,
          format = 'image/jpeg',
          version, // Extract version from config
        } = config;

        const bounds = getCardBounds ? getCardBounds() : undefined;

        if (options.beforeExport) {
          options.beforeExport(activeSide);
        }

        const dataURL = stage.toDataURL({
          pixelRatio,
          quality,
          mimeType: format,
          ...bounds,
        });

        // Step 3: Restore stage
        if (transformer && originalTransformerVisible) {
          transformer.visible(true);
        }

        if (options.afterExport) {
          options.afterExport(activeSide);
        }

        // Step 4: Notify callback with version
        if (onSnapshotGenerated) {
          onSnapshotGenerated(activeSide, dataURL, version);
        }

        return dataURL;
      } catch (error) {
        console.error('Failed to generate snapshot:', error);
        return null;
      }
    },
    [stageRef, transformerRef, onSnapshotGenerated, getCardBounds, options],
  );

  // Keep a ref to the latest generateSnapshot to avoid stale closures in debounce
  const generateSnapshotRef = useRef(generateSnapshot);
  useEffect(() => {
    generateSnapshotRef.current = generateSnapshot;
  }, [generateSnapshot]);

  const requestSnapshot = useCallback((activeSide: number, config?: SnapshotConfig) => {
    pendingSnapshotRef.current = { activeSide, config };
    debouncedRequestRef.current?.(activeSide, config);
  }, []);

  /**
   * Flush pending snapshot immediately (for side switch)
   */
  const flushSnapshot = useCallback(() => {
    const pending = pendingSnapshotRef.current;
    if (pending) {
      debouncedRequestRef.current?.cancel?.();
      generateSnapshot(pending.activeSide, pending.config);
      pendingSnapshotRef.current = null;
    }
  }, [generateSnapshot]);

  useEffect(() => {
    debouncedRequestRef.current = debounce((activeSide: number, config?: SnapshotConfig) => {
      generateSnapshotRef.current(activeSide, config);
    }, debounceMs);

    return () => {
      debouncedRequestRef.current?.cancel?.();
    };
  }, [debounceMs]);

  return {
    generateSnapshot, // Immediate generation
    requestSnapshot, // Debounced request
    flushSnapshot, // Flush pending
  };
}
