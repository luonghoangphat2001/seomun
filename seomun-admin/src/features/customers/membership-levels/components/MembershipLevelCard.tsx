import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppInputFormField, AppSwitchFormField } from '@/components/shared/form-fields';

import type { MembershipLevel } from '../../types/customer.type';
import { membershipLevelFormSchema, type MembershipLevelFormInput, type MembershipLevelFormValues } from '../schemas';

type MembershipLevelCardProps = {
  level: MembershipLevel;
  isPending?: boolean;
  onSubmit: (values: MembershipLevelFormValues) => void;
};

function getMembershipLevelDefaultValues(level: MembershipLevel): MembershipLevelFormValues {
  return {
    name: level.name,
    promotion_threshold: level.promotionThreshold,
    accrual_rate: level.accrualRate,
    free_shipping: level.freeShipping,
    is_active: level.isActive,
  };
}

export function MembershipLevelCard({ level, isPending, onSubmit }: MembershipLevelCardProps) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<MembershipLevelFormInput, unknown, MembershipLevelFormValues>({
    resolver: zodResolver(membershipLevelFormSchema),
    defaultValues: getMembershipLevelDefaultValues(level),
  });

  useEffect(() => {
    reset(getMembershipLevelDefaultValues(level));
  }, [level, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='rounded-xl border p-5'>
      <div className='mb-4'>
        <h3 className='font-semibold'>{level.code.toUpperCase()}</h3>
        <p className='text-muted-foreground text-sm'>{t('page.customers.membership_levels.card.member_count', { count: level.memberCount })}</p>
        <p className='text-muted-foreground text-xs'>
          {t('page.customers.membership_levels.card.average_amount', { amount: level.averageAmount.toLocaleString() })}
        </p>
      </div>
      <div className='space-y-3'>
        <AppInputFormField name='name' control={control} label={t('page.customers.membership_levels.card.fields.name')} required />
        <AppInputFormField
          name='promotion_threshold'
          control={control}
          type='number'
          label={t('page.customers.membership_levels.card.fields.promotion_threshold')}
          required
        />
        <AppInputFormField
          name='accrual_rate'
          control={control}
          type='number'
          step='0.1'
          label={t('page.customers.membership_levels.card.fields.accrual_rate')}
          required
        />
        <AppSwitchFormField name='free_shipping' control={control} label={t('page.customers.membership_levels.card.fields.free_shipping')} />
        <AppSwitchFormField name='is_active' control={control} label={t('page.customers.membership_levels.card.fields.is_active')} />
      </div>
      <div className='mt-4 flex justify-end'>
        <AppButton type='submit' isLoading={isPending}>
          {t('page.customers.membership_levels.card.actions.submit')}
        </AppButton>
      </div>
    </form>
  );
}
