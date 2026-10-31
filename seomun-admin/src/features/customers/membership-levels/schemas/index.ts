import { z } from 'zod';

export const customerMembershipOverrideFormSchema = z.object({
  customer_id: z.string().trim().min(1, 'Customer is required.'),
  tier_id: z.string().trim().min(1, 'Membership tier is required.'),
});

export type CustomerMembershipOverrideFormValues = z.infer<typeof customerMembershipOverrideFormSchema>;

export const membershipLevelFormSchema = z.object({
  name: z.string().trim().min(1, 'Level name is required.'),
  promotion_threshold: z.coerce.number().min(0, 'Promotion threshold must be zero or greater.'),
  accrual_rate: z.coerce.number().min(0, 'Accrual rate must be zero or greater.'),
  free_shipping: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export type MembershipLevelFormInput = z.input<typeof membershipLevelFormSchema>;
export type MembershipLevelFormValues = z.infer<typeof membershipLevelFormSchema>;
