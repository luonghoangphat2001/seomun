import type { TFunction } from 'i18next';
import { z } from 'zod';

import { ExposureStatus, SortOrder } from '@/enums';

export function createPopupFormSchema(t: TFunction<'validation'>, tPage: TFunction<'page'>) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t('required', { field: tPage('popups.form.field.name') }))
      .max(200, t('max_length', { max: 200 })),
    content: z.string().trim().nullable().optional(),
    image_path: z
      .string()
      .trim()
      .min(1, t('required', { field: tPage('popups.form.field.image') })),
    exposure_location: z.string().nullable().optional(),
    exposure_target: z.string().optional(),
    width: z
      .string()
      .trim()
      .min(1, t('required', { field: tPage('popups.form.field.width') }))
      .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 10, t('min_number', { min: 10 })),
    height: z
      .string()
      .trim()
      .min(1, t('required', { field: tPage('popups.form.field.height') }))
      .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 10, t('min_number', { min: 10 })),
    status: z.enum(ExposureStatus),
    exposure_start_date: z.date().nullable().optional(),
    exposure_end_date: z.date().nullable().optional(),
  });
}

export type PopupFormValues = z.infer<ReturnType<typeof createPopupFormSchema>>;

export const popupListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z.enum(['name', 'created_at']).optional(),
  sort_order: z.enum(SortOrder).optional(),
  popup_name: z.string().optional().catch(undefined),
  exposure_location: z.string().optional().catch(undefined),
  status: z.enum(ExposureStatus).optional().catch(undefined),
  exposure_period_from: z.string().optional().catch(undefined),
  exposure_period_to: z.string().optional().catch(undefined),
  registrant_id: z.coerce.number().int().optional().catch(undefined),
});

export type PopupListSearch = z.infer<typeof popupListSearchSchema>;

export type PopupSearchFilterValues = {
  popup_name?: string;
  exposure_location?: string;
  status?: PopupListSearch['status'];
  registrant_id?: number;
  exposure_period_from?: string;
  exposure_period_to?: string;
};

export const EMPTY_POPUP_SEARCH_FILTER_VALUES: PopupSearchFilterValues = {
  popup_name: undefined,
  exposure_location: undefined,
  status: undefined,
  registrant_id: undefined,
  exposure_period_from: undefined,
  exposure_period_to: undefined,
};
