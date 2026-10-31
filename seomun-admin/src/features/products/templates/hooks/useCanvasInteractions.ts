import type Konva from 'konva';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { MIN_TEXT_WIDTH } from '../constants';
import { LayerType, ShapeType } from '../enums';
import type { LayerFormValues } from '../schemas';
import type { NodeEventProps } from '../types';
import { getGuides, getLineGuideStops, getObjectSnappingEdges, snapAbsToStops, toContentCoords } from '../utils/helper';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Axis-aligned overlap test — any touch counts as a hit. */
function rectsIntersect(a: Rect, b: Rect): boolean {
  return !(b.x > a.x + a.width || b.x + b.width < a.x || b.y > a.y + a.height || b.y + b.height < a.y);
}

interface UseCanvasInteractionsParams {
  layers: LayerFormValues[];
  canvasW: number;
  canvasH: number;
  bleedPx: number;
  safePx: number;
  selectedIds: string[];
  interactive: boolean;
  drawingShapeType: ShapeType | null;
  onSelect: (id: string | null, additive?: boolean) => void;
  onMarqueeSelect?: (ids: string[]) => void;
  onChange: (id: string, patch: Partial<LayerFormValues>) => void;
  onContextMenu?: (id: string, x: number, y: number) => void;
  onCanvasContextMenu?: (screenX: number, screenY: number, canvasX: number, canvasY: number) => void;
  onDrawComplete?: (type: ShapeType, x: number, y: number, w: number, h: number, rotation?: number) => void;
}

/**
 * Owns all interactive canvas state (fit scale, hover, draw, marquee, snap guides)
 * plus the pointer/transform handlers. Kept out of the component so the stage is
 * just refs + JSX; every handler still closes over the current props/state.
 */
