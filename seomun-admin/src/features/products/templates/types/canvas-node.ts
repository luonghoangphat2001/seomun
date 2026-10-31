import type Konva from 'konva';

import type { LayerFormValues } from '../schemas';

// === Konva node contracts ===
// Shared shapes for the per-layer Konva nodes (text / image / shape) rendered
// on the canvas. Kept separate from component prop types.

/** The event handlers every canvas node type receives, wired to Konva events. */
export interface NodeEventProps {
  onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDragStart: () => void;
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransform: (e: Konva.KonvaEventObject<Event>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
  onMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onContextMenu: (e: Konva.KonvaEventObject<PointerEvent>) => void;
}

/** Full props for a single canvas node component. */
export interface NodeProps extends NodeEventProps {
  layer: LayerFormValues;
  interactive: boolean;
}
