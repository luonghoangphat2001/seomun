import type { CellBorderAction } from '../types';

type Line = 'top' | 'bottom' | 'left' | 'right' | 'innerHorizontal' | 'innerVertical';

// A 2x2 cell grid in a 24x24 box.
const LINES: Record<Line, [x1: number, y1: number, x2: number, y2: number]> = {
  top: [4, 4, 20, 4],
  bottom: [4, 20, 20, 20],
  left: [4, 4, 4, 20],
  right: [20, 4, 20, 20],
  innerHorizontal: [4, 12, 20, 12],
  innerVertical: [12, 4, 12, 20],
};

const SOLID_LINES: Record<CellBorderAction, Line[]> = {
  all: ['top', 'bottom', 'left', 'right', 'innerHorizontal', 'innerVertical'],
  none: [],
  outside: ['top', 'bottom', 'left', 'right'],
  inside: ['innerHorizontal', 'innerVertical'],
  top: ['top'],
  bottom: ['bottom'],
  left: ['left'],
  right: ['right'],
};

/** Word-style border icon: the lines the action applies to are solid, the rest faint dotted. */
export function CellBorderIcon({ action, className }: { action: CellBorderAction; className?: string }) {
  const solid = new Set(SOLID_LINES[action]);
  const lines = Object.keys(LINES) as Line[];

  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeLinecap='round' className={className} aria-hidden='true'>
      {lines
        .filter((line) => !solid.has(line))
        .map((line) => {
          const [x1, y1, x2, y2] = LINES[line];
          return <line key={line} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={1.25} strokeDasharray='0.5 2.5' opacity={0.5} />;
        })}
      {lines
        .filter((line) => solid.has(line))
        .map((line) => {
          const [x1, y1, x2, y2] = LINES[line];
          return <line key={line} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={2} />;
        })}
    </svg>
  );
}
