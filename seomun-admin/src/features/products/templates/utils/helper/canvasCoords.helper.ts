import type Konva from 'konva';

import { SNAP_OFFSET } from './snapping.helper';

/**
 * Pointer position in content coords (trim top-left = 0,0). getPointerPosition()
 * returns CSS-pixel coords relative to the canvas element, so divide by the stage
 * scale and subtract the bleed offset.
 */
export function toContentCoords(stage: Konva.Stage, bleedPx: number): { x: number; y: number } | null {
  const pos = stage.getPointerPosition();
  if (!pos) return null;
  return { x: Math.round(pos.x / stage.scaleX() - bleedPx), y: Math.round(pos.y / stage.scaleY() - bleedPx) };
}

/**
 * Snap one absolute (stage-screen) coordinate to the nearest content-space stop.
 * Guide stops are content px; screen = (content + bleed) × scale — so is the tolerance.
 */
export function snapAbsToStops(absVal: number, contentStops: number[], scale: number, bleedPx: number): { value: number; guide: number | null } {
  const tol = SNAP_OFFSET * scale;
  let best = { value: absVal, guide: null as number | null, diff: tol };
  for (const s of contentStops) {
    const absStop = (s + bleedPx) * scale;
    const diff = Math.abs(absStop - absVal);
    if (diff < best.diff) best = { value: absStop, guide: s, diff };
  }
  return { value: best.value, guide: best.guide };
}
