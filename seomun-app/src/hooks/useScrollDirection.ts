'use client';
import { useEffect, useState } from 'react';

export interface UseScrollDirection {
  direction: 'up' | 'down';
}

export const useScrollDirection = () => {
  const [value, setValue] = useState<UseScrollDirection>({
    direction: 'up',
  });

  useEffect(() => {
    const container = document.querySelector('.scroll-container') as HTMLElement | null;
    let lastY = container ? container.scrollTop : window.scrollY;

    const onScroll = () => {
      const currentY = container ? container.scrollTop : window.scrollY;
      if (currentY > lastY && currentY > 50) {
        setValue({ direction: 'down' });
      } else {
        setValue({ direction: 'up' });
      }
      lastY = currentY;
    };

    const target = container || window;
    target.addEventListener('scroll', onScroll);
    return () => target.removeEventListener('scroll', onScroll);
  }, []);
  return value;
};
