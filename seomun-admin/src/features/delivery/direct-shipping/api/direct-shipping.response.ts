import type { BaseResponse, PaginationResponse } from '@/types/api';

import type { DirectShipping } from '../types';

export type DirectShippingListRESP = PaginationResponse<{ items: DirectShipping[] }>;

export type DirectShippingDetailRESP = BaseResponse<{ item: DirectShipping }>;

export interface DirectShippingExportHistory {
  id: number;
  user_id: number;
  module: string;
  file_name: string;
  file_path: string | null;
  status: string;
  filters: object | null;
  created_at: string;
  updated_at: string;
}

export type DirectShippingExportRESP = BaseResponse<{ history: DirectShippingExportHistory }>;
