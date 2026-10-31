import type { LayerFormValues } from '../../schemas';

/**
 * Flat [x1, y1, ...] star/scallop points centred on the origin (0,0), apex up —
 * identical to the user web-editor's getStarPoints so scallops match exactly.
 * Used with a Konva <Line> whose x/y is the shape centre.
 */
export function originStarPoints(numPoints: number, innerRadius: number, outerRadius: number): number[] {
  const points: number[] = [];
  for (let i = 0; i < numPoints * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI * i) / numPoints - Math.PI / 2;
    points.push(radius * Math.cos(angle), radius * Math.sin(angle));
  }
  return points;
}

/** Checkerboard (transparent) placeholder pattern, built once. */
let checkerUrlCache: string | null = null;
export function checkerboardDataUrl(): string {
  if (checkerUrlCache) return checkerUrlCache;
  const size = 5;
  const canvas = document.createElement('canvas');
  canvas.width = size * 2;
  canvas.height = size * 2;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size * 2, size * 2);
    ctx.fillStyle = '#d8dee9';
    ctx.fillRect(0, 0, size, size);
    ctx.fillRect(size, size, size, size);
  }
  checkerUrlCache = canvas.toDataURL();
  return checkerUrlCache;
}

// Opacity/shadow/visibility apply the same way to every node type (Konva
// supports them natively on any Shape/Group), so build the props object once.
export function layerStyleProps(layer: LayerFormValues) {
  return {
    visible: layer.visible !== false,
    opacity: layer.opacity ?? 1,
    shadowColor: layer.shadow_color || undefined,
    shadowBlur: Number(layer.shadow_blur) || 0,
    shadowOffsetX: Number(layer.shadow_offset_x) || 0,
    shadowOffsetY: Number(layer.shadow_offset_y) || 0,
    shadowOpacity: layer.shadow_opacity ?? 1,
  };
}
