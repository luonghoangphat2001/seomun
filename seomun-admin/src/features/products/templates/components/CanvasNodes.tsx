import { useEffect, useState } from 'react';
import { Circle, Group, Image as KonvaImage, Line, RegularPolygon, Rect, Star, Text as KonvaText } from 'react-konva';

import { ShapeType } from '../enums';
import type { NodeProps } from '../types';
import { checkerboardDataUrl, layerStyleProps, originStarPoints } from '../utils/helper';

// === Hooks ===

/** Konva needs an HTMLImageElement, not a URL. */
function useLoadedImage(src: string | undefined): HTMLImageElement | null {
  // Track which src the loaded image belongs to so a changed/empty src reads as
  // null during render — avoids a synchronous setState inside the effect.
  const [loaded, setLoaded] = useState<{ src: string; img: HTMLImageElement } | null>(null);

  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setLoaded({ src, img });
    img.src = src;
    return () => {
      img.onload = null;
    };
  }, [src]);

  return loaded && loaded.src === src ? loaded.img : null;
}

// === Background ===

export function BackgroundImage({ src, x = 0, y = 0, width, height }: { src: string; x?: number; y?: number; width: number; height: number }) {
  const image = useLoadedImage(src);
  if (!image) return null;
  return <KonvaImage image={image} x={x} y={y} width={width} height={height} listening={false} />;
}

// === Node components ===

