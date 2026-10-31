import { SNAP_THRESHOLD } from '@/constants/web-editor';
import type { Position } from '@/types';

/**
 * Load image from URL/base64 using native Image API
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Calculate snapped position based on grid or other objects
 */
export const snapToGrid = (position: number, gridSize: number): number => {
  return Math.round(position / gridSize) * gridSize;
};

/**
 * Find nearest snap line for alignment guides
 */
export const findSnapLines = (
  targetPos: Position,
  targetSize: { width: number; height: number },
  otherObjects: Array<{
    position: Position;
    size: { width: number; height: number };
  }>,
): {
  vertical: number[];
  horizontal: number[];
} => {
  const vertical: number[] = [];
  const horizontal: number[] = [];

  const targetCenterX = targetPos.x + targetSize.width / 2;
  const targetCenterY = targetPos.y + targetSize.height / 2;
  const targetRight = targetPos.x + targetSize.width;
  const targetBottom = targetPos.y + targetSize.height;

  otherObjects.forEach((obj) => {
    const objCenterX = obj.position.x + obj.size.width / 2;
    const objCenterY = obj.position.y + obj.size.height / 2;
    const objRight = obj.position.x + obj.size.width;
    const objBottom = obj.position.y + obj.size.height;

    // Vertical snap lines (x-axis)
    if (Math.abs(targetPos.x - obj.position.x) < SNAP_THRESHOLD) {
      vertical.push(obj.position.x);
    }
    if (Math.abs(targetCenterX - objCenterX) < SNAP_THRESHOLD) {
      vertical.push(objCenterX);
    }
    if (Math.abs(targetRight - objRight) < SNAP_THRESHOLD) {
      vertical.push(objRight);
    }

    // Horizontal snap lines (y-axis)
    if (Math.abs(targetPos.y - obj.position.y) < SNAP_THRESHOLD) {
      horizontal.push(obj.position.y);
    }
    if (Math.abs(targetCenterY - objCenterY) < SNAP_THRESHOLD) {
      horizontal.push(objCenterY);
    }
    if (Math.abs(targetBottom - objBottom) < SNAP_THRESHOLD) {
      horizontal.push(objBottom);
    }
  });

  return {
    vertical: [...new Set(vertical)],
    horizontal: [...new Set(horizontal)],
  };
};

/**
 * Apply snap to position
 */
export const applySnap = (position: Position, snapLines: { vertical: number[]; horizontal: number[] }): Position => {
  let x = position.x;
  let y = position.y;

  if (snapLines.vertical.length > 0) {
    const closest = snapLines.vertical.reduce((prev, curr) => {
      return Math.abs(curr - x) < Math.abs(prev - x) ? curr : prev;
    });
    if (Math.abs(closest - x) < SNAP_THRESHOLD) {
      x = closest;
    }
  }

  if (snapLines.horizontal.length > 0) {
    const closest = snapLines.horizontal.reduce((prev, curr) => {
      return Math.abs(curr - y) < Math.abs(prev - y) ? curr : prev;
    });
    if (Math.abs(closest - y) < SNAP_THRESHOLD) {
      y = closest;
    }
  }

  return { x, y };
};

/**
 * Convert mm to pixels
 */
export const mmToPx = (mm: number, dpi: number = 300): number => {
  return Math.round((mm / 25.4) * dpi);
};

/**
 * Convert pixels to mm
 */
export const pxToMm = (px: number, dpi: number = 300): number => {
  return Math.round((px * 25.4) / dpi);
};

/**
 * Clamp value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Download data URL as file
 */
export const downloadDataURL = (dataURL: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Debounce function using built-in setTimeout
 */
// ...existing code...
export const debounce = <Args extends unknown[], R>(
  func: (...args: Args) => R,
  wait: number,
): ((...args: Args) => void) & { cancel: () => void } => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const executedFunction = ((...args: Args) => {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  }) as ((...args: Args) => void) & { cancel?: () => void };

  executedFunction.cancel = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return executedFunction as ((...args: Args) => void) & { cancel: () => void };
};
// ...existing code...

/**
 * Format hex color (ensure # prefix)
 */
export const formatHexColor = (color: string): string => {
  const cleaned = color.replace(/[^0-9A-Fa-f]/g, '');
  return `#${cleaned.slice(0, 6)}`;
};

/**
 * Validate hex color
 */
export const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};
