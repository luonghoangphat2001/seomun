import type { PaginationRequest } from '@/types/api';

import type { DirectShippingExportExcelType, DirectShippingStatus } from '../enums';

export interface DirectShippingListREQ extends PaginationRequest {
  search_term?: string;
  user_id?: number;
  status?: DirectShippingStatus;
  date_from?: string;
  date_to?: string;
}

export interface DirectShippingStatusREQ {
  id: number;
  status: DirectShippingStatus;
}

export interface DirectShippingExportExcelREQ extends Omit<DirectShippingListREQ, 'page' | 'per_page'> {
  export_type: DirectShippingExportExcelType;
  selected_ids?: number[];
  current_page?: number;
  per_page?: number;
}
