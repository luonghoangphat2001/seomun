import { z } from 'zod';

import { SortOrder } from '@/enums';

import { ErpOptionGroupSortField, ErpOptionGroupType } from '../enums';

export const optionListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z
    .enum([
      ErpOptionGroupSortField.CODE,
      ErpOptionGroupSortField.LABEL,
      ErpOptionGroupSortField.TYPE,
      ErpOptionGroupSortField.IS_REQUIRED,
      ErpOptionGroupSortField.DISPLAY_TYPE,
      ErpOptionGroupSortField.CREATED_AT,
    ])
    .optional()
    .catch(undefined),
  sort_order: z.enum([SortOrder.ASC, SortOrder.DESC]).optional().catch(undefined),
  label: z.coerce.string().optional().catch(undefined),
  code: z.coerce.string().optional().catch(undefined),
  type: z.nativeEnum(ErpOptionGroupType).optional().catch(undefined),
  created_from: z.coerce.string().optional().catch(undefined),
  created_to: z.coerce.string().optional().catch(undefined),
});

export const optionDetailSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  option_code: z.coerce.string().optional().catch(undefined),
  option_label: z.coerce.string().optional().catch(undefined),
  created_from: z.coerce.string().optional().catch(undefined),
  created_to: z.coerce.string().optional().catch(undefined),
});

export type OptionListSearch = z.infer<typeof optionListSearchSchema>;
export type OptionDetailSearch = z.infer<typeof optionDetailSearchSchema>;
