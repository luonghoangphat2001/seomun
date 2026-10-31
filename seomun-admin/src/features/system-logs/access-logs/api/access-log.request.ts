import type { PaginationRequest, SortRequest } from '@/types/api';

import type { AccessLogEventType, AccessLogExportType, AccessLogSortField } from '../enums';

export type AccessLogListRequest = PaginationRequest &
  SortRequest<AccessLogSortField> & {
    search_term?: string;
    event_type?: AccessLogEventType;
    access_date_from?: string;
    access_date_to?: string;
  };

export type AccessLogExportREQ = Omit<AccessLogListRequest, 'page' | 'per_page'> & {
  export_type: AccessLogExportType;
  current_page?: number;
  per_page?: number;
  selected_ids?: number[];
};
