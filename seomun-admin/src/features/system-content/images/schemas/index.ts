import type { TFunction } from 'i18next';
import { z } from 'zod';

import { SortOrder } from '@/enums';

import { ImageSortField } from '../enums';

export function createImageFormSchema(t: TFunction<'validation'>) {
  return z.object({
    url: z
      .string()
      .trim()
      .min(1, t('required', { field: 'Image' })),
    type: z.string().trim(),
    path: z.string(),
    mime_type: z.string(),
  });
}

export type ImageFormValues = z.infer<ReturnType<typeof createImageFormSchema>>;

export const imageListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z.enum(ImageSortField).optional().catch(undefined),
  sort_order: z.enum(SortOrder).optional().catch(undefined),
  name: z.string().optional().catch(undefined),
  type: z.string().optional().catch(undefined),
  start_date: z.string().optional().catch(undefined),
  end_date: z.string().optional().catch(undefined),
  created_by: z.coerce.number().int().optional().catch(undefined),
});

export type ImageListSearch = z.infer<typeof imageListSearchSchema>;

export type ImageSearchFilterValues = {
  name?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  created_by?: number;
};

export const EMPTY_IMAGE_SEARCH_FILTER_VALUES: ImageSearchFilterValues = {
  name: undefined,
  type: undefined,
  start_date: undefined,
  end_date: undefined,
  created_by: undefined,
};
