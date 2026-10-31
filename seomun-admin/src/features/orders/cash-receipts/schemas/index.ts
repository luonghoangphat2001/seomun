import { z } from 'zod';

import { SortOrder } from '@/enums';

import { CashReceiptIssueStatus, CashReceiptSortField, CashReceiptTab } from '../enums';

export const cashReceiptListSearchSchema = z.object({
  tab: z.enum(CashReceiptTab).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z.enum(CashReceiptSortField).optional().catch(undefined),
  sort_order: z.enum(SortOrder).optional().catch(undefined),
  date_from: z.string().optional().catch(undefined),
  date_to: z.string().optional().catch(undefined),
  issue_status: z.enum(CashReceiptIssueStatus).optional().catch(undefined),
  is_generated: z.enum(['generated', 'not_generated']).optional().catch(undefined),
  order_code: z.string().optional().catch(undefined),
  order_number: z.string().optional().catch(undefined),
});

export type CashReceiptListSearch = z.infer<typeof cashReceiptListSearchSchema>;

export type CashReceiptSearchFilterValues = {
  date_from?: string;
  date_to?: string;
  issue_status?: CashReceiptIssueStatus;
  is_generated?: 'generated' | 'not_generated';
  order_code?: string;
  order_number?: string;
};
