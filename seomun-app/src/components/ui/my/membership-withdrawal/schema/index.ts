import { MemberShipWithdrawalReason } from '@/enums/membership-withdrawal';
import { TFunction } from '@/types';
import { z } from 'zod';

export const MembershipWithDrawalSchema = (t: TFunction) =>
  z.object({
    reason: z.enum(MemberShipWithdrawalReason),
    additionalComment: z.string().optional(),
    password: z.string().min(6, t('validation.min_length', { field: t('auth.password'), length: 6 })),
  });

export type MembershipWithDrawalFormValues = z.infer<ReturnType<typeof MembershipWithDrawalSchema>>;

export const membershipWithDrawalDefault: MembershipWithDrawalFormValues = {
  reason: MemberShipWithdrawalReason.PRODUCT_VARIETY_INSUFFICIENT,
  additionalComment: '',
  password: '',
};
