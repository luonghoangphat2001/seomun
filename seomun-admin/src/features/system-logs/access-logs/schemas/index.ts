import { z } from 'zod';

import { SortOrder } from '@/enums';

import { AccessLogEventType, AccessLogSortField } from '../enums';

export const accessLogListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z.enum(AccessLogSortField).optional().catch(undefined),
  sort_order: z.enum(SortOrder).optional().catch(undefined),
  search_term: z.coerce.string().optional().catch(undefined),
  event_type: z.enum(AccessLogEventType).optional().catch(undefined),
  access_date_from: z.coerce.string().optional().catch(undefined),
  access_date_to: z.coerce.string().optional().catch(undefined),
});

export type AccessLogListSearch = z.infer<typeof accessLogListSearchSchema>;
export type AccessLogSearchFilterValues = {
  search_term: string;
  event_type?: AccessLogListSearch['event_type'];
  access_date_from: Date | null;
  access_date_to: Date | null;
};

export const EMPTY_ACCESS_LOG_SEARCH_FILTER_VALUES: AccessLogSearchFilterValues = {
  search_term: '',
  event_type: undefined,
  access_date_from: null,
  access_date_to: null,
};
