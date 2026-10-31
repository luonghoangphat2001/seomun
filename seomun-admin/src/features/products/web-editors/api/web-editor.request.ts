import type { PaginationRequest } from '@/types/api';
import type { WebEditorStatus } from '../enums';

export interface WebEditorListREQ extends PaginationRequest {
  search_keyword?: string;
  type?: string;
  is_active?: boolean | 'all';
}

export interface WebEditorREQ {
  name: string;
  type: string;
  width: number;
  height: number;
  unit: string;
  dpi: number;
  bleed: number;
  safe_area: number;
  config_json: null;
  status: WebEditorStatus;
}

export type WebEditorUpdateREQ = WebEditorREQ;
