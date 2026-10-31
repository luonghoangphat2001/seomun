import type Konva from 'konva';
import { Layer, Line, Rect, Stage, Transformer } from 'react-konva';

import { MIN_TEXT_WIDTH } from '../constants';
import { LayerType, ShapeType } from '../enums';
import { useCanvasInteractions } from '../hooks/useCanvasInteractions';
import type { LayerFormValues } from '../schemas';
import type { NodeProps } from '../types';
import { BackgroundImage, ImageNode, ShapeNode, TextNode } from './CanvasNodes';

// === Type definitions ===

interface TemplateCanvasStageProps {
  layers: LayerFormValues[];
  /** Trim (page) size in px (page mm converted at the selected web editor's dpi). Layer coords are relative to trim origin. */
  canvasW: number;
  canvasH: number;
  /** Bleed margin around the trim, in px. Artboard = trim + 2×bleed. */
  bleedPx?: number;
  /** Safe-area inset from the trim edge, in px. */
  safePx?: number;
  showBleed?: boolean;
  showSafe?: boolean;
  showFold?: boolean;
  foldNumber?: number;
  backgroundUrl?: string;
  /** Solid trim fill color. Empty falls back to white; the background image (if any) draws on top. */
  backgroundColor?: string;
  selectedIds: string[];
  interactive?: boolean;
  /** Exposes the Konva Stage so the parent can capture a preview PNG. */
  stageRef?: React.Ref<Konva.Stage>;
  /** additive=true (shift/ctrl-click) toggles id in/out of the selection instead of replacing it. */
  onSelect: (id: string | null, additive?: boolean) => void;
  /** Rubber-band drag over empty canvas — replaces the selection with everything inside the box. */
  onMarqueeSelect?: (ids: string[]) => void;
  onChange: (id: string, patch: Partial<LayerFormValues>) => void;
  onContextMenu?: (id: string, x: number, y: number) => void;
  /** Right-click on empty canvas (not a node) — screen coords for the popup, content coords for pasting. */
  onCanvasContextMenu?: (screenX: number, screenY: number, canvasX: number, canvasY: number) => void;
  drawingShapeType?: ShapeType | null;
  onDrawComplete?: (type: ShapeType, x: number, y: number, w: number, h: number, rotation?: number) => void;
}

// === Component ===

