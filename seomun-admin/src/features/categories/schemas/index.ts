import { z } from 'zod';
import { CATEGORY_LEVEL, CATEGORY_STATUS } from '../enums';

export const categoryListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().default(10).catch(10),

  name: z.string().optional(),
  status: z.nativeEnum(CATEGORY_STATUS).optional().catch(undefined),
  level: z.nativeEnum(CATEGORY_LEVEL).optional(),
  registrant: z.string().optional(),
});

export type CategoryListSearch = z.infer<typeof categoryListSearchSchema>;

export const EMPTY_CATEGORY_SEARCH: CategoryListSearch = {
  page: undefined,
  per_page: 10,
  name: undefined,
  status: undefined,
  level: undefined,
  registrant: undefined,
};

export const categoryFormSchema = z
  .object({
    code: z.string().trim().min(1, 'validation.required'),
    name: z.string().trim().min(1, 'validation.required'),
    name_en: z.string().trim().optional(),
    slug: z.string().trim().optional(),
    description: z.string().trim().optional(),
    parentId: z.string().optional(),
    level: z.nativeEnum(CATEGORY_LEVEL),
    status: z.nativeEnum(CATEGORY_STATUS),
    rank: z.number().int().min(0, 'validation.min_number'),
    image: z.string().trim().optional(),
    banner_image: z.string().trim().optional(),
    icon_image: z.string().trim().optional(),
    exposure_order: z.number().int().min(0, 'validation.min_number').optional(),
    is_best: z.boolean(),
    display_start_date: z.date().nullable().optional(),
    display_end_date: z.date().nullable().optional(),
  })
  .superRefine((values, context) => {
    if (values.display_start_date && values.display_end_date && values.display_end_date <= values.display_start_date) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'validation.end_date_after_start_date',
        path: ['display_end_date'],
      });
    }
  });

export type CategoryFormData = z.infer<typeof categoryFormSchema>;

export const EMPTY_VALUES: CategoryFormData = {
  code: '',
  name: '',
  name_en: '',
  slug: '',
  description: '',
  parentId: '',
  level: CATEGORY_LEVEL.LARGE,
  status: CATEGORY_STATUS.ACTIVE,
  rank: 0,
  image: '',
  banner_image: '',
  icon_image: '',
  exposure_order: 0,
  is_best: false,
  display_start_date: null,
  display_end_date: null,
};
