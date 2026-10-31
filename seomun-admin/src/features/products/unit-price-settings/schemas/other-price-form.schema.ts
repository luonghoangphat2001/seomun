import type { TFunction } from 'i18next';
import { z } from 'zod';

import { OTHER_PRICE_OPTION_FIELDS } from '../constants/other-price.constants';
import { createOtherPriceItemFormSchema, getOtherPriceItemFormDefaults } from './other-price-item-form.schema';

const requiredSelectString = (t: TFunction, fieldLabel: string) =>
  z
    .string()
    .trim()
    .min(1, t('validation.required', { field: fieldLabel }));

export function createOtherPriceFormSchema(t: TFunction) {
  return z
    .object({
      erp_size_option_id: z.string().trim().optional(),
      erp_paper_option_id: z.string().trim().optional(),
      erp_subject_master_option_id: z.string().trim().optional(),
      product_id: requiredSelectString(t, t('page.products.unit_price_settings.other_price.dialog.product', 'Product')),
      items: z
        .array(createOtherPriceItemFormSchema(t))
        .min(1, t('page.products.unit_price_settings.other_price.dialog.items_required', 'At least one quantity tier is required')),
    })
    .superRefine((values, ctx) => {
      if (OTHER_PRICE_OPTION_FIELDS.some((field) => values[field])) return;

      const message = t('page.products.unit_price_settings.other_price.dialog.option_required');

      // Flagged on all three so every select turns red; the dialog hides the per-field text and prints the message once under the row.
      OTHER_PRICE_OPTION_FIELDS.forEach((field) => ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [field] }));
    });
}

export type OtherPriceFormValues = z.infer<ReturnType<typeof createOtherPriceFormSchema>>;

export function getOtherPriceFormDefaults(): OtherPriceFormValues {
  return {
    erp_size_option_id: '',
    erp_paper_option_id: '',
    erp_subject_master_option_id: '',
    product_id: '',
    items: [getOtherPriceItemFormDefaults()],
  };
}
