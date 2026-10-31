import { useEffect, useRef, useState } from 'react';
import { Image } from 'react-konva';

export const CanvasBackgroundImage = ({
  src,
  x,
  y,
  width,
  height,
  backgroundSize = 'cover',
  onLoad,
}: {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundSize?: 'cover' | 'contain' | 'fill';
  onLoad?: () => void;
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const onLoadRef = useRef(onLoad);

  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  useEffect(() => {
    if (!src) return;

    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      setImage(img);
      onLoadRef.current?.();
    };
    img.src = src;

    return () => {
      img.onload = null;
    };
  }, [src]);

  if (!image) return null;

  // Calculate rendering size and position
  let renderWidth = width;
  let renderHeight = height;
  let renderX = x;
  let renderY = y;
  let crop: { x: number; y: number; width: number; height: number } | undefined;

  const imageRatio = image.width / image.height;
  const canvasRatio = width / height;

  if (backgroundSize === 'cover') {
    if (imageRatio > canvasRatio) {
      // Image is wider than canvas ratio
      const scaledWidth = image.height * canvasRatio;
      crop = {
        x: (image.width - scaledWidth) / 2,
        y: 0,
        width: scaledWidth,
        height: image.height,
      };
    } else {
      // Image is taller than canvas ratio
      const scaledHeight = image.width / canvasRatio;
      crop = {
        x: 0,
        y: (image.height - scaledHeight) / 2,
        width: image.width,
        height: scaledHeight,
      };
    }
  } else if (backgroundSize === 'contain') {
    if (imageRatio > canvasRatio) {
      // Image is wider than canvas ratio
      renderHeight = width / imageRatio;
      renderY = y + (height - renderHeight) / 2;
    } else {
      // Image is taller than canvas ratio
      renderWidth = height * imageRatio;
      renderX = x + (width - renderWidth) / 2;
    }
  }

  return (
    <Image
      id='canvas-background-image'
      x={renderX}
      y={renderY}
      width={renderWidth}
      height={renderHeight}
      image={image}
      crop={crop}
      listening={false}
    />
  );
};
