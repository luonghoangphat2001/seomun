import type { BaseResponse, PaginationResponse } from '@/types/api';

import type { WebEditorStatus } from '../enums';

export interface WebEditorRES {
  id: number;
  name: string;
  type: string;
  width: number;
  height: number;
  unit: string;
  dpi: number;
  bleed: number;
  safe_area: number;
  config_json: WebEditorConfig;
  status: { value: WebEditorStatus };
  created_at: string;
  updated_at: string;
}

export interface WebEditorConfig {
  side: string;
}

export type WebEditorListRESP = PaginationResponse<{ web_editors: WebEditorRES[] }>;
export type WebEditorWriteRESP = BaseResponse<{ web_editor: WebEditorRES }>;

export interface WebEditorTemplateRES {
  id: number;
  name: string;
  status: string;
}

export interface WebEditorDetailRES {
  web_editor: WebEditorRES;
}

export type WebEditorDetailRESP = BaseResponse<WebEditorDetailRES>;
export type WebEditorTemplatesRESP = BaseResponse<{ templates: WebEditorTemplateRES[] }>;
