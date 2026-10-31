import type { TFunction } from 'i18next';
import { z } from 'zod';

import { parseDate } from '@/utils/format-date';

import type { ShippingSettings } from '../api/shipping-settings.response';

export const createShippingSettingsFormSchema = (tPage: TFunction<'page'>, tValidation: TFunction<'validation'>) =>
  z
    .object({
      free_shipping_start_at: z.date().nullable(),
      free_shipping_end_at: z.date().nullable(),
    })
    .superRefine((values, ctx) => {
      if (values.free_shipping_start_at && !values.free_shipping_end_at) {
        ctx.addIssue({
          code: 'custom',
          path: ['free_shipping_end_at'],
          message: tValidation('required', { field: tPage('orders.shipping_settings.form.fields.end_at') }),
        });
      }

      if (!values.free_shipping_start_at && values.free_shipping_end_at) {
        ctx.addIssue({
          code: 'custom',
          path: ['free_shipping_start_at'],
          message: tValidation('required', { field: tPage('orders.shipping_settings.form.fields.start_at') }),
        });
      }
    });

export type ShippingSettingsFormValues = z.infer<ReturnType<typeof createShippingSettingsFormSchema>>;

export function getShippingSettingsFormDefaultValues(settings?: ShippingSettings): ShippingSettingsFormValues {
  return {
    free_shipping_start_at: parseDate(settings?.free_shipping_start_at ?? undefined),
    free_shipping_end_at: parseDate(settings?.free_shipping_end_at ?? undefined),
  };
}
