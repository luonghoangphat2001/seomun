import { Pipette } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/utils/cn';

// === Types ===

interface HSV {
  h: number; // 0–360
  s: number; // 0–100
  v: number; // 0–100
}

export interface AppColorPickerProps {
  /** Current hex color (e.g. "#7b2828"). Empty falls back to `fallback`. */
  value: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
  /** Extra classes for the trigger swatch (size/shape). */
  className?: string;
  /** Shown when `value` is empty. */
  fallback?: string;
}

// === Color math (standard HSV ↔ RGB ↔ hex) ===

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

const toHex = (n: number) =>
  Math.round(clamp(n, 0, 255))
    .toString(16)
    .padStart(2, '0');
const rgbToHex = (r: number, g: number, b: number) => `#${toHex(r)}${toHex(g)}${toHex(b)}`;

function rgbToHsv(r: number, g: number, b: number): HSV {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: (max === 0 ? 0 : d / max) * 100, v: max * 100 };
}

function hsvToRgb({ h, s, v }: HSV): { r: number; g: number; b: number } {
  s /= 100;
  v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g] = [c, x];
  else if (h < 120) [r, g] = [x, c];
  else if (h < 180) [g, b] = [c, x];
  else if (h < 240) [g, b] = [x, c];
  else if (h < 300) [r, b] = [x, c];
  else [r, b] = [c, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

const hsvToHex = (hsv: HSV) => {
  const { r, g, b } = hsvToRgb(hsv);
  return rgbToHex(r, g, b);
};

// === Component ===

export function AppColorPicker({ value, onChange, disabled = false, className, fallback = '#ffffff' }: AppColorPickerProps) {
  // === Refs ===
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const hsvRef = useRef<HSV>({ h: 0, s: 0, v: 0 });

  // === State ===
  const [hsv, setHsv] = useState<HSV>(() => {
    const rgb = hexToRgb(value || fallback);
    return rgb ? rgbToHsv(rgb.r, rgb.g, rgb.b) : { h: 0, s: 0, v: 0 };
  });
  const [hexText, setHexText] = useState('');

  // === Derived ===
  const derivedHex = hsvToHex(hsv);
  const rgb = hsvToRgb(hsv);
  const supportsEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;

  // === Functions ===
  // Push a new HSV to state + notify parent. Updates the ref synchronously so a
  // fast drag's next pointer event reads the latest value, not a stale closure.
  const emit = (next: HSV) => {
    hsvRef.current = next;
    setHsv(next);
    onChange(hsvToHex(next));
  };

  const handleSv = (clientX: number, clientY: number) => {
    const el = svRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clamp((clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((clientY - rect.top) / rect.height, 0, 1);
    emit({ ...hsvRef.current, s: x * 100, v: (1 - y) * 100 });
  };

  const handleHue = (clientX: number) => {
    const el = hueRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    emit({ ...hsvRef.current, h: clamp((clientX - rect.left) / rect.width, 0, 1) * 360 });
  };

  const startDrag = (surface: 'sv' | 'hue') => (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    const run = (cx: number, cy: number) => (surface === 'sv' ? handleSv(cx, cy) : handleHue(cx));
    run(e.clientX, e.clientY);
    const move = (ev: PointerEvent) => run(ev.clientX, ev.clientY);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const handleHexInput = (raw: string) => {
    setHexText(raw);
    const parsed = hexToRgb(raw);
    if (parsed) emit(rgbToHsv(parsed.r, parsed.g, parsed.b));
  };

  const handleChannel = (channel: 'r' | 'g' | 'b', raw: string) => {
    const n = clamp(parseInt(raw, 10) || 0, 0, 255);
    const next = { r: rgb.r, g: rgb.g, b: rgb.b, [channel]: n };
    emit(rgbToHsv(next.r, next.g, next.b));
  };

  const pickEyeDropper = async () => {
    try {
      // @ts-expect-error EyeDropper is not yet in TS DOM lib
      const result = await new window.EyeDropper().open();
      const parsed = hexToRgb(result.sRGBHex);
      if (parsed) emit(rgbToHsv(parsed.r, parsed.g, parsed.b));
    } catch {
      // user cancelled — ignore
    }
  };

  // === Effects ===
  // Keep the ref in sync for drags that start after an external value change.
  useEffect(() => {
    hsvRef.current = hsv;
  }, [hsv]);

  // Re-sync internal HSV when the incoming value changes to a different color
  // than we're already showing (e.g. reset, or a sibling swatch cleared it).
  useEffect(() => {
    const incoming = (value || fallback).toLowerCase();
    if (incoming !== hsvToHex(hsvRef.current).toLowerCase()) {
      const parsed = hexToRgb(incoming);
      if (parsed) setHsv(rgbToHsv(parsed.r, parsed.g, parsed.b));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Mirror the normalized hex into the editable text field.
  useEffect(() => {
    setHexText(derivedHex);
  }, [derivedHex]);

  // === Render ===
  const numberInputClass =
    'w-full rounded border px-1 py-1 text-center text-xs outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type='button'
          disabled={disabled}
          aria-label='Pick color'
          className={cn('cursor-pointer rounded border disabled:cursor-not-allowed disabled:opacity-50', className)}
          style={{ backgroundColor: value || fallback }}
        />
      </PopoverTrigger>
      <PopoverContent align='start' className='w-64 p-3'>
        <div className='space-y-3'>
          {/* Saturation / Value square */}
          <div
            ref={svRef}
            onPointerDown={startDrag('sv')}
            className='relative h-40 w-full cursor-crosshair overflow-hidden rounded-md'
            style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
          >
            <div className='absolute inset-0' style={{ background: 'linear-gradient(to right, #fff, transparent)' }} />
            <div className='absolute inset-0' style={{ background: 'linear-gradient(to top, #000, transparent)' }} />
            <div
              className='pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]'
              style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, backgroundColor: derivedHex }}
            />
          </div>

          {/* Hue slider + eyedropper */}
          <div className='flex items-center gap-2'>
            {supportsEyeDropper ? (
              <button
                type='button'
                onClick={pickEyeDropper}
                className='text-muted-foreground hover:text-foreground shrink-0 cursor-pointer'
                title='Pick from screen'
              >
                <Pipette className='size-4' />
              </button>
            ) : null}
            <div
              ref={hueRef}
              onPointerDown={startDrag('hue')}
              className='relative h-3 flex-1 cursor-pointer rounded-full'
              style={{
                background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
              }}
            >
              <div
                className='pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]'
                style={{ left: `${(hsv.h / 360) * 100}%`, backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
              />
            </div>
          </div>

          {/* Hex */}
          <div className='flex items-center gap-2'>
            <div className='size-8 shrink-0 rounded border' style={{ backgroundColor: derivedHex }} />
            <input value={hexText} onChange={(e) => handleHexInput(e.target.value)} className={cn(numberInputClass, 'flex-1 text-left uppercase')} />
          </div>

          {/* RGB */}
          <div className='grid grid-cols-3 gap-2'>
            {(['r', 'g', 'b'] as const).map((channel) => (
              <div key={channel} className='space-y-0.5'>
                <input
                  type='number'
                  min={0}
                  max={255}
                  value={Math.round(rgb[channel])}
                  onChange={(e) => handleChannel(channel, e.target.value)}
                  className={numberInputClass}
                />
                <p className='text-muted-foreground text-center text-[10px] font-medium'>{channel.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
