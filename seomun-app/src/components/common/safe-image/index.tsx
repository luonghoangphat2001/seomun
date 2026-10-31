'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';

interface SafeImageProps extends ImageProps {
  fallback?: string;
}

export const SafeImage = ({ src, alt, fallback, ...props }: SafeImageProps) => {
  const [imgSrc, setImgSrc] = useState(src);
  const defaultFallback = '/images/no-image.png';

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={imgSrc || fallback || defaultFallback}
      alt={alt}
      onError={() => {
        setImgSrc(fallback || defaultFallback);
      }}
    />
  );
};
