import type Konva from 'konva';

import { LayerType } from '../../enums';
import type { LayerFormValues } from '../../schemas';
import type { ResolvedGuide, SnapEdge } from '../../types';

// === Object snapping ===
// Snaps the dragged node's edges/center to the canvas bounds and to other
// layers' edges/center. Ignores rotation — bounding boxes are treated as
// axis-aligned, which matches every other shape (Rect/Ellipse/Line/Triangle
// share the same Group width/height regardless of rotation).
export const SNAP_OFFSET = 2;

export function layerBoundsHeight(l: LayerFormValues): number {
  return l.type === LayerType.TEXT ? Math.round(Number(l.font_size) * (Number(l.line_height) || 1.2)) : Number(l.height);
}

/**
 * Candidate stop values (edges + center) from the trim bounds, the bleed and safe
 * lines, and every other layer. All in content coords (trim top-left = 0,0), so the
 * bleed edges sit at ±bleedPx and the safe edges are inset by safePx.
 */
export function getLineGuideStops(skipIds: string[], allLayers: LayerFormValues[], canvasW: number, canvasH: number, bleedPx = 0, safePx = 0) {
  const vertical = [0, canvasW / 2, canvasW / 3, (canvasW * 2) / 3, canvasW / 4, (canvasW * 3) / 4, canvasW];
  const horizontal = [0, canvasH / 2, canvasH];

  if (bleedPx > 0) {
    vertical.push(-bleedPx, canvasW + bleedPx);
    horizontal.push(-bleedPx, canvasH + bleedPx);
  }
  if (safePx > 0) {
    vertical.push(safePx, canvasW - safePx);
    horizontal.push(safePx, canvasH - safePx);
  }

  allLayers.forEach((l) => {
    if (skipIds.includes(l.layer_id)) return;
    const x = Number(l.position_x);
    const y = Number(l.position_y);
    const w = Number(l.width);
    const h = layerBoundsHeight(l);
    vertical.push(x, x + w / 2, x + w);
    horizontal.push(y, y + h / 2, y + h);
  });

  return { vertical, horizontal };
}

/** The dragged node's own candidate edges, matched against the stops above. */
export function getObjectSnappingEdges(node: Konva.Node): { vertical: SnapEdge[]; horizontal: SnapEdge[] } {
  const x = node.x();
  const y = node.y();
  const w = node.width();
  const h = node.height();
  return {
    vertical: [
      { guide: x, offset: 0, snap: 'start' },
      { guide: x + w / 2, offset: w / 2, snap: 'center' },
      { guide: x + w, offset: w, snap: 'end' },
    ],
    horizontal: [
      { guide: y, offset: 0, snap: 'start' },
      { guide: y + h / 2, offset: h / 2, snap: 'center' },
      { guide: y + h, offset: h, snap: 'end' },
    ],
  };
}

/** Picks, per axis, the single closest stop within SNAP_OFFSET (if any). */
export function getGuides(
  lineGuideStops: { vertical: number[]; horizontal: number[] },
  itemBounds: ReturnType<typeof getObjectSnappingEdges>,
): ResolvedGuide[] {
  const collect = (stops: number[], edges: SnapEdge[]) =>
    stops.flatMap((lineGuide) =>
      edges.map((edge) => ({ lineGuide, offset: edge.offset, diff: Math.abs(lineGuide - edge.guide) })).filter((g) => g.diff < SNAP_OFFSET),
    );

  const bestV = collect(lineGuideStops.vertical, itemBounds.vertical).sort((a, b) => a.diff - b.diff)[0];
  const bestH = collect(lineGuideStops.horizontal, itemBounds.horizontal).sort((a, b) => a.diff - b.diff)[0];

  const guides: ResolvedGuide[] = [];
  if (bestV) guides.push({ lineGuide: bestV.lineGuide, offset: bestV.offset, orientation: 'V' });
  if (bestH) guides.push({ lineGuide: bestH.lineGuide, offset: bestH.offset, orientation: 'H' });
  return guides;
}
