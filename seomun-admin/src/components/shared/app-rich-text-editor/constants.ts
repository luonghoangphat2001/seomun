import type { ToolbarState } from './types';

export const DEFAULT_TEXT_COLOR = '#000000';

export const COLOR_PICKER_THROTTLE_MS = 80;

export const HORIZONTAL_RULE_THICKNESS_OPTIONS = [1, 2, 3, 4, 6, 8].map((px) => ({ value: String(px), label: `${px}px` }));

// Where the caption line goes when an image is inserted (labels: page.rich_text_editor.caption_position.*).
export const IMAGE_CAPTION_POSITIONS = ['below', 'above'] as const;

export const CELL_BORDER_ACTION_GROUPS = [
  ['all', 'none', 'outside', 'inside'],
  ['top', 'bottom', 'left', 'right'],
] as const;

export const IMAGE_RESIZE_CONFIG = {
  enabled: true,
  minWidth: 120,
  minHeight: 80,
  alwaysPreserveAspectRatio: true,
} as const;

export const EDITOR_DISABLED_TOOLTIPS = {
  nothingToUndo: 'Nothing to undo',
  nothingToRedo: 'Nothing to redo',
  selectLinkToRemove: 'Select a link to remove',
  selectTableToEdit: 'Select a table to edit',
  selectHorizontalRuleToEdit: 'Click a horizontal rule to edit it',
} as const;

export const EMPTY_TOOLBAR_STATE: ToolbarState = {
  canUndo: false,
  canRedo: false,
  isParagraph: false,
  isHeading1: false,
  isHeading2: false,
  isHeading3: false,
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrike: false,
  isCode: false,
  textColor: '',
  textBackgroundColor: '',
  isBulletList: false,
  isOrderedList: false,
  isBlockquote: false,
  isCodeBlock: false,
  isHorizontalRule: false,
  horizontalRuleThickness: 1,
  isAlignLeft: false,
  isAlignCenter: false,
  isAlignRight: false,
  isAlignJustify: false,
  isLink: false,
  isTable: false,
  isTableBorderless: false,
  cellBackgroundColor: '',
  characterCount: 0,
  wordCount: 0,
};
