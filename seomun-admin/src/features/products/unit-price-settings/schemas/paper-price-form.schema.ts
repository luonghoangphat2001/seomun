import type { TFunction } from 'i18next';
import { z } from 'zod';

const requiredNumberString = (t: TFunction, fieldLabel: string) =>
  z
    .string()
    .trim()
    .min(1, t('validation.required', { field: fieldLabel }))
    .refine((value) => !isNaN(Number(value)), t('validation.numeric_only'))
    .refine((value) => Number(value) >= 0, t('validation.min_number', { min: 0 }));

export function createPaperPriceFormSchema(t: TFunction) {
  return z.object({
    paper_id: z
      .string()
      .trim()
      .min(1, t('validation.required', { field: t('page.products.unit_price_settings.paper_price.dialog.paper', 'Paper') })),
    paper_size_division_code: z
      .string()
      .trim()
      .min(1, t('validation.required', { field: t('page.products.unit_price_settings.paper_price.dialog.paper_size', 'Paper size') })),
    supply_price: requiredNumberString(t, t('page.products.unit_price_settings.paper_price.dialog.supply_price', 'Supply price')),
    cost: requiredNumberString(t, t('page.products.unit_price_settings.paper_price.dialog.cost', 'Cost')),
    is_hot_deal: z.boolean(),
  });
}

export type PaperPriceFormValues = z.infer<ReturnType<typeof createPaperPriceFormSchema>>;

export function getPaperPriceFormDefaults(): PaperPriceFormValues {
  return {
    paper_id: '',
    paper_size_division_code: '',
    supply_price: '0',
    cost: '0',
    is_hot_deal: false,
  };
}
