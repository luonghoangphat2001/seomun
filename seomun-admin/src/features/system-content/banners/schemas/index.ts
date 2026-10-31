import type { TFunction } from 'i18next';
import { z } from 'zod';

import { SortOrder, ExposureStatus } from '@/enums';

import { BannerSortField } from '../enums';

export function createBannerFormSchema(t: TFunction<'validation'>, tPage: TFunction<'page'>) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t('required', { field: tPage('banners.form.field.name') }))
      .max(200, t('max_length', { max: 200 })),
    image_path: z
      .string()
      .trim()
      .min(1, t('required', { field: tPage('banners.form.field.pc_image') })),
    image_path_mobile: z
      .string()
      .trim()
      .min(1, t('required', { field: tPage('banners.form.field.mobile_image') })),
    exposure_location: z.string().trim(),
    // .min(1, t('required', { field: tPage('banners.form.field.exposure_location') })),
    status: z.enum(ExposureStatus),
    link_url: z.string().trim().optional(),
    exposure_target: z.string().optional(),
    sort_order: z
      .string()
      .optional()
      .refine((v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 1), t('min_number', { min: 1 })),
    exposure_start_date: z.date().nullable().optional(),
    exposure_end_date: z.date().nullable().optional(),
  });
}

export type BannerFormValues = z.infer<ReturnType<typeof createBannerFormSchema>>;

export const bannerListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z.enum(BannerSortField).optional(),
  sort_order: z.enum(SortOrder).optional(),
  banner_name: z.string().optional().catch(undefined),
  status: z.enum(ExposureStatus).optional().catch(undefined),
  registrant_id: z.coerce.number().int().optional().catch(undefined),
  exposure_period_from: z.string().optional().catch(undefined),
  exposure_period_to: z.string().optional().catch(undefined),
});

export type BannerListSearch = z.infer<typeof bannerListSearchSchema>;

export type BannerSearchFilterValues = {
  banner_name?: string;
  status?: BannerListSearch['status'];
  registrant_id?: number;
  exposure_period_from?: string;
  exposure_period_to?: string;
};

export const EMPTY_BANNER_SEARCH_FILTER_VALUES: BannerSearchFilterValues = {
  banner_name: undefined,
  status: undefined,
  registrant_id: undefined,
  exposure_period_from: undefined,
  exposure_period_to: undefined,
};
