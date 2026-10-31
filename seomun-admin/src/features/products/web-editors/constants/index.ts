import type { ParseKeys } from 'i18next';

import { WebEditorStatus, WebEditorType } from '../enums';

/** dpi default */
export const DEFAULT_DPI = 96;

export const WEB_EDITOR_TYPE_TRANSLATION_KEYS = {
  [WebEditorType.SINGLE_SIDED]: 'products.web_editors.enum.type.SINGLE_SIDED',
  [WebEditorType.DOUBLE_SIDED]: 'products.web_editors.enum.type.DOUBLE_SIDED',
  [WebEditorType.BUSINESS_CARD]: 'products.web_editors.enum.type.BUSINESS_CARD',
  [WebEditorType.DOUBLE_FOLD]: 'products.web_editors.enum.type.DOUBLE_FOLD',
  [WebEditorType.TRIPLE_FOLD]: 'products.web_editors.enum.type.TRIPLE_FOLD',
  [WebEditorType.ENVELOPE]: 'products.web_editors.enum.type.ENVELOPE',
  [WebEditorType.SPIRAL_BINDING]: 'products.web_editors.enum.type.SPIRAL_BINDING',
  [WebEditorType.PERFECT_BINDING]: 'products.web_editors.enum.type.PERFECT_BINDING',
  [WebEditorType.STICKER]: 'products.web_editors.enum.type.STICKER',
} as const satisfies Record<WebEditorType, ParseKeys<'page'>>;

export const WEB_EDITOR_TYPE_VALUES = Object.values(WebEditorType);

export const WEB_EDITOR_STATUS_OPTIONS = [
  { value: WebEditorStatus.ACTIVE, label: 'Active' },
  { value: WebEditorStatus.HIDDEN, label: 'Hidden' },
] as const;
