import { clamp } from './web-editor';

export function hexToHsva(hex: string): { h: number; s: number; v: number; a: number } {
  const c = hex.replace('#', '').padEnd(8, 'ff');
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const a = Math.round((parseInt(c.slice(6, 8), 16) / 255) * 100);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return {
    h: Math.round(h * 360),
    s: max ? Math.round((d / max) * 100) : 0,
    v: Math.round(max * 100),
    a,
  };
}

export function hsvaToHex(h: number, s: number, v: number, a = 100): string {
  const hn = h / 360,
    sn = s / 100,
    vn = v / 100;
  const i = Math.floor(hn * 6);
  const f = hn * 6 - i;
  const p = vn * (1 - sn),
    q = vn * (1 - f * sn),
    t = vn * (1 - (1 - f) * sn);
  let r = 0,
    g = 0,
    b = 0;
  switch (i % 6) {
    case 0:
      r = vn;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = vn;
      b = p;
      break;
    case 2:
      r = p;
      g = vn;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = vn;
      break;
    case 4:
      r = t;
      g = p;
      b = vn;
      break;
    case 5:
      r = vn;
      g = p;
      b = q;
      break;
  }
  const toH = (n: number) =>
    Math.round(n * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();
  const hex6 = `#${toH(r)}${toH(g)}${toH(b)}`;
  if (a >= 100) return hex6;
  return hex6 + toH(a / 100);
}

export function hueOnlyHex(h: number): string {
  return hsvaToHex(h, 100, 100);
}

export function clampPct(n: number): number {
  return clamp(n, 0, 100);
}