export function TemplateCanvasStage({
  layers,
  canvasW,
  canvasH,
  bleedPx = 0,
  safePx = 0,
  showBleed = true,
  showSafe = true,
  showFold = true,
  foldNumber = 0,
  backgroundUrl,
  backgroundColor,
  selectedIds,
  interactive = true,
  stageRef,
  onSelect,
  onMarqueeSelect,
  onChange,
  onContextMenu,
  onCanvasContextMenu,
  drawingShapeType = null,
  onDrawComplete,
}: TemplateCanvasStageProps) {
  // All interactive state + pointer/transform handlers live in the hook.
  const {
    containerRef,
    nodeLayerRef,
    transformerRef,
    scale,
    artW,
    artH,
    hoveredId,
    snapGuides,
    drawStart,
    drawCurrent,
    marqueeStart,
    marqueeCurrent,
    handleAnchorDragBound,
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageContextMenu,
    buildNodeEventProps,
  } = useCanvasInteractions({
    layers,
    canvasW,
    canvasH,
    bleedPx,
    safePx,
    selectedIds,
    interactive,
    drawingShapeType,
    onSelect,
    onMarqueeSelect,
    onChange,
    onContextMenu,
    onCanvasContextMenu,
    onDrawComplete,
  });

  // A single selected text box resizes horizontally only (width drives wrapping);
  // corners would scale the glyphs, which we don't want.
  const singleTextSelected = selectedIds.length === 1 && layers.find((l) => l.layer_id === selectedIds[0])?.type === LayerType.TEXT;

  // === JSX return ===
  return (
    <div
      ref={containerRef}
      className='flex h-full w-full items-center justify-center overflow-hidden'
      style={drawingShapeType ? { cursor: 'crosshair' } : undefined}
    >
      <div className='shadow-lg' style={{ width: artW * scale, height: artH * scale }}>
        <Stage
          ref={stageRef}
          width={artW * scale}
          height={artH * scale}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onTouchStart={handleStageMouseDown}
          onContextMenu={handleStageContextMenu}
        >
          {/* Background + print guides */}
          <Layer listening>
            {/* Artboard (bleed area) */}
            <Rect name='background' x={0} y={0} width={artW} height={artH} fill={showBleed && bleedPx > 0 ? '#f8d7da' : '#ffffff'} />
            {/* Trim card */}
            <Rect
              name='background'
              x={bleedPx}
              y={bleedPx}
              width={canvasW}
              height={canvasH}
              fill={backgroundColor || '#ffffff'}
              stroke='#e2e8f0'
              strokeWidth={1}
            />
            {backgroundUrl ? <BackgroundImage src={backgroundUrl} x={bleedPx} y={bleedPx} width={canvasW} height={canvasH} /> : null}
            {/* Bleed line (trim edge) */}
            {showBleed && bleedPx > 0 ? (
              <Rect x={bleedPx} y={bleedPx} width={canvasW} height={canvasH} stroke='#ef4444' strokeWidth={1} dash={[4, 4]} listening={false} />
            ) : null}
            {/* Safe area */}
            {showSafe && safePx > 0 ? (
              <Rect
                x={bleedPx + safePx}
                y={bleedPx + safePx}
                width={Math.max(canvasW - safePx * 2, 0)}
                height={Math.max(canvasH - safePx * 2, 0)}
                stroke='#3b82f6'
                strokeWidth={1}
                dash={[4, 4]}
                listening={false}
              />
            ) : null}
            {showFold
              ? Array.from({ length: foldNumber }, (_, i) => i + 1).map((_, index) => {
                  const x = bleedPx + (canvasW * (index + 1)) / (foldNumber + 1);
                  return (
                    <Line
                      key={`line-${index}`}
                      stroke='#3b82f6'
                      strokeWidth={1}
                      dash={[4, 4]}
                      listening={false}
                      points={[x, bleedPx, x, bleedPx + canvasH]}
                    />
                  );
                })
              : null}
          </Layer>

          {/* Nodes — offset so layer coords stay relative to the trim origin */}
          <Layer ref={nodeLayerRef} x={bleedPx} y={bleedPx}>
            {layers.map((layer) => {
              const nodeProps: NodeProps = { layer, interactive, ...buildNodeEventProps(layer.layer_id) };
              if (layer.type === LayerType.IMAGE) return <ImageNode key={layer.layer_id} {...nodeProps} />;
              if (layer.type === LayerType.SHAPE) return <ShapeNode key={layer.layer_id} {...nodeProps} />;
              return <TextNode key={layer.layer_id} {...nodeProps} />;
            })}

            {/* Hover highlight — derived from the live layer so it follows moves,
                resizes correctly, and disappears when the layer is deleted. */}
            {(() => {
              if (!interactive || !hoveredId || selectedIds.includes(hoveredId)) return null;
              const l = layers.find((x) => x.layer_id === hoveredId);
              if (!l) return null;
              const h = l.type === LayerType.TEXT ? Math.round(Number(l.font_size) * (Number(l.line_height) || 1.2)) : Number(l.height);
              return (
                <Rect
                  x={Number(l.position_x)}
                  y={Number(l.position_y)}
                  rotation={Number(l.rotation) || 0}
                  width={Number(l.width)}
                  height={h}
                  stroke='#6366f1'
                  strokeWidth={1}
                  dash={[4, 3]}
                  listening={false}
                />
              );
            })()}

            {/* Snap guides — shown only while dragging a node near an alignment edge/center */}
            {snapGuides.vertical.map((gx) => (
              <Line
                key={`snap-v-${gx}`}
                points={[gx, -bleedPx, gx, canvasH + bleedPx]}
                stroke='#0ea5e9'
                strokeWidth={1}
                dash={[4, 4]}
                listening={false}
              />
            ))}
            {snapGuides.horizontal.map((gy) => (
              <Line
                key={`snap-h-${gy}`}
                points={[-bleedPx, gy, canvasW + bleedPx, gy]}
                stroke='#0ea5e9'
                strokeWidth={1}
                dash={[4, 4]}
                listening={false}
              />
            ))}

            {/* Draw preview — a segment for lines, a bounding rect for every other shape */}
            {drawStart && drawCurrent && drawingShapeType === ShapeType.LINE ? (
              <Line
                points={[drawStart.x, drawStart.y, drawCurrent.x, drawCurrent.y]}
                stroke='#6366f1'
                strokeWidth={2}
                dash={[4, 3]}
                listening={false}
              />
            ) : drawStart && drawCurrent ? (
              <Rect
                x={Math.min(drawStart.x, drawCurrent.x)}
                y={Math.min(drawStart.y, drawCurrent.y)}
                width={Math.abs(drawCurrent.x - drawStart.x)}
                height={Math.abs(drawCurrent.y - drawStart.y)}
                stroke='#6366f1'
                strokeWidth={1}
                dash={[4, 3]}
                fill='rgba(99,102,241,0.1)'
                listening={false}
              />
            ) : null}

            {/* Rubber-band multi-select box */}
            {marqueeStart && marqueeCurrent ? (
              <Rect
                x={Math.min(marqueeStart.x, marqueeCurrent.x)}
                y={Math.min(marqueeStart.y, marqueeCurrent.y)}
                width={Math.abs(marqueeCurrent.x - marqueeStart.x)}
                height={Math.abs(marqueeCurrent.y - marqueeStart.y)}
                stroke='#6366f1'
                strokeWidth={1}
                fill='rgba(99,102,241,0.08)'
                listening={false}
              />
            ) : null}
          </Layer>

          {/* Transformer — same offset as the node layer */}
          <Layer x={bleedPx} y={bleedPx}>
            {interactive ? (
              <Transformer
                ref={transformerRef}
                rotateEnabled
                rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
                rotationSnapTolerance={5}
                anchorSize={8}
                borderStroke='#6366f1'
                anchorStroke='#6366f1'
                enabledAnchors={singleTextSelected ? ['middle-left', 'middle-right'] : undefined}
                anchorDragBoundFunc={handleAnchorDragBound}
                boundBoxFunc={(oldBox, newBox) => {
                  // boundBox is in screen px (already scaled); text needs a wider floor so it can't collapse.
                  const minW = singleTextSelected ? MIN_TEXT_WIDTH * scale : 5;
                  return newBox.width < minW || newBox.height < 5 ? oldBox : newBox;
                }}
              />
            ) : null}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
