import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppInputFormField, AppSelectFormField, AppTextareaFormField } from '@/components/shared/form-fields';
import { useDebounce } from '@/hooks/use-debounce';

import { PointActionType } from '../../enums';
import { useCustomerListInfiniteQuery } from '../../list';
import type { CustomerMember } from '../../types/customer.type';
import { pointManualAdjustmentFormSchema, type PointManualAdjustmentFormInput, type PointManualAdjustmentFormValues } from '../schemas';

type PointAdminActionsProps = {
  isAdjustmentPending?: boolean;
  onAdjustmentSubmit: (values: PointManualAdjustmentFormValues) => Promise<void>;
};

function formatCustomerOptionLabel(customer: CustomerMember) {
  return [customer.name, customer.username, customer.mobile].filter(Boolean).join(' / ');
}

export function PointAdminActions({ isAdjustmentPending, onAdjustmentSubmit }: PointAdminActionsProps) {
  const { t } = useTranslation();
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const debouncedCustomerSearchTerm = useDebounce(customerSearchTerm);
  const customersQuery = useCustomerListInfiniteQuery({
    per_page: 20,
    search_term: debouncedCustomerSearchTerm || undefined,
  });
  const adjustmentForm = useForm<PointManualAdjustmentFormInput, unknown, PointManualAdjustmentFormValues>({
    resolver: zodResolver(pointManualAdjustmentFormSchema),
    defaultValues: {
      user_id: '',
      action: PointActionType.GRANT,
      amount: 0,
      reason: '',
    },
  });

  const handleAdjustmentSubmit = async (values: PointManualAdjustmentFormValues) => {
    try {
      await onAdjustmentSubmit(values);
      adjustmentForm.reset();
    } catch {
      // The parent displays the request error; retain the entered values for correction and retry.
    }
  };

  const pointActionOptions = [
    { value: PointActionType.GRANT, label: t('page.customers.points.admin.actions.grant_points') },
    { value: PointActionType.DEDUCT, label: t('page.customers.points.admin.actions.deduct_points') },
  ];

  const customerOptions = useMemo(
    () =>
      (customersQuery.data?.pages.flatMap((page) => page.data.members) ?? []).map((customer) => ({
        value: String(customer.id),
        label: formatCustomerOptionLabel(customer),
        keywords: [customer.name, customer.username, customer.email, customer.mobile, customer.phone].filter((keyword): keyword is string =>
          Boolean(keyword),
        ),
      })),
    [customersQuery.data],
  );

  return (
    <form onSubmit={adjustmentForm.handleSubmit(handleAdjustmentSubmit)} className='rounded-xl border p-5'>
      <div className='mb-4'>
        <h2 className='text-sm font-semibold'>{t('page.customers.points.admin.manual_action_title')}</h2>
        <p className='text-muted-foreground text-sm'>{t('page.customers.points.admin.manual_action_description')}</p>
      </div>
      <div className='space-y-4'>
        <AppSelectFormField
          name='user_id'
          control={adjustmentForm.control}
          label={t('page.customers.points.admin.fields.target_member')}
          placeholder={t('page.customers.points.admin.fields.target_member_placeholder')}
          options={customerOptions}
          searchable
          searchPlaceholder={t('page.customers.points.admin.fields.target_customer_search_placeholder')}
          emptyText={
            customersQuery.isFetching
              ? t('page.customers.points.admin.fields.target_customer_loading')
              : t('page.customers.points.admin.fields.target_customer_empty')
          }
          onSearchValueChange={setCustomerSearchTerm}
          onReachEnd={() => {
            if (customersQuery.hasNextPage && !customersQuery.isFetchingNextPage) void customersQuery.fetchNextPage();
          }}
          isFetchingNextPage={customersQuery.isFetchingNextPage}
          clearable={false}
          required
        />
        <AppSelectFormField
          name='action'
          control={adjustmentForm.control}
          label={t('page.customers.points.admin.fields.action')}
          options={pointActionOptions}
          clearable={false}
          required
        />
        <AppInputFormField
          name='amount'
          control={adjustmentForm.control}
          type='number'
          label={t('page.customers.points.admin.fields.amount')}
          required
        />
        <AppTextareaFormField name='reason' control={adjustmentForm.control} label={t('page.customers.points.admin.fields.reason')} required />
      </div>
      <div className='mt-4 flex justify-end'>
        <AppButton type='submit' isLoading={isAdjustmentPending}>
          {t('page.customers.points.admin.actions.apply_point_adjustment')}
        </AppButton>
      </div>
    </form>
  );
}
