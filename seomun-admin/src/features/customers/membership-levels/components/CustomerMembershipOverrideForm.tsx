import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppSelectFormField } from '@/components/shared/form-fields';

import type { CustomerMember, MembershipLevel } from '../../types/customer.type';
import { customerMembershipOverrideFormSchema, type CustomerMembershipOverrideFormValues } from '../schemas';

type CustomerMembershipOverrideFormProps = {
  customers: CustomerMember[];
  levels: MembershipLevel[];
  isCustomersFetching?: boolean;
  isCustomerFetchingNextPage?: boolean;
  isPending?: boolean;
  onCustomerSearchValueChange?: (value: string) => void;
  onCustomerReachEnd?: () => void;
  onSubmit: (values: CustomerMembershipOverrideFormValues) => void;
};

function formatCustomerOptionLabel(customer: CustomerMember) {
  return [customer.name, customer.username, customer.mobile].filter(Boolean).join(' / ');
}

export function CustomerMembershipOverrideForm({
  customers,
  levels,
  isCustomersFetching,
  isCustomerFetchingNextPage,
  isPending,
  onCustomerSearchValueChange,
  onCustomerReachEnd,
  onSubmit,
}: CustomerMembershipOverrideFormProps) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset, getValues } = useForm<CustomerMembershipOverrideFormValues>({
    resolver: zodResolver(customerMembershipOverrideFormSchema),
    defaultValues: {
      customer_id: '',
      tier_id: levels[0] ? String(levels[0].id) : '',
    },
  });

  useEffect(() => {
    if (!levels.length || getValues('tier_id')) return;
    reset({
      customer_id: getValues('customer_id'),
      tier_id: String(levels[0].id),
    });
  }, [getValues, levels, reset]);

  const customerOptions = useMemo(
    () =>
      customers.map((customer) => ({
        value: String(customer.id),
        label: formatCustomerOptionLabel(customer),
        description: customer.authority?.label ?? '',
        keywords: [customer.name, customer.username, customer.email, customer.mobile, customer.phone].filter((keyword): keyword is string =>
          Boolean(keyword),
        ),
      })),
    [customers, t],
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='rounded-xl border p-5'>
      <div className='mb-4'>
        <h3 className='font-semibold'>{t('page.customers.membership_levels.override.title')}</h3>
        <p className='text-muted-foreground text-sm'>{t('page.customers.membership_levels.override.description')}</p>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <AppSelectFormField
          name='customer_id'
          control={control}
          label={t('page.customers.membership_levels.override.fields.customer')}
          options={customerOptions}
          searchable
          searchPlaceholder={t('page.customers.points.admin.fields.target_customer_search_placeholder')}
          emptyText={
            isCustomersFetching
              ? t('page.customers.points.admin.fields.target_customer_loading')
              : t('page.customers.points.admin.fields.target_customer_empty')
          }
          onSearchValueChange={onCustomerSearchValueChange}
          onReachEnd={onCustomerReachEnd}
          isFetchingNextPage={isCustomerFetchingNextPage}
          required
          clearable={false}
        />
        <AppSelectFormField
          name='tier_id'
          control={control}
          label={t('page.customers.membership_levels.override.fields.membership_level')}
          options={levels.map((level) => ({
            value: String(level.id),
            label: level.name,
          }))}
          clearable={false}
          required
        />
      </div>

      <div className='mt-4 flex justify-end'>
        <AppButton type='submit' isLoading={isPending}>
          {t('page.customers.membership_levels.override.actions.submit')}
        </AppButton>
      </div>
    </form>
  );
}
