import type { TFunction } from 'i18next';
import { z } from 'zod';

const requiredNumberString = (t: TFunction, fieldLabel: string) =>
  z
    .string()
    .trim()
    .min(1, t('validation.required', { field: fieldLabel }))
    .refine((value) => !isNaN(Number(value)), t('validation.numeric_only'))
    .refine((value) => Number(value) >= 0, t('validation.min_number', { min: 0 }));

export function createOtherPriceItemFormSchema(t: TFunction) {
  return z.object({
    id: z.number().optional(),
    quantity_min: requiredNumberString(t, t('page.products.unit_price_settings.other_price.item_dialog.quantity_min', 'Min quantity')),
    price_value: requiredNumberString(t, t('page.products.unit_price_settings.other_price.item_dialog.price_value', 'Price')),
    raw_cost: requiredNumberString(t, t('page.products.unit_price_settings.other_price.item_dialog.raw_cost', 'Raw cost')),
  });
}

export type OtherPriceItemFormValues = z.infer<ReturnType<typeof createOtherPriceItemFormSchema>>;

export function getOtherPriceItemFormDefaults(): OtherPriceItemFormValues {
  return { quantity_min: '1', price_value: '0', raw_cost: '0' };
}
