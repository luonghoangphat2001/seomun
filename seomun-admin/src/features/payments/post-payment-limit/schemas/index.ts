import { z } from 'zod';

import { UserLimitStatus } from '../enums';

export const postPaymentLimitListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  name: z.string().optional().catch(undefined),
  status: z.enum(UserLimitStatus).optional().catch(undefined),
});

export type PostPaymentLimitListSearch = z.infer<typeof postPaymentLimitListSearchSchema>;

export type PostPaymentLimitSearchFilterValues = {
  name?: string;
  status?: UserLimitStatus;
};

export const postPaymentLimitFormSchema = z.object({
  user_id: z
    .string()
    .trim()
    .min(1, 'User ID is required')
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'User ID must be a positive number'),
  limit: z
    .string()
    .trim()
    .min(1, 'Limit is required')
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Limit must be a positive number'),
  remaining_amount: z
    .string()
    .trim()
    .optional()
    .refine((v) => v === undefined || v === '' || (!isNaN(Number(v)) && Number(v) >= 0), 'Must be a non-negative number'),
  status: z.enum(UserLimitStatus),
});

export type PostPaymentLimitFormValues = z.infer<typeof postPaymentLimitFormSchema>;

export function getPostPaymentLimitFormDefaults(): PostPaymentLimitFormValues {
  return {
    user_id: '',
    limit: '',
    remaining_amount: '',
    status: UserLimitStatus.ACTIVE,
  };
}