export function TextNode({
  layer,
  interactive,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransform,
  onTransformEnd,
  onMouseEnter,
  onMouseLeave,
  onContextMenu,
}: NodeProps) {
  return (
    <KonvaText
      id={layer.layer_id}
      name='node'
      x={Number(layer.position_x)}
      y={Number(layer.position_y)}
      rotation={Number(layer.rotation) || 0}
      {...layerStyleProps(layer)}
      width={Number(layer.width)}
      text={layer.default_value || layer.field_key || 'Text'}
      fontFamily={layer.font_family || 'sans-serif'}
      fontSize={Number(layer.font_size)}
      fontStyle={layer.font_weight === '700' || layer.font_weight === 'bold' ? 'bold' : 'normal'}
      lineHeight={Number(layer.line_height) || 1}
      fill={layer.color || '#000000'}
      align={layer.align}
      draggable={interactive && !layer.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onTransform={onTransform}
      onTransformEnd={onTransformEnd}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onContextMenu={onContextMenu}
    />
  );
}

export function ImageNode({
  layer,
  interactive,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransform,
  onTransformEnd,
  onMouseEnter,
  onMouseLeave,
  onContextMenu,
}: NodeProps) {
  const image = useLoadedImage(layer.image_url);
  const checker = useLoadedImage(checkerboardDataUrl());
  const w = Number(layer.width);
  const h = Number(layer.height);

  // Wrap in a Group so the Transformer target node stays alive when the inner
  // content switches from placeholder Rect → KonvaImage on image load.
  return (
    <Group
      id={layer.layer_id}
      name='node'
      x={Number(layer.position_x)}
      y={Number(layer.position_y)}
      rotation={Number(layer.rotation) || 0}
      {...layerStyleProps(layer)}
      width={w}
      height={h}
      draggable={interactive && !layer.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onTransform={onTransform}
      onTransformEnd={onTransformEnd}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onContextMenu={onContextMenu}
    >
      {image ? (
        <KonvaImage width={w} height={h} image={image} />
      ) : (
        <Rect width={w} height={h} fillPatternImage={checker ?? undefined} fillPatternRepeat='repeat' fill={checker ? undefined : '#f1f5f9'} />
      )}
    </Group>
  );
}

export function ShapeNode({
  layer,
  interactive,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransform,
  onTransformEnd,
  onMouseEnter,
  onMouseLeave,
  onContextMenu,
}: NodeProps) {
  const w = Number(layer.width);
  const h = Number(layer.height);
  const fill = layer.color || '#94a3b8';
  const fillImg = useLoadedImage(layer.fill_image_url);
  // Border only applies to filled shapes — a line's own thickness is its "stroke".
  const border = { stroke: layer.stroke_color || undefined, strokeWidth: Number(layer.stroke_width) || 1 };

  // Outer radius fits the box (points reach the edges) so the shape stays inside
  // its w×h bounds — the transformer/hover box matches. The user editor sizes
  // shapes by corner radius (w/√2); template.service.ts converts the stored size
  // so the user app renders the same absolute shape. Inner radii keep the user
  // editor's inner/outer ratios (star_5 √2/4, star_4 √2/6, burst √2/3).
  const r = w / 2;
  const cx = w / 2;
  const cy = h / 2;

  // Fill = solid color, or (when set) an image covering the shape. `diameter` is
  // the shape's bounding size; a centered origin offsets the pattern to the image
  // centre, a top-left origin (rect) uses 0,0.
  const fillProps = (diameter: number, centered: boolean) =>
    fillImg
      ? {
          fillPatternImage: fillImg,
          fillPatternScaleX: diameter / fillImg.width,
          fillPatternScaleY: diameter / fillImg.height,
          fillPatternOffsetX: centered ? fillImg.width / 2 : 0,
          fillPatternOffsetY: centered ? fillImg.height / 2 : 0,
          fillPatternRepeat: 'no-repeat' as const,
        }
      : { fill };

  let shape;
  switch (layer.shape_type) {
    case ShapeType.ROUNDED_RECTANGLE:
      shape = <Rect width={w} height={h} cornerRadius={20} {...fillProps(w, false)} {...border} />;
      break;
    case ShapeType.CIRCLE:
    case ShapeType.ELLIPSE: // legacy
      shape = <Circle x={cx} y={cy} radius={r} {...fillProps(w, true)} {...border} />;
      break;
    case ShapeType.TRIANGLE:
      shape = <RegularPolygon x={cx} y={cy} sides={3} radius={r} {...fillProps(w, true)} {...border} />;
      break;
    case ShapeType.TRIANGLE_DOWN:
      shape = <RegularPolygon x={cx} y={cy} sides={3} radius={r} rotation={180} {...fillProps(w, true)} {...border} />;
      break;
    case ShapeType.DIAMOND:
      shape = <RegularPolygon x={cx} y={cy} sides={4} radius={r} {...fillProps(w, true)} {...border} />;
      break;
    case ShapeType.STAR_5:
      shape = <Star x={cx} y={cy} numPoints={5} innerRadius={r * 0.354} outerRadius={r} {...fillProps(w, true)} {...border} />;
      break;
    case ShapeType.STAR_4:
      shape = <Star x={cx} y={cy} numPoints={4} innerRadius={r * 0.236} outerRadius={r} {...fillProps(w, true)} {...border} />;
      break;
    case ShapeType.STAR_6:
      shape = <Star x={cx} y={cy} numPoints={6} innerRadius={r * 0.354} outerRadius={r} {...fillProps(w, true)} {...border} />;
      break;
    case ShapeType.BURST_12:
      shape = <Star x={cx} y={cy} numPoints={12} innerRadius={r * 0.471} outerRadius={r} {...fillProps(w, true)} {...border} />;
      break;
    case ShapeType.SCALLOP_1:
      shape = <Line x={cx} y={cy} points={originStarPoints(10, r * 0.75, r)} closed tension={0.5} {...fillProps(w, true)} {...border} />;
      break;
    case ShapeType.SCALLOP_2:
      shape = <Line x={cx} y={cy} points={originStarPoints(10, r * 0.9, r)} closed tension={0.5} {...fillProps(w, true)} {...border} />;
      break;
    case ShapeType.POLYGON: // legacy
      shape = <RegularPolygon x={cx} y={cy} sides={Number(layer.polygon_sides) || 6} radius={r} {...fillProps(w, true)} {...border} />;
      break;
    case ShapeType.LINE: // legacy
      shape = <Line x={cx} y={cy} points={[-w / 2, 0, w / 2, 0]} stroke={fill} strokeWidth={Math.max(h, 2)} hitStrokeWidth={Math.max(h, 12)} />;
      break;
    default:
      shape = <Rect width={w} height={h} {...fillProps(w, false)} {...border} />;
  }

  return (
    <Group
      id={layer.layer_id}
      name='node'
      x={Number(layer.position_x)}
      y={Number(layer.position_y)}
      rotation={Number(layer.rotation) || 0}
      {...layerStyleProps(layer)}
      width={w}
      height={h}
      draggable={interactive && !layer.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onTransform={onTransform}
      onTransformEnd={onTransformEnd}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onContextMenu={onContextMenu}
    >
      {shape}
    </Group>
  );
}
