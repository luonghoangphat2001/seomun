import { z } from 'zod';

import { PricingCalculatorType } from '../enums';

export const pricingProfileListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  calculator_type: z.nativeEnum(PricingCalculatorType).optional().catch(undefined),
  is_active: z.enum(['true', 'false']).optional().catch(undefined),
});

export type PricingProfileListSearch = z.infer<typeof pricingProfileListSearchSchema>;

export type PricingProfileFilterValues = {
  calculator_type?: PricingCalculatorType;
  is_active?: 'true' | 'false';
};
