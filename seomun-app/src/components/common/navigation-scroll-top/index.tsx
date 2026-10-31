'use client';

import { useLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export const NavigationScrollTop = () => {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    const scrollToTop = () => {
      lenis?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    };

    scrollToTop();
    const animationFrame = requestAnimationFrame(scrollToTop);

    return () => cancelAnimationFrame(animationFrame);
  }, [lenis, pathname]);

  return null;
};
