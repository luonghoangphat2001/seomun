import type { PaginationRequest, SortRequest } from '@/types/api';

import type { NotificationHistorySortField } from '../enums';

export interface NotificationHistoryListREQ extends PaginationRequest, SortRequest<NotificationHistorySortField> {
  template_number?: string;
  notification_type?: string;
  recipient_name?: string;
  sending_date_from?: string;
  sending_date_to?: string;
  sending_result?: string;
  sender_id?: number;
}
