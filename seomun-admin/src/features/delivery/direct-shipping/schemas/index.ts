import { z } from 'zod';

import { DirectShippingStatus } from '../enums';

export const directShippingListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  search_term: z.coerce.string().optional().catch(undefined),
  user_id: z.coerce.number().int().optional().catch(undefined),
  status: z.enum(DirectShippingStatus).optional().catch(undefined),
  date_from: z.string().date().optional().catch(undefined),
  date_to: z.string().date().optional().catch(undefined),
});

export type DirectShippingListSearch = z.infer<typeof directShippingListSearchSchema>;

export type DirectShippingSearchFilterValues = {
  search_term: string;
  user_id: string;
  status?: DirectShippingStatus;
  date_from: Date | null;
  date_to: Date | null;
};

export const EMPTY_DIRECT_SHIPPING_SEARCH_FILTER_VALUES: DirectShippingSearchFilterValues = {
  search_term: '',
  user_id: '',
  status: undefined,
  date_from: null,
  date_to: null,
};
