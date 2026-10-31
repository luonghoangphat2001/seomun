import type { TFunction } from 'i18next';
import { z } from 'zod';

import { SortOrder, ExposureStatus } from '@/enums';

import { GuideSortField, GuideType } from '../enums';

export type GuideAttachmentInput = {
  url: string;
  name: string;
  size?: number;
};

export function createGuideFormSchema(tValidate: TFunction<'validation'>, tPage: TFunction<'page'>) {
  return z.object({
    type: z.enum(GuideType, { message: tValidate('required', { field: tPage('guides.form.field.type') }) }),
    title: z
      .string()
      .trim()
      .min(1, tValidate('required', { field: tPage('guides.form.field.title') })),
    content: z
      .string()
      .trim()
      .min(1, tValidate('required', { field: tPage('guides.form.field.content') })),
    attachments: z.array(z.object({ url: z.string(), name: z.string(), size: z.number().optional() })).optional(),
    exposure_status: z.enum(ExposureStatus),
    exposure_target: z.string().optional(),
    exposure_start_date: z.date().nullable().optional(),
    exposure_end_date: z.date().nullable().optional(),
  });
}

export type GuideFormValues = z.infer<ReturnType<typeof createGuideFormSchema>>;

export const guideListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z.enum(GuideSortField).optional().catch(undefined),
  sort_order: z.enum(SortOrder).optional().catch(undefined),
  search_term: z.string().optional().catch(undefined),
  author_id: z.coerce.number().int().optional().catch(undefined),
  exposure_status: z.enum(ExposureStatus).optional().catch(undefined),
});

export type GuideListSearch = z.infer<typeof guideListSearchSchema>;

export type GuideSearchFilterValues = {
  search_term?: string;
  author_id?: number;
  exposure_status?: GuideListSearch['exposure_status'];
};

export const EMPTY_GUIDE_SEARCH_FILTER_VALUES: GuideSearchFilterValues = {
  search_term: undefined,
  author_id: undefined,
  exposure_status: undefined,
};
