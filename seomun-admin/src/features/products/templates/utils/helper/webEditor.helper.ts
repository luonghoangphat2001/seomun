import { DEFAULT_DPI, type WebEditorRES } from '@/features/products/web-editors';

import { Side } from '../../enums';

/** Convert a length expressed in the web editor's unit/dpi to mm. */
export function editorLenToMm(editor: WebEditorRES, value: number): number {
  const factor = editor.unit?.toLowerCase() === 'px' ? 25.4 / (editor.dpi || DEFAULT_DPI) : 1;
  return value * factor;
}

export function webEditorSides(type: string): Side[] {
  return /DOUBLE|FOLD/i.test(type) ? [Side.FRONT, Side.BACK] : [Side.FRONT];
}
