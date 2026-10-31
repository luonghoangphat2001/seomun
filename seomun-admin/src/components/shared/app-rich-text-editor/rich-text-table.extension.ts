import { Table, TableCell, TableHeader, TableView } from '@tiptap/extension-table';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { EditorState, Transaction } from '@tiptap/pm/state';
import { isInTable, selectedRect } from '@tiptap/pm/tables';

import type { CellBorderAction } from './types';

type Side = 'top' | 'right' | 'bottom' | 'left';

const SIDES: Side[] = ['top', 'right', 'bottom', 'left'];
const OPPOSITE: Record<Side, Side> = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' };
const STEP: Record<Side, [number, number]> = { top: [-1, 0], right: [0, 1], bottom: [1, 0], left: [0, -1] };

const cellAttributes = {
  backgroundColor: {
    default: null,
    parseHTML: (element: HTMLElement) => element.style.backgroundColor || null,
    renderHTML: (attributes: Record<string, unknown>) =>
      attributes.backgroundColor ? { style: `background-color: ${String(attributes.backgroundColor)}` } : {},
  },
  // Sides whose border is hidden. Inline `hidden` style keeps the saved HTML self-contained (in a collapsed
  // table it also wins over the neighbor's border); data-hidden-borders lets the editor draw dashed guides.
  hiddenBorders: {
    default: [],
    parseHTML: (element: HTMLElement) => (element.getAttribute('data-hidden-borders') ?? '').split(' ').filter(Boolean),
    renderHTML: (attributes: Record<string, unknown>) => {
      const sides = (attributes.hiddenBorders ?? []) as Side[];
      return sides.length ? { 'data-hidden-borders': sides.join(' '), style: sides.map((side) => `border-${side}-style: hidden`).join('; ') } : {};
    },
  },
};

export const RichTextTableCell = TableCell.extend({
  addAttributes() {
    return { ...this.parent?.(), ...cellAttributes };
  },
});

export const RichTextTableHeader = TableHeader.extend({
  addAttributes() {
    return { ...this.parent?.(), ...cellAttributes };
  },
});

export function setCellBorders(state: EditorState, tr: Transaction, action: CellBorderAction) {
  if (!isInTable(state)) {
    return false;
  }

  const { map, table, tableStart, left, right, top, bottom } = selectedRect(state);
  const cellAt = (row: number, col: number) => (row < 0 || col < 0 || row >= map.height || col >= map.width ? null : map.map[row * map.width + col]);
  const isHidden = (row: number, col: number, side: Side) => ((table.nodeAt(cellAt(row, col)!)?.attrs.hiddenBorders ?? []) as Side[]).includes(side);

  // Grid slots on each edge of the selection, and the edges between the selected cells.
  type Edge = [row: number, col: number, side: Side];
  const rows = Array.from({ length: bottom - top }, (_, index) => top + index);
  const cols = Array.from({ length: right - left }, (_, index) => left + index);
  const outer: Record<Side, Edge[]> = {
    top: cols.map((col) => [top, col, 'top']),
    bottom: cols.map((col) => [bottom - 1, col, 'bottom']),
    left: rows.map((row) => [row, left, 'left']),
    right: rows.map((row) => [row, right - 1, 'right']),
  };
  const inside: Edge[] = [
    ...rows.slice(0, -1).flatMap((row) => cols.map((col): Edge => [row, col, 'bottom'])),
    ...cols.slice(0, -1).flatMap((col) => rows.map((row): Edge => [row, col, 'right'])),
  ];
  const allOuter = SIDES.flatMap((side) => outer[side]);

  let edges: Edge[];
  let hide: boolean;

  if (action === 'all' || action === 'none') {
    edges = [...allOuter, ...inside];
    hide = action === 'none';
  } else if (action === 'outside' || action === 'inside') {
    edges = action === 'outside' ? allOuter : inside;
    hide = false;
  } else {
    // A single side toggles: hide it if it's fully shown, otherwise show it.
    edges = outer[action];
    hide = edges.every(([row, col, side]) => !isHidden(row, col, side));
  }

  const changes = new Map<number, Map<Side, boolean>>();
  edges.forEach(([row, col, side]) => {
    const own = cellAt(row, col)!;
    const neighbor = cellAt(row + STEP[side][0], col + STEP[side][1]);

    // No edge inside a merged cell.
    if (neighbor === own) {
      return;
    }

    for (const [cellPos, cellSide] of [
      [own, side],
      [neighbor, OPPOSITE[side]],
    ] as const) {
      if (cellPos !== null) {
        changes.set(cellPos, (changes.get(cellPos) ?? new Map()).set(cellSide, hide));
      }
    }
  });

  changes.forEach((sideChanges, cellPos) => {
    const cell = table.nodeAt(cellPos)!;
    const hidden = new Set(cell.attrs.hiddenBorders as Side[]);
    sideChanges.forEach((isHiddenNow, side) => (isHiddenNow ? hidden.add(side) : hidden.delete(side)));
    tr.setNodeMarkup(tableStart + cellPos, undefined, { ...cell.attrs, hiddenBorders: SIDES.filter((side) => hidden.has(side)) });
  });

  return true;
}

// The resizable TableView ignores custom table attributes, so mirror `borderless` onto its <table> for the editor CSS.
class RichTextTableView extends TableView {
  constructor(node: ProseMirrorNode, cellMinWidth: number) {
    super(node, cellMinWidth);
    this.syncBorderless();
  }

  update(node: ProseMirrorNode) {
    const updated = super.update(node);

    if (updated) {
      this.syncBorderless();
    }

    return updated;
  }

  private syncBorderless() {
    this.table.toggleAttribute('data-borderless', Boolean(this.node.attrs.borderless));
  }
}

export const RichTextTable = Table.extend({
  addOptions() {
    // `parent` is always set on an extended node; it's only optional in the typings (`?.()` would make every option optional).
    return { ...this.parent!(), View: RichTextTableView };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      borderless: {
        default: false,
        parseHTML: (element) => element.hasAttribute('data-borderless'),
        renderHTML: (attributes) => (attributes.borderless ? { 'data-borderless': '' } : {}),
      },
    };
  },
});
