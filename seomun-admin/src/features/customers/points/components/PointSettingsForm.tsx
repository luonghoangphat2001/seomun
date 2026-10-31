import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppInputFormField, AppSwitchFormField } from '@/components/shared/form-fields';

import { mapPointSettingsToFormValues } from '../api/customer-points.service';
import type { PointSetting } from '../../types/customer.type';
import { pointSettingsFormSchema, type PointSettingsFormInput, type PointSettingsFormValues } from '../schemas';

type PointSettingsFormProps = {
  settings?: PointSetting;
  isPending?: boolean;
  onSubmit: (values: PointSettingsFormValues) => void;
};

export function PointSettingsForm({ settings, isPending, onSubmit }: PointSettingsFormProps) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<PointSettingsFormInput, unknown, PointSettingsFormValues>({
    resolver: zodResolver(pointSettingsFormSchema),
    defaultValues: mapPointSettingsToFormValues(settings),
  });

  useEffect(() => {
    reset(mapPointSettingsToFormValues(settings));
  }, [reset, settings]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='rounded-xl border p-5'>
      <div className='mb-4'>
        <h2 className='text-sm font-semibold'>{t('page.customers.points.settings.title')}</h2>
        <p className='text-muted-foreground text-sm'>{t('page.customers.points.settings.description')}</p>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <AppInputFormField
          name='new_signup_reward'
          control={control}
          type='number'
          label={t('page.customers.points.settings.fields.new_signup_reward')}
          required
        />
        <AppInputFormField
          name='monthly_reward_limit'
          control={control}
          type='number'
          label={t('page.customers.points.settings.fields.monthly_reward_limit')}
          required
        />
        <AppInputFormField
          name='inviter_reward'
          control={control}
          type='number'
          label={t('page.customers.points.settings.fields.inviter_reward')}
          required
        />
        <AppInputFormField
          name='invited_reward'
          control={control}
          type='number'
          label={t('page.customers.points.settings.fields.invited_reward')}
          required
        />
        <AppSwitchFormField
          name='payment_usage_restriction_enabled'
          control={control}
          label={t('page.customers.points.settings.fields.payment_usage_restriction_enabled')}
        />
        <AppInputFormField
          name='minimum_order_amount'
          control={control}
          type='number'
          label={t('page.customers.points.settings.fields.minimum_order_amount')}
          required
        />
        <AppSwitchFormField
          name='invitation_point_purchase_limit_enabled'
          control={control}
          label={t('page.customers.points.settings.fields.invitation_point_purchase_limit_enabled')}
        />
        <AppInputFormField
          name='invitation_point_purchase_points'
          control={control}
          type='number'
          label={t('page.customers.points.settings.fields.invitation_point_purchase_points')}
          required
        />
        <AppInputFormField
          name='invitation_point_purchase_percent'
          control={control}
          type='number'
          label={t('page.customers.points.settings.fields.invitation_point_purchase_percent')}
          required
        />
      </div>

      <div className='mt-4 flex justify-end'>
        <AppButton type='submit' isLoading={isPending}>
          {t('common.action.save')}
        </AppButton>
      </div>
    </form>
  );
}
