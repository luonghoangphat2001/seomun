'use client';
import { LenisRef, ReactLenis } from 'lenis/react';
import { useEffect, useRef } from 'react';

export const SmoothScrolling = ({ children }: { children: React.ReactNode }) => {
  const lenisRef = useRef<LenisRef>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Wait for lenis instance to be available
    const checkLenis = setInterval(() => {
      const lenis = lenisRef.current?.lenis;
      if (lenis) {
        clearInterval(checkLenis);

        // Recalculate scroll bounds on resize
        const handleResize = () => {
          lenis.resize();
        };

        // Recalculate when content changes (debounced to avoid excessive calls)
        const observer = new MutationObserver(() => {
          if (resizeTimeoutRef.current) {
            clearTimeout(resizeTimeoutRef.current);
          }
          resizeTimeoutRef.current = setTimeout(() => {
            if (lenis) {
              lenis.resize();
            }
          }, 150);
        });

        window.addEventListener('resize', handleResize);
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class'],
        });

        // Initial resize after mount to ensure proper bounds calculation
        const timeoutId = setTimeout(() => {
          lenis.resize();
        }, 100);

        // Store cleanup function
        cleanupRef.current = () => {
          window.removeEventListener('resize', handleResize);
          observer.disconnect();
          clearTimeout(timeoutId);
          if (resizeTimeoutRef.current) {
            clearTimeout(resizeTimeoutRef.current);
          }
        };
      }
    }, 50);

    // Fallback cleanup after 5 seconds
    const fallbackTimeout = setTimeout(() => {
      clearInterval(checkLenis);
    }, 5000);

    return () => {
      clearInterval(checkLenis);
      clearTimeout(fallbackTimeout);
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        lerp: 0.1,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      }}>
      {children}
    </ReactLenis>
  );
};
