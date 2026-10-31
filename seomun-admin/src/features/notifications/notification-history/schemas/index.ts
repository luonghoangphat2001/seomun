import { z } from 'zod';

import { SortOrder } from '@/enums';

import { NotificationHistorySortField } from '../enums';

export const notificationHistoryListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z.enum(NotificationHistorySortField).optional().catch(undefined),
  sort_order: z.enum(SortOrder).optional().catch(undefined),
  template_number: z.coerce.string().optional().catch(undefined),
  notification_type: z.coerce.string().optional().catch(undefined),
  recipient_name: z.coerce.string().optional().catch(undefined),
  sending_date_from: z.coerce.string().optional().catch(undefined),
  sending_date_to: z.coerce.string().optional().catch(undefined),
  sending_result: z.coerce.string().optional().catch(undefined),
  sender_id: z.coerce.number().int().optional().catch(undefined),
});

export type NotificationHistoryListSearch = z.infer<typeof notificationHistoryListSearchSchema>;

export type NotificationHistorySearchFilterValues = {
  template_number?: string;
  notification_type?: string;
  recipient_name?: string;
  sending_date_from: Date | null;
  sending_date_to: Date | null;
  sending_result?: string;
  sender_id?: string;
};

export const EMPTY_NOTIFICATION_HISTORY_SEARCH_FILTER_VALUES: NotificationHistorySearchFilterValues = {
  template_number: '',
  notification_type: undefined,
  recipient_name: '',
  sending_date_from: null,
  sending_date_to: null,
  sending_result: undefined,
  sender_id: undefined,
};
