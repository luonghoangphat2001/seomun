import { z } from 'zod';

import { SortOrder } from '@/enums';

import { TaxInvoiceIssueStatus, TaxInvoiceSortField, TaxInvoiceTab } from '../enums';

export const taxInvoiceListSearchSchema = z.object({
  tab: z.enum(TaxInvoiceTab).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z.enum(TaxInvoiceSortField).optional().catch(undefined),
  sort_order: z.enum(SortOrder).optional().catch(undefined),
  date_from: z.string().optional().catch(undefined),
  date_to: z.string().optional().catch(undefined),
  issue_status: z.enum(TaxInvoiceIssueStatus).optional().catch(undefined),
  is_generated: z.enum(['generated', 'not_generated']).optional().catch(undefined),
  order_code: z.string().optional().catch(undefined),
  order_number: z.string().optional().catch(undefined),
});

export type TaxInvoiceListSearch = z.infer<typeof taxInvoiceListSearchSchema>;

export type TaxInvoiceSearchFilterValues = {
  date_from?: string;
  date_to?: string;
  issue_status?: TaxInvoiceIssueStatus;
  is_generated?: 'generated' | 'not_generated';
  order_code?: string;
  order_number?: string;
};
