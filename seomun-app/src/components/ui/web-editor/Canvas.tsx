'use client';

import { DEFAULT_GRID_SIZE } from '@/constants/web-editor';
import { ObjectType } from '@/enums/editor';
import { useSnapshot, useWebEditorStore } from '@/hooks';
import { applySnap, findSnapLines, snapToGrid } from '@/lib/utils';
import { CanvasObject, TextObject } from '@/types';
import type Konva from 'konva';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Text as KonvaText, Layer, Line, Rect, Stage, Transformer } from 'react-konva';
import { CanvasBackgroundImage } from './CanvasBackgroundImage';
import { CanvasImage } from './CanvasImage';
import { CanvasShape } from './CanvasShape';
import { Ruler } from './Ruler';
import { Togglebar } from './Togglebar';
import { Toolbar } from './Toolbar';

interface CanvasProps {
  width: number;
  height: number;
  onStageReady?: (stage: Konva.Stage) => void;
}

export default function Canvas({ width, height, onStageReady }: CanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const layerRefs = useRef<(Konva.Layer | null)[]>([]);
  const panRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const {
    activeSide,
    datas,
    selectedTemplateId,
    selectSide,
    selectedBannerId,
    updateThumbnail,
    selectedId,
    zoom,
    pan,
    rulersEnabled,
    snapToGrid: snapToGridEnabled,
    snapToObjects,
    selectObject,
    updateObject,
    deleteObject,
    duplicateObject,
    undo,
    redo,
    setPan,
    setZoom,
    canvasSize,
    bleedPx,
    safeAreaPx,
    workSizeVisible,
    trimSizeVisible,
    safeAreaVisible,
    setIsGridView,
  } = useWebEditorStore();

  const objects = datas[activeSide].objects;
  const background = datas[activeSide].background;

  const [snapLines, setSnapLines] = useState<{ vertical: number[]; horizontal: number[] }>({
    vertical: [],
    horizontal: [],
  });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const scale = zoom;
  const scaledCardWidth = canvasSize.width * scale;
  const scaledCardHeight = canvasSize.height * scale;
  const workSizeGuideInset = 1 / scale;

  const offsetX = (width - scaledCardWidth) / 2 + pan.x;
  const offsetY = (height - scaledCardHeight) / 2 + pan.y;

  const versionRef = useRef<number[]>([]);
  const snapshotCacheRef = useRef<string[]>([]);

  const handleSnapshotGenerated = useCallback(
    (side: number, dataURL: string, version?: number) => {
      if (version !== undefined && version !== versionRef.current[side]) {
        // Stale snapshot - drop it
        return;
      }

      // Cache snapshot
      snapshotCacheRef.current[side] = dataURL;

      // Always update thumbnail - cache handles stale updates
      updateThumbnail(side, dataURL);

      // Mark sync as complete
    },
    [updateThumbnail],
  );

  // Use refs for bounds to avoid recreating callback
  const boundsRef = useRef({ x: offsetX, y: offsetY, width: scaledCardWidth, height: scaledCardHeight });

  // Update bounds ref in effect
  useEffect(() => {
    boundsRef.current = { x: offsetX, y: offsetY, width: scaledCardWidth, height: scaledCardHeight };
  }, [offsetX, offsetY, scaledCardWidth, scaledCardHeight]);

  const getCardBounds = useCallback(() => {
    return {
      x: offsetX + bleedPx * scale,
      y: offsetY + bleedPx * scale,
      width: (canvasSize.width - bleedPx * 2) * scale,
      height: (canvasSize.height - bleedPx * 2) * scale,
    };
  }, [offsetX, offsetY, scale, canvasSize.width, canvasSize.height, bleedPx]);

  const beforeExport = useCallback(
    (side: number) => {
      const layer = layerRefs.current[side];
      if (layer) {
        layer.clip({
          x: bleedPx + safeAreaPx,
          y: bleedPx + safeAreaPx,
          width: canvasSize.width - (bleedPx + safeAreaPx) * 2,
          height: canvasSize.height - (bleedPx + safeAreaPx) * 2,
        });
        layer.batchDraw();
      }
    },
    [canvasSize.width, canvasSize.height, bleedPx, safeAreaPx],
  );

  const afterExport = useCallback((side: number) => {
    const layer = layerRefs.current[side];
    if (layer) {
      layer.clip(null);
      layer.batchDraw();
    }
  }, []);

  // Snapshot system - imperative, event-driven
  const { requestSnapshot: originalRequestSnapshot, generateSnapshot } = useSnapshot(stageRef, transformerRef, {
    onSnapshotGenerated: handleSnapshotGenerated,
    debounceMs: 0,
    getCardBounds,
    beforeExport,
    afterExport,
  });

  // Wrap requestSnapshot to add version tracking
  const requestSnapshot = useCallback(
    (side: number) => {
      // Increment version for this side
      const version = (versionRef.current[side] || 0) + 1;
      versionRef.current[side] = version;

      // Pass version through config
      originalRequestSnapshot(side, { version });
    },
    [originalRequestSnapshot],
  );

  // Keep requestSnapshot ref stable for useEffect
  const requestSnapshotRef = useRef(requestSnapshot);

  useEffect(() => {
    requestSnapshotRef.current = requestSnapshot;
  }, [requestSnapshot]);

  const generateSnapshotRef = useRef(generateSnapshot);

  useEffect(() => {
    generateSnapshotRef.current = generateSnapshot;
  }, [generateSnapshot]);

  // Keep panRef in sync with pan state
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  const activeSideRef = useRef(activeSide);

  useEffect(() => {
    activeSideRef.current = activeSide;
  }, [activeSide]);

  const generatedTemplateThumbnailsRef = useRef<number | null>(null);

  useEffect(() => {
    if (!selectedTemplateId || datas.length < 2 || generatedTemplateThumbnailsRef.current === selectedTemplateId) return;

    generatedTemplateThumbnailsRef.current = selectedTemplateId;
    let cancelled = false;
    const originalSide = activeSideRef.current;

    const generateAllThumbnails = async () => {
      for (let sideIndex = 0; sideIndex < datas.length; sideIndex++) {
        selectSide(sideIndex);
        await new Promise((resolve) => setTimeout(resolve, 350));
        if (cancelled) return;

        const version = (versionRef.current[sideIndex] || 0) + 1;
        versionRef.current[sideIndex] = version;
        generateSnapshotRef.current(sideIndex, { version });
      }

      if (!cancelled) selectSide(originalSide);
    };

    void generateAllThumbnails();

    return () => {
      cancelled = true;
    };
  }, [datas.length, selectSide, selectedTemplateId]);

  // Track content change debounce timer
  const contentChangeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate snapshot when background or objects change
  useEffect(() => {
    // Clear existing timer
    if (contentChangeTimerRef.current) {
      clearTimeout(contentChangeTimerRef.current);
    }

    // Debounced snapshot request when content changes
    const timer = setTimeout(() => {
      requestSnapshotRef.current(activeSide);
      contentChangeTimerRef.current = null;
    }, 300);

    contentChangeTimerRef.current = timer;

    return () => {
      if (contentChangeTimerRef.current) {
        clearTimeout(contentChangeTimerRef.current);
        contentChangeTimerRef.current = null;
      }
    };
  }, [activeSide, objects, background, selectedBannerId, workSizeVisible, trimSizeVisible, safeAreaVisible]);

  // Generate snapshot for new side after layout is committed
  useEffect(() => {
    // Apply cached snapshot if available (instant preview)
    const cached = snapshotCacheRef.current[activeSide];
    if (cached) {
      updateThumbnail(activeSide, cached);
    }

    // Generate fresh snapshot for new side after visibility toggle
    requestSnapshotRef.current(activeSide);
  }, [activeSide, updateThumbnail]);

  // Attach transformer to selected object
  useEffect(() => {
    if (!transformerRef.current) return;

    const transformer = transformerRef.current;
    const activeLayer = layerRefs.current[activeSide];

    if (!activeLayer) return;

    if (selectedId) {
      const node = activeLayer.findOne(`#${selectedId}`);
      if (node) {
        transformer.nodes([node]);
      }
    } else {
      transformer.nodes([]);
    }

    activeLayer.batchDraw();
  }, [selectedId, activeSide]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if user is typing in an input, textarea or contenteditable element
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('.konva-text-editor');

      if (isTyping && e.code !== 'Escape') {
        return;
      }

      // Enable pan mode with Space key
      if (e.code === 'Space' && !isSpacePressed) {
        setIsSpacePressed(true);
        const container = stageRef.current?.container();
        if (container) {
          container.style.cursor = 'grab';
        }
        e.preventDefault();
        return;
      }

      // Delete
      if (e.key === 'Delete' && selectedId) {
        deleteObject(selectedId);
        requestSnapshotRef.current(activeSide);
        e.preventDefault();
      }

      // Undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        undo();
        requestSnapshotRef.current(activeSide);
        e.preventDefault();
      }

      // Redo
      if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        redo();
        requestSnapshotRef.current(activeSide);
        e.preventDefault();
      }

      // Duplicate
      if (e.ctrlKey && e.key === 'd' && selectedId) {
        duplicateObject(selectedId);
        e.preventDefault();
      }

      // Deselect
      if (e.key === 'Escape') {
        selectObject(null);
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Disable pan mode when Space key is released
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        const container = stageRef.current?.container();
        if (container) {
          container.style.cursor = 'default';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedId, deleteObject, undo, redo, duplicateObject, selectObject, isSpacePressed, activeSide]);

  // Handle object drag
  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>, obj: CanvasObject) => {
    const node = e.target;
    let newX = node.x();
    let newY = node.y();

    // Apply grid snapping
    if (snapToGridEnabled) {
      newX = snapToGrid(newX, DEFAULT_GRID_SIZE);
      newY = snapToGrid(newY, DEFAULT_GRID_SIZE);
    }

    // Apply object snapping
    if (snapToObjects) {
      const otherObjects = objects.filter((o) => o.id !== obj.id).map((o) => ({ position: o.position, size: o.size }));

      const lines = findSnapLines({ x: newX, y: newY }, obj.size, otherObjects);

      setSnapLines(lines);

      const snapped = applySnap({ x: newX, y: newY }, lines);
      newX = snapped.x;
      newY = snapped.y;
    }

    node.position({ x: newX, y: newY });
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, obj: CanvasObject) => {
    const node = e.target;
    updateObject(obj.id, {
      position: { x: node.x(), y: node.y() },
    });
    setSnapLines({ vertical: [], horizontal: [] });

    // Request snapshot after drag (debounced)
    requestSnapshot(activeSide);
  };

  // Handle transform
  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>, obj: CanvasObject) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale and update size
    node.scaleX(1);
    node.scaleY(1);

    updateObject(obj.id, {
      position: { x: node.x(), y: node.y() },
      size: {
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
      },
      rotation: node.rotation(),
    });

    // Request snapshot after transform (debounced)
    requestSnapshot(activeSide);
  };

  useEffect(() => {
    const container = stageRef?.current?.container();
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const stage = stageRef.current;
      if (!stage) return;

      if (e.ctrlKey) {
        // Zooming logic
        const oldScale = zoom;
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        // Calculate mouse position relative to card top-left
        const mousePointTo = {
          x: (pointer.x - offsetX) / oldScale,
          y: (pointer.y - offsetY) / oldScale,
        };

        // Zoom factor
        const scaleBy = 1.05;
        const direction = e.deltaY > 0 ? -1 : 1;
        const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

        const clampedScale = Math.max(0.1, Math.min(5, newScale));

        const newPan = {
          x: pointer.x - mousePointTo.x * clampedScale - (width - canvasSize.width * clampedScale) / 2,
          y: pointer.y - mousePointTo.y * clampedScale - (height - canvasSize.height * clampedScale) / 2,
        };

        setZoom(clampedScale);
        setPan(newPan);
      } else {
        // Scrolling logic
        const newPan = {
          x: pan.x - e.deltaX,
          y: pan.y - e.deltaY,
        };
        setPan(newPan);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [zoom, pan, offsetX, offsetY, width, height, setZoom, setPan, canvasSize.width, canvasSize.height]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const interactionState = {
      isPanning: false,
      startPan: { x: 0, y: 0 },
      startPointer: { x: 0, y: 0 },
      lastPinchDist: 0,
    };

    const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
      return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    };

    const handleInteractionStart = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const isTouch = !!(e.evt as TouchEvent).touches;
      const touches = isTouch ? (e.evt as TouchEvent).touches : null;

      // Handle pan initialization
      const canMousePan =
        !isTouch && (((e.evt as MouseEvent).button === 0 && isSpacePressed) || (e.evt as MouseEvent).button === 1);
      const isSingleTouchOnBackground = isTouch && touches?.length === 1 && e.target === stage;

      if (canMousePan || isSingleTouchOnBackground) {
        interactionState.isPanning = true;
        const pointer = stage.getPointerPosition();
        if (pointer) {
          interactionState.startPointer = { x: pointer.x, y: pointer.y };
          interactionState.startPan = { ...panRef.current };
        }
        stage.container().style.cursor = 'grabbing';
        e.evt.preventDefault();
      }

      // Handle pinch initialization
      if (isTouch && touches?.length === 2) {
        interactionState.lastPinchDist = getDistance(
          { x: touches[0].clientX, y: touches[0].clientY },
          { x: touches[1].clientX, y: touches[1].clientY },
        );
      }
    };

    const handleInteractionMove = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const isTouch = !!(e.evt as TouchEvent).touches;
      const touches = isTouch ? (e.evt as TouchEvent).touches : null;

      // Handle Panning
      if (interactionState.isPanning) {
        const pointer = stage.getPointerPosition();
        if (pointer) {
          const dx = pointer.x - interactionState.startPointer.x;
          const dy = pointer.y - interactionState.startPointer.y;

          const newPan = {
            x: interactionState.startPan.x + dx,
            y: interactionState.startPan.y + dy,
          };

          if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
          rafRef.current = requestAnimationFrame(() => {
            setPan(newPan);
            rafRef.current = null;
          });
        }
      }

      // Handle Pinch
      if (isTouch && touches?.length === 2 && interactionState.lastPinchDist > 0) {
        const dist = getDistance(
          { x: touches[0].clientX, y: touches[0].clientY },
          { x: touches[1].clientX, y: touches[1].clientY },
        );

        if (dist > interactionState.lastPinchDist * 1.5) {
          setIsGridView(true);
          interactionState.lastPinchDist = 0;
        }
      }
    };

    const handleInteractionEnd = () => {
      interactionState.isPanning = false;
      interactionState.lastPinchDist = 0;
      stage.container().style.cursor = isSpacePressed ? 'grab' : 'default';
    };

    stage.on('mousedown touchstart', handleInteractionStart);
    stage.on('mousemove touchmove', handleInteractionMove);
    stage.on('mouseup touchend mouseleave touchcancel', handleInteractionEnd);

    return () => {
      stage.off('mousedown touchstart', handleInteractionStart);
      stage.off('mousemove touchmove', handleInteractionMove);
      stage.off('mouseup touchend mouseleave touchcancel', handleInteractionEnd);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [setPan, isSpacePressed, setIsGridView]);

  const handleTextDblClick = (id: string) => {
    setEditingId(id);
    selectObject(id);
  };

  const handleEditorBlur = (id: string, value: string) => {
    updateObject(id, { content: value });
    setEditingId(null);
    requestSnapshot(activeSide);
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, id: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleEditorBlur(id, e.currentTarget.value);
    }
    if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleAssetLoad = useCallback(
    (sideIndex: number) => {
      if (sideIndex === activeSide) requestSnapshot(sideIndex);
    },
    [activeSide, requestSnapshot],
  );

  function renderObjects(objects: CanvasObject[], sideIndex: number) {
    return objects
      ?.filter((obj) => obj.visible)
      .sort((a, b) => a.zIndex - b.zIndex)
      .map((obj) => {
        if (obj.type === ObjectType.TEXT) {
          const isEditing = editingId === obj.id;
          return (
            <KonvaText
              key={obj.id}
              id={obj.id}
              x={obj.position.x}
              y={obj.position.y}
              text={obj.content}
              fontSize={obj.fontSize}
              fontFamily={obj.fontFamily}
              fontStyle={`${obj.fontStyle} ${obj.fontWeight}`}
              textDecoration={obj.textDecoration}
              fill={obj.color}
              align={obj.align}
              width={obj.size.width}
              height={obj.size.height}
              lineHeight={obj.lineHeight}
              letterSpacing={obj.letterSpacing}
              rotation={obj.rotation}
              opacity={obj.opacity}
              draggable={!obj.locked}
              visible={!isEditing}
              onClick={() => selectObject(obj.id)}
              onTap={() => selectObject(obj.id)}
              onDblClick={() => handleTextDblClick(obj.id)}
              onDblTap={() => handleTextDblClick(obj.id)}
              onDragMove={(e) => handleDragMove(e, obj)}
              onDragEnd={(e) => handleDragEnd(e, obj)}
              onTransformEnd={(e) => handleTransformEnd(e, obj)}
            />
          );
        }

        if (obj.type === ObjectType.IMAGE) {
          return (
            <CanvasImage
              key={obj.id}
              obj={obj}
              onLoad={() => handleAssetLoad(sideIndex)}
              onSelect={() => selectObject(obj.id)}
              onDragMove={(e) => handleDragMove(e, obj)}
              onDragEnd={(e) => handleDragEnd(e, obj)}
              onTransformEnd={(e) => handleTransformEnd(e, obj)}
            />
          );
        }

        if (obj.type === ObjectType.SHAPE) {
          return (
            <CanvasShape
              key={obj.id}
              obj={obj}
              onSelect={() => selectObject(obj.id)}
              onDragMove={(e) => handleDragMove(e, obj)}
              onDragEnd={(e) => handleDragEnd(e, obj)}
              onTransformEnd={(e) => handleTransformEnd(e, obj)}
            />
          );
        }

        return null;
      });
  }

  return (
    <div className='relative h-full w-full overflow-hidden bg-gray-50 md:bg-white'>
      {/* Rulers */}
      {rulersEnabled && (
        <>
          <Ruler orientation='horizontal' width={width} height={24} zoom={zoom} pan={pan} />
          <Ruler orientation='vertical' width={24} height={height} zoom={zoom} pan={pan} />
        </>
      )}

      <Toolbar />
      <Togglebar />
      <Stage
        ref={(node) => {
          // Only update if stage instance changed
          if (stageRef.current !== node) {
            stageRef.current = node;
            if (node && onStageReady) {
              onStageReady(node);
            }
          }
        }}
        width={width}
        height={height}
        onMouseDown={(e) => {
          // Deselect when clicking on empty space
          if (e.target === e.target.getStage()) {
            selectObject(null);
          }
        }}>
        <Layer name='background-layer'>
          {/* Canvas background (white card) */}
          <Rect
            x={offsetX}
            y={offsetY}
            width={scaledCardWidth}
            height={scaledCardHeight}
            fill={background.backgroundColor}
            shadowColor='black'
          />

          {/* Background Image */}
          {background.backgroundImage && (
            <CanvasBackgroundImage
              src={background.backgroundImage}
              x={offsetX + bleedPx * scale}
              y={offsetY + bleedPx * scale}
              width={(canvasSize.width - bleedPx * 2) * scale}
              height={(canvasSize.height - bleedPx * 2) * scale}
              backgroundSize={background.backgroundSize || 'cover'}
              onLoad={() => handleAssetLoad(activeSide)}
            />
          )}
        </Layer>

        {datas.map((side, index) => (
          <Layer
            key={index}
            name={`objects-layer-${index}`}
            ref={(node) => {
              layerRefs.current[index] = node;
            }}
            x={offsetX}
            y={offsetY}
            scaleX={scale}
            scaleY={scale}
            visible={activeSide === index}
            listening={activeSide === index}>
            {renderObjects(side.objects, index)}
          </Layer>
        ))}

        {/* Snap lines and Transformer on top */}
        <Layer name='transformer-layer' x={offsetX} y={offsetY} scaleX={scale} scaleY={scale}>
          {/* Snap lines */}
          {snapLines.vertical.map((x, i) => (
            <Line
              key={`snap-v-${i}`}
              points={[x, 0, x, canvasSize.height]}
              stroke='#00bcd4'
              strokeWidth={1 / scale}
              listening={false}
            />
          ))}
          {snapLines.horizontal.map((y, i) => (
            <Line
              key={`snap-h-${i}`}
              points={[0, y, canvasSize.width, y]}
              stroke='#00bcd4'
              strokeWidth={1 / scale}
              listening={false}
            />
          ))}

          {/* Transformer */}
          {selectedId && <Transformer ref={transformerRef} />}
        </Layer>

        {/* Guides Layer */}
        <Layer name='guides-layer' x={offsetX} y={offsetY} scaleX={scale} scaleY={scale} listening={false}>
          <Rect
            id='work-size-guide'
            x={workSizeGuideInset}
            y={workSizeGuideInset}
            width={Math.max(0, canvasSize.width - workSizeGuideInset * 2)}
            height={Math.max(0, canvasSize.height - workSizeGuideInset * 2)}
            stroke='#EB5757'
            strokeWidth={1 / scale}
            visible={workSizeVisible}
          />
          <Rect
            id='trim-size-guide'
            x={bleedPx}
            y={bleedPx}
            width={canvasSize.width - bleedPx * 2}
            height={canvasSize.height - bleedPx * 2}
            stroke='#2B231F'
            strokeWidth={1 / scale}
            visible={trimSizeVisible}
          />
          <Rect
            id='safe-area-guide'
            x={bleedPx + safeAreaPx}
            y={bleedPx + safeAreaPx}
            width={canvasSize.width - (bleedPx + safeAreaPx) * 2}
            height={canvasSize.height - (bleedPx + safeAreaPx) * 2}
            stroke='#5170D4'
            strokeWidth={1 / scale}
            visible={safeAreaVisible}
          />
        </Layer>
      </Stage>

      {/* Inline Text Editor */}
      {(() => {
        if (!editingId) return null;
        const editingObj = objects.find((o) => o.id === editingId) as TextObject;
        if (!editingObj) return null;

        return (
          <div
            className='konva-text-editor absolute z-50 overflow-hidden bg-transparent'
            style={{
              left: offsetX + editingObj.position.x * scale,
              top: offsetY + editingObj.position.y * scale,
              width: editingObj.size.width * scale,
              height: editingObj.size.height * scale,
              transform: `rotate(${editingObj.rotation}deg)`,
              transformOrigin: '0 0',
            }}>
            <textarea
              autoFocus
              className='h-full w-full resize-none border-none bg-transparent p-0 outline-none'
              defaultValue={editingObj.content}
              onBlur={(e) => handleEditorBlur(editingId, e.target.value)}
              onKeyDown={(e) => handleEditorKeyDown(e, editingId)}
              style={{
                fontSize: `${editingObj.fontSize * scale}px`,
                fontFamily: editingObj.fontFamily,
                fontWeight: editingObj.fontWeight,
                color: editingObj.color,
                textAlign: editingObj.align,
                lineHeight: editingObj.lineHeight,
                letterSpacing: `${editingObj.letterSpacing * scale}px`,
              }}
            />
          </div>
        );
      })()}
    </div>
  );
}
