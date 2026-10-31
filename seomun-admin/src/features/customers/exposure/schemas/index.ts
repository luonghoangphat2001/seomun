import { z } from 'zod';

export const customerExposureSearchSchema = z.object({
  customer_search_term: z.string().optional().catch(undefined),
  selected_customer_id: z.coerce.number().int().min(1).optional().catch(undefined),
  product_search_term: z.string().optional().catch(undefined),
  category_search_term: z.string().optional().catch(undefined),
  selected_category_id: z.coerce.number().int().min(1).optional().catch(undefined),
  customer_page: z.coerce.number().int().min(1).optional().catch(undefined),
  customer_per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  product_page: z.coerce.number().int().min(1).optional().catch(undefined),
  product_per_page: z.coerce.number().int().min(1).optional().catch(undefined),
});

export type CustomerExposureSearch = z.infer<typeof customerExposureSearchSchema>;
