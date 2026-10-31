'use client';

import { CHECKERBOARD } from '@/constants/web-editor';
import { clamp, cn } from '@/lib/utils';
import { hexToHsva, hsvaToHex, hueOnlyHex } from '@/lib/utils/color';
import { ColorPickerProps } from '@/types/web-editor';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Slider } from './Slider';

export const ColorPicker = ({ value, onChange, label, className }: ColorPickerProps) => {
  const [hsva, setHsva] = useState(() => hexToHsva(value || '#4F46E5'));
  const [hexInput, setHexInput] = useState((value || '#4F46E5').slice(1, 7).toUpperCase());
  const [prevValue, setPrevValue] = useState(value);

  if (value && value !== prevValue) {
    setPrevValue(value);
    const next = hexToHsva(value);
    setHsva(next);
    setHexInput(value.slice(1, 7).toUpperCase());
  }

  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerDragging = useRef(false);

  const commitHsva = useCallback(
    (next: typeof hsva) => {
      setHsva(next);
      const hex = hsvaToHex(next.h, next.s, next.v, next.a);
      setHexInput(hex.slice(1, 7));
      onChange(hex);
    },
    [onChange],
  );

  const updateFromPicker = useCallback(
    (clientX: number, clientY: number) => {
      if (!pickerRef.current) return;
      const rect = pickerRef.current.getBoundingClientRect();
      const s = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
      const v = clamp(100 - ((clientY - rect.top) / rect.height) * 100, 0, 100);
      commitHsva({ ...hsva, s, v });
    },
    [hsva, commitHsva],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (pickerDragging.current) updateFromPicker(e.clientX, e.clientY);
    };
    const onUp = () => {
      pickerDragging.current = false;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [updateFromPicker]);

  const handleHexInput = (raw: string) => {
    const v = raw
      .replace(/[^0-9a-fA-F]/g, '')
      .slice(0, 6)
      .toUpperCase();
    setHexInput(v);
    if (v.length === 6) {
      const next = hexToHsva('#' + v);
      setHsva({ ...next, a: hsva.a });
      onChange('#' + v);
    }
  };

  const currentHex = hsvaToHex(hsva.h, hsva.s, hsva.v);
  const hueHex = hueOnlyHex(hsva.h);

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {label && <label className='body-14 text-text-main font-medium'>{label}</label>}

      {/* 2D gradient picker */}
      <div
        ref={pickerRef}
        onMouseDown={(e) => {
          pickerDragging.current = true;
          updateFromPicker(e.clientX, e.clientY);
        }}
        className='relative h-40 w-full cursor-crosshair rounded-sm select-none'
        style={{ backgroundColor: hueHex }}>
        <div
          className='pointer-events-none absolute inset-0 rounded-sm'
          style={{ background: 'linear-gradient(to right, #fff, transparent)' }}
        />
        <div
          className='pointer-events-none absolute inset-0 rounded-sm'
          style={{ background: 'linear-gradient(to bottom, transparent, #000)' }}
        />
        <div
          className='pointer-events-none absolute size-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md'
          style={{ left: `${hsva.s}%`, top: `${100 - hsva.v}%`, backgroundColor: currentHex }}
        />
      </div>

      {/* Hue slider */}
      <Slider
        value={hsva.h}
        min={0}
        max={360}
        onChange={(h) => commitHsva({ ...hsva, h })}
        thumbColor='white'
        trackContent={
          <div
            className='h-full w-full'
            style={{
              background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
            }}
          />
        }
      />

      {/* Alpha slider */}
      <Slider
        value={hsva.a}
        min={0}
        max={100}
        onChange={(a) => commitHsva({ ...hsva, a })}
        thumbColor='white'
        trackContent={
          <>
            <div className='absolute inset-0' style={{ backgroundImage: CHECKERBOARD }} />
            <div className='absolute inset-0' style={{ background: `linear-gradient(to right, transparent, ${currentHex})` }} />
          </>
        }
      />

      <div className='flex items-center gap-2'>
        <div className='border-border-soft flex items-center gap-1 rounded border px-2 py-1.5'>
          <span className='body-14 text-text-main'>Hex</span>
          <div className='text-text-secondary flex flex-col leading-none'>
            <svg width='10' height='6' viewBox='0 0 10 6' fill='none'>
              <path d='M1 5L5 1L9 5' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
            <svg width='10' height='6' viewBox='0 0 10 6' fill='none'>
              <path d='M1 1L5 5L9 1' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
          </div>
        </div>

        <div className='border-border-soft flex flex-1 items-center gap-0.5 rounded border px-2 py-1.5'>
          <span className='body-14 text-text-secondary'>#</span>
          <input
            className='body-14 w-full bg-transparent uppercase outline-none'
            value={hexInput}
            onChange={(e) => handleHexInput(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div className='border-border-soft w-14 rounded border px-2 py-1.5'>
          <input
            className='body-14 w-full bg-transparent text-center outline-none'
            value={`${hsva.a}%`}
            onChange={(e) => {
              const n = parseInt(e.target.value.replace('%', ''));
              if (!isNaN(n)) setHsva((prev) => ({ ...prev, a: clamp(n, 0, 100) }));
            }}
          />
        </div>
      </div>
    </div>
  );
};
