'use client';

import { clampPct } from '@/lib/utils/color';
import { SliderProps } from '@/types/web-editor';
import { useCallback, useEffect, useRef } from 'react';

export const Slider = ({ value, min = 0, max = 100, onChange, trackContent, thumbColor }: SliderProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const update = useCallback(
    (clientX: number) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const pct = clampPct(((clientX - rect.left) / rect.width) * 100);
      onChange(min + (pct / 100) * (max - min));
    },
    [min, max, onChange],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragging.current) update(e.clientX);
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [update]);

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div
      ref={ref}
      onMouseDown={(e) => {
        dragging.current = true;
        update(e.clientX);
      }}
      className='relative h-3 w-full cursor-pointer select-none'>
      <div className='absolute inset-0 overflow-hidden rounded-full'>{trackContent}</div>
      <div
        className='pointer-events-none absolute top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md'
        style={{ left: `${pct}%`, backgroundColor: thumbColor ?? 'white' }}
      />
    </div>
  );
};
