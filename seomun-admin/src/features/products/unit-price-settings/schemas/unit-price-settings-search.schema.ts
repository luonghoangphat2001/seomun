import { z } from 'zod';

import type { UnitPriceSectionKey } from '../constants';

// Kept in sync with UNIT_PRICE_SECTION_OPTIONS via the `satisfies` check below.
const sectionValues = ['papers', 'printing', 'post_processing', 'other'] as const satisfies readonly UnitPriceSectionKey[];

export const unitPriceSettingsSearchSchema = z.object({
  section: z.enum(sectionValues).optional().catch(undefined),
});

export type UnitPriceSettingsSearch = z.infer<typeof unitPriceSettingsSearchSchema>;
