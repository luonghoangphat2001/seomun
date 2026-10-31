import type { TFunction } from 'i18next';
import { z } from 'zod';

import { PostProcessingSizeType } from '../enums';

const requiredNumberString = (t: TFunction, fieldLabel: string) =>
  z
    .string()
    .trim()
    .min(1, t('validation.required', { field: fieldLabel }))
    .refine((value) => !isNaN(Number(value)), t('validation.numeric_only'))
    .refine((value) => Number(value) >= 0, t('validation.min_number', { min: 0 }));

const enumSelectString = (t: TFunction, enumObject: Record<string, string>, fieldLabel: string) => {
  const message = t('validation.required', { field: fieldLabel });
  return z
    .string()
    .trim()
    .min(1, message)
    .refine((value) => Object.values(enumObject).includes(value), message);
};

export function createPostProcessingPriceItemFormSchema(t: TFunction) {
  return z.object({
    id: z.number().optional(),
    quantity: requiredNumberString(t, t('page.products.unit_price_settings.post_processing_price.dialog.item_quantity', 'Quantity')),
    supply_price: requiredNumberString(t, t('page.products.unit_price_settings.post_processing_price.dialog.item_supply_price', 'Supply price')),
    cost: requiredNumberString(t, t('page.products.unit_price_settings.post_processing_price.dialog.item_cost', 'Cost')),
  });
}

export function createPostProcessingPriceFormSchema(t: TFunction) {
  return z.object({
    code: z
      .string()
      .trim()
      .min(1, t('validation.required', { field: t('page.products.unit_price_settings.post_processing_price.dialog.code', 'Code') })),
    erp_option_id: z
      .string()
      .trim()
      .min(1, t('validation.required', { field: t('page.products.unit_price_settings.post_processing_price.dialog.erp_option', 'Option') })),
    post_processing_size_type: enumSelectString(
      t,
      PostProcessingSizeType,
      t('page.products.unit_price_settings.post_processing_price.dialog.size_type', 'Size type'),
    ),
    is_active: z.boolean(),
    items: z
      .array(createPostProcessingPriceItemFormSchema(t))
      .min(1, t('page.products.unit_price_settings.post_processing_price.dialog.items_required', 'At least one quantity tier is required')),
  });
}

export type PostProcessingPriceItemFormValues = z.infer<ReturnType<typeof createPostProcessingPriceItemFormSchema>>;
export type PostProcessingPriceFormValues = z.infer<ReturnType<typeof createPostProcessingPriceFormSchema>>;

export function getEmptyPostProcessingPriceItem(): PostProcessingPriceItemFormValues {
  return { quantity: '1', supply_price: '0', cost: '0' };
}

export function getPostProcessingPriceFormDefaults(): PostProcessingPriceFormValues {
  return {
    code: '',
    erp_option_id: '',
    post_processing_size_type: '',
    is_active: true,
    items: [getEmptyPostProcessingPriceItem()],
  };
}
