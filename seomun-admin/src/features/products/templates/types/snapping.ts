// === Object snapping ===
// Interfaces for aligning a dragged/resized node's edges and center to the
// canvas bounds and to other layers' edges.

/** One candidate edge of the moving node, matched against alignment stops. */
export interface SnapEdge {
  guide: number;
  offset: number;
  snap: 'start' | 'center' | 'end';
}

/** A resolved alignment line the node snapped to, per axis. */
export interface ResolvedGuide {
  lineGuide: number;
  offset: number;
  orientation: 'V' | 'H';
}
