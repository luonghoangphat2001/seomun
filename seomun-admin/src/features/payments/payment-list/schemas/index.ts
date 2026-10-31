import { z } from 'zod';

import { SortOrder } from '@/enums';

import { PaymentSortField, PaymentStatus } from '../enums';

export const paymentListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z.enum(PaymentSortField).optional().catch(undefined),
  sort_order: z.enum(SortOrder).optional().catch(undefined),
  search_term: z.string().optional().catch(undefined),
  order_date_from: z.string().optional().catch(undefined),
  order_date_to: z.string().optional().catch(undefined),
  status: z.enum(PaymentStatus).optional().catch(undefined),
  start_date: z.string().optional().catch(undefined),
  end_date: z.string().optional().catch(undefined),
});

export type PaymentListSearch = z.infer<typeof paymentListSearchSchema>;

export type PaymentSearchFilterValues = {
  search_term?: string;
  order_date_from?: string;
  order_date_to?: string;
  status?: PaymentStatus;
  start_date?: string;
  end_date?: string;
};