export function useCanvasInteractions({
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
}: UseCanvasInteractionsParams) {
  // === Refs ===
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeLayerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // === State ===
  const [scale, setScale] = useState(1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);
  const drawCurrentRef = useRef(drawCurrent);
  const [snapGuides, setSnapGuides] = useState<{ vertical: number[]; horizontal: number[] }>({ vertical: [], horizontal: [] });
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
  const [marqueeCurrent, setMarqueeCurrent] = useState<{ x: number; y: number } | null>(null);
  const marqueeCurrentRef = useRef(marqueeCurrent);

  // === Derived ===
  // Artboard includes the bleed margin; trim card sits inset by bleed.
  const artW = canvasW + bleedPx * 2;
  const artH = canvasH + bleedPx * 2;

  // === Effects ===
  // Fit canvas inside its container.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const recompute = () => {
      const availW = el.clientWidth - 32; // padding allowance
      const availH = el.clientHeight - 32;
      if (availW <= 0 || availH <= 0) return;
      setScale(Math.max(Math.min(availW / artW, availH / artH, 3), 0.05));
    };

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [artW, artH]);

  // Keep drawCurrentRef fresh so the window mouseup handler always sees the latest position.
  useEffect(() => {
    drawCurrentRef.current = drawCurrent;
  }, [drawCurrent]);

  // Commit the drawn shape when mouse is released anywhere (including outside the stage).
  useEffect(() => {
    if (!drawStart || !drawingShapeType) return;
    const onUp = () => {
      const end = drawCurrentRef.current ?? drawStart;
      setDrawStart(null);
      setDrawCurrent(null);

      // A line isn't a bounding box — it's a segment from the drag start to the
      // drag end, so length + angle (not w/h) describe it.
      if (drawingShapeType === ShapeType.LINE) {
        const dx = end.x - drawStart.x;
        const dy = end.y - drawStart.y;
        const length = Math.hypot(dx, dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        onDrawComplete?.(drawingShapeType, drawStart.x, drawStart.y, length, 1, angle);
        return;
      }

      const x = Math.min(drawStart.x, end.x);
      const y = Math.min(drawStart.y, end.y);
      const w = Math.abs(end.x - drawStart.x);
      const h = Math.abs(end.y - drawStart.y);
      onDrawComplete?.(drawingShapeType, x, y, w, h);
    };
    window.addEventListener('mouseup', onUp);
    return () => window.removeEventListener('mouseup', onUp);
  }, [drawStart, drawingShapeType, onDrawComplete]);

  // Keep marqueeCurrentRef fresh so the window mouseup handler always sees the latest position.
  useEffect(() => {
    marqueeCurrentRef.current = marqueeCurrent;
  }, [marqueeCurrent]);

  // Commit the rubber-band selection when mouse is released anywhere. A near-zero
  // drag is treated as a plain click on empty canvas (deselect) instead.
  useEffect(() => {
    if (!marqueeStart) return;
    const onUp = () => {
      const end = marqueeCurrentRef.current ?? marqueeStart;
      const dist = Math.hypot(end.x - marqueeStart.x, end.y - marqueeStart.y);
      setMarqueeStart(null);
      setMarqueeCurrent(null);

      if (dist < 3) {
        onSelect(null);
        return;
      }

      const marqueeRect: Rect = {
        x: Math.min(marqueeStart.x, end.x),
        y: Math.min(marqueeStart.y, end.y),
        width: Math.abs(end.x - marqueeStart.x),
        height: Math.abs(end.y - marqueeStart.y),
      };
      const nodeLayer = nodeLayerRef.current;
      const hitIds = nodeLayer
        ? layers
            .filter((l) => !l.locked)
            .filter((l) => {
              const node = nodeLayer.findOne(`#${l.layer_id}`);
              // getClientRect(relativeTo: layer) = the node's real bounding box in content
              // coords, so rotation/scale are respected — any overlap with the box counts.
              return node ? rectsIntersect(marqueeRect, node.getClientRect({ relativeTo: nodeLayer })) : false;
            })
            .map((l) => l.layer_id)
        : [];
      onMarqueeSelect?.(hitIds);
    };
    window.addEventListener('mouseup', onUp);
    return () => window.removeEventListener('mouseup', onUp);
  }, [marqueeStart, layers, onSelect, onMarqueeSelect]);

  // Attach the transformer to every selected, unlocked node and re-sync its
  // handles, in one layout effect that always runs together. Splitting
  // "attach" (on selection change) from "resync" (every render) into a
  // passive useEffect + a layout effect let the resync run first, against the
  // *previous* node's transform — the new node's handles would flash the old
  // node's rotation for a frame.
  useLayoutEffect(() => {
    const transformer = transformerRef.current;
    const nodeLayer = nodeLayerRef.current;
    if (!transformer || !nodeLayer) return;
    const nodes = interactive
      ? selectedIds
          .filter((id) => !layers.find((l) => l.layer_id === id)?.locked)
          .map((id) => nodeLayer.findOne(`#${id}`))
          .filter((n): n is Konva.Node => !!n)
      : [];
    transformer.nodes(nodes);
    transformer.forceUpdate();
    transformer.getLayer()?.batchDraw();
  });

  // === Handlers ===
  // Snap the anchor being dragged (during resize) to alignment guides. Only the
  // axes the active anchor actually moves are snapped, so a middle handle doesn't
  // get yanked on its fixed axis.
  const handleAnchorDragBound = (_oldPos: { x: number; y: number }, newPos: { x: number; y: number }) => {
    const anchor = transformerRef.current?.getActiveAnchor();
    if (!anchor || anchor === 'rotater') return newPos;

    const stops = getLineGuideStops(selectedIds, layers, canvasW, canvasH, bleedPx, safePx);
    const snapX = anchor.includes('left') || anchor.includes('right');
    const snapY = anchor.includes('top') || anchor.includes('bottom');
    const vx = snapX ? snapAbsToStops(newPos.x, stops.vertical, scale, bleedPx) : { value: newPos.x, guide: null };
    const vy = snapY ? snapAbsToStops(newPos.y, stops.horizontal, scale, bleedPx) : { value: newPos.y, guide: null };

    setSnapGuides({ vertical: vx.guide != null ? [vx.guide] : [], horizontal: vy.guide != null ? [vy.guide] : [] });
    return { x: vx.value, y: vy.value };
  };

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (drawingShapeType) {
      const stage = e.target.getStage();
      if (stage) {
        const pt = toContentCoords(stage, bleedPx);
        if (pt) setDrawStart(pt);
      }
      return;
    }
    if (interactive && (e.target === e.target.getStage() || e.target.name() === 'background')) {
      // Start a potential rubber-band selection; a near-zero drag on mouseup
      // is reinterpreted as a plain deselect click (see the marquee effect).
      const stage = e.target.getStage();
      if (stage) {
        const pt = toContentCoords(stage, bleedPx);
        if (pt) {
          setMarqueeStart(pt);
          setMarqueeCurrent(pt);
        }
      }
    }
  };

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    if (drawStart) {
      const pt = toContentCoords(stage, bleedPx);
      if (pt) setDrawCurrent(pt);
    }
    if (marqueeStart) {
      const pt = toContentCoords(stage, bleedPx);
      if (pt) setMarqueeCurrent(pt);
    }
  };

  // Right-click on empty canvas (not a node) opens the canvas-level menu (e.g. Paste).
  // Node-level right-clicks are handled by each node's own onContextMenu instead.
  const handleStageContextMenu = (e: Konva.KonvaEventObject<PointerEvent>) => {
    if (e.target !== e.target.getStage() && e.target.name() !== 'background') return;
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage || !onCanvasContextMenu) return;
    const pt = toContentCoords(stage, bleedPx);
    if (pt) onCanvasContextMenu(e.evt.clientX, e.evt.clientY, pt.x, pt.y);
  };

  // Build the shared event handlers for a single layer id.
  // These are recreated per-render (same as before); stable enough for Konva.
  const buildNodeEventProps = (id: string): NodeEventProps => ({
    onSelect: (e) => onSelect(id, e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey),
    onDragStart: () => {
      setHoveredId(null);
      // Dragging a node outside the current selection selects (replaces) it first.
      if (!selectedIds.includes(id)) onSelect(id);
    },
    onDragMove: (e) => {
      const node = e.target;

      // Group drag: Konva's Transformer moves every attached node together, so
      // there's nothing to do here — and snapping one node while the rest move
      // with it would only fight Konva. Snapping stays for single selection.
      if (selectedIds.length > 1 && selectedIds.includes(id)) return;

      const lineGuideStops = getLineGuideStops([id], layers, canvasW, canvasH, bleedPx, safePx);
      const itemBounds = getObjectSnappingEdges(node);
      const guides = getGuides(lineGuideStops, itemBounds);

      if (!guides.length) {
        setSnapGuides({ vertical: [], horizontal: [] });
        return;
      }
      guides.forEach((g) => {
        if (g.orientation === 'V') node.x(g.lineGuide - g.offset);
        else node.y(g.lineGuide - g.offset);
      });
      setSnapGuides({
        vertical: guides.filter((g) => g.orientation === 'V').map((g) => g.lineGuide),
        horizontal: guides.filter((g) => g.orientation === 'H').map((g) => g.lineGuide),
      });
    },
    onDragEnd: () => {
      setSnapGuides({ vertical: [], horizontal: [] });
      // Konva group-drags every attached node, so read each selected node's final
      // position back from the layer and commit them all (single drag: just this id).
      const ids = selectedIds.includes(id) ? selectedIds : [id];
      ids.forEach((sid) => {
        const n = nodeLayerRef.current?.findOne(`#${sid}`);
        if (n) onChange(sid, { position_x: Math.round(n.x()), position_y: Math.round(n.y()) });
      });
    },
    onMouseEnter: (e) => {
      if (drawingShapeType) return;
      const stage = e.target.getStage();
      const locked = layers.find((l) => l.layer_id === id)?.locked;
      if (stage) stage.container().style.cursor = !interactive ? 'pointer' : locked ? 'not-allowed' : 'move';
      setHoveredId(id);
    },
    onMouseLeave: (e) => {
      const stage = e.target.getStage();
      if (stage) stage.container().style.cursor = drawingShapeType ? 'crosshair' : 'default';
      setHoveredId(null);
    },
    onContextMenu: (e) => {
      e.evt.preventDefault();
      onContextMenu?.(id, e.evt.clientX, e.evt.clientY);
    },
    onTransform: (e) => {
      const layer = layers.find((l) => l.layer_id === id);
      if (layer?.type !== LayerType.TEXT) return;
      const node = e.target;
      node.setAttrs({ width: Math.max(MIN_TEXT_WIDTH, node.width() * node.scaleX()), scaleX: 1, scaleY: 1 });
    },
    onTransformEnd: (e) => {
      setSnapGuides({ vertical: [], horizontal: [] });
      const node = e.target;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);

      const layer = layers.find((l) => l.layer_id === id);
      const rotation = Math.round(node.rotation());
      if (layer?.type === LayerType.TEXT) {
        // Text height is auto: width drives wrapping, vertical drag scales the font.
        onChange(id, {
          position_x: Math.round(node.x()),
          position_y: Math.round(node.y()),
          rotation,
          width: Math.max(MIN_TEXT_WIDTH, Math.round(node.width() * scaleX)),
        });
        return;
      }

      // Both shapes and images are Group nodes — node.width() returns the Group's stored
      // width attr (= layer.width), same result as reading layer directly.
      const baseW = Number(layer?.width ?? node.width());
      const baseH = Number(layer?.height ?? node.height());
      onChange(id, {
        position_x: Math.round(node.x()),
        position_y: Math.round(node.y()),
        rotation,
        width: Math.max(5, Math.round(baseW * scaleX)),
        height: Math.max(5, Math.round(baseH * scaleY)),
      });
    },
  });

  return {
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
  };
}
