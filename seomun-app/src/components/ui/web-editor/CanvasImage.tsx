import { ObjectType } from '@/enums/editor';
import { ImageObject } from '@/types';
import Konva from 'konva';
import React, { useEffect, useRef, useState } from 'react';
import { Image } from 'react-konva';

export const CanvasImage = ({
  obj,
  onSelect,
  onDragMove,
  onDragEnd,
  onTransformEnd,
  onLoad,
}: {
  obj: ImageObject;
  onSelect: () => void;
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
  onLoad?: () => void;
}) => {
  const [loadedImage, setLoadedImage] = useState<{ src: string; image: HTMLImageElement } | null>(null);
  const image = loadedImage?.src === obj.src ? loadedImage.image : null;
  const onLoadRef = useRef(onLoad);

  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  useEffect(() => {
    let cancelled = false;

    if (!obj.src) return;

    const loadImage = (crossOrigin?: 'anonymous') => {
      const img = new window.Image();
      if (crossOrigin) img.crossOrigin = crossOrigin;

      img.onload = () => {
        if (!cancelled) {
          setLoadedImage({ src: obj.src, image: img });
          onLoadRef.current?.();
        }
      };
      img.onerror = () => {
        // Some storage hosts do not return CORS headers. Retry without the
        // cross-origin request so the layer remains visible in the editor.
        if (crossOrigin && !cancelled) loadImage();
      };
      img.src = obj.src;
    };

    loadImage('anonymous');

    return () => {
      cancelled = true;
    };
  }, [obj.src]);

  const filters = [];
  if (obj.filters) {
    if (obj.filters.brightness !== 0) filters.push(Konva.Filters.Brighten);
    if (obj.filters.contrast !== 0) filters.push(Konva.Filters.Contrast);
    if (obj.filters.saturation !== 0) filters.push(Konva.Filters.HSV);
    if (obj.filters.blur !== 0) filters.push(Konva.Filters.Blur);
  }

  const imageRef = React.useRef<Konva.Image>(null);

  useEffect(() => {
    const node = imageRef.current;
    if (!node) return;

    if (filters.length > 0 && image) {
      node.clearCache();

      const timer = setTimeout(() => {
        if (node.getLayer()) {
          node.cache();
          node.getLayer()?.batchDraw();
        }
      }, 0);

      return () => clearTimeout(timer);
    } else {
      node.clearCache();
      node.getLayer()?.batchDraw();
    }
  }, [image, filters.length, obj.size.width, obj.size.height, obj.cropWidth, obj.cropHeight]);

  if (obj.type !== ObjectType.IMAGE) return null;

  return (
    <Image
      ref={imageRef}
      id={obj.id}
      x={obj.position.x}
      y={obj.position.y}
      width={obj.size.width}
      height={obj.size.height}
      image={image as CanvasImageSource}
      crop={
        obj.cropWidth > 0 && obj.cropHeight > 0
          ? { x: obj.cropX, y: obj.cropY, width: obj.cropWidth, height: obj.cropHeight }
          : undefined
      }
      rotation={obj.rotation}
      opacity={obj.opacity}
      filters={filters}
      brightness={obj.filters?.brightness ? obj.filters.brightness / 100 : 0}
      contrast={obj.filters?.contrast ? obj.filters.contrast : 0}
      saturation={obj.filters?.saturation ? (obj.filters.saturation + 100) / 100 : 1}
      blurRadius={obj.filters?.blur ? obj.filters.blur : 0}
      draggable={!obj.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    />
  );
};
