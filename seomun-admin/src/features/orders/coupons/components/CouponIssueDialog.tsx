import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { AppRadioGroupFormField, AppSelectFormField } from '@/components/shared/form-fields';
import { useCustomerListInfiniteQuery } from '@/features/customers';
import { useDebounce } from '@/hooks/use-debounce';
import { getApiErrorMessage } from '@/utils/api-error';

import { useIssueCouponMutation } from '../api/coupon.query';
import type { Coupon } from '../api/coupon.response';
import { mapCouponIssueFormToREQ } from '../api/coupon.service';
import { getCouponIssueTargetOptions } from '../constants';
import { CouponIssueTargetType } from '../enums';
import { createCouponIssueFormSchema, getCouponIssueFormDefaultValues, type CouponIssueFormValues } from '../schemas';

// ============================================================================
// Type definitions
// ============================================================================

type CouponIssueDialogProps = {
  /** `undefined` keeps the dialog closed. */
  coupon?: Coupon;
  onClose: () => void;
};

const MEMBER_OPTIONS_PER_PAGE = 20;

export function CouponIssueDialog({ coupon, onClose }: CouponIssueDialogProps) {
  // ============================================================================
  // Hooks
  // ============================================================================
  const { t } = useTranslation('page');
  const { t: tValidation } = useTranslation('validation');
  const { t: tCommon } = useTranslation('common');

  const schema = useMemo(() => createCouponIssueFormSchema(tValidation), [tValidation]);

  const { control, handleSubmit, reset, watch, setValue } = useForm<CouponIssueFormValues>({
    resolver: zodResolver(schema),
    defaultValues: getCouponIssueFormDefaultValues(),
  });

  const targetType = watch('target_type');

  // ============================================================================
  // State
  // ============================================================================
  const [memberSearchTerm, setMemberSearchTerm] = useState('');

  // ============================================================================
  // Hooks (state-dependent)
  // ============================================================================
  const debouncedMemberSearchTerm = useDebounce(memberSearchTerm);

  const membersQuery = useCustomerListInfiniteQuery({
    per_page: MEMBER_OPTIONS_PER_PAGE,
    search_term: debouncedMemberSearchTerm || undefined,
  });

  const issueMutation = useIssueCouponMutation({
    onSuccess: () => {
      toast.success(t('orders.coupons.messages.issue_success'));
      onClose();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, t('orders.coupons.messages.issue_error'))),
  });

  // ============================================================================
  // Variables
  // ============================================================================
  const targetOptions = getCouponIssueTargetOptions(t);

  const memberOptions = useMemo(
    () =>
      (membersQuery.data?.pages.flatMap((page) => page.data.members) ?? []).map((member) => ({
        value: String(member.id),
        label: member.name,
        description: member.username,
        keywords: [member.name, member.username, member.email, member.mobile].filter((keyword): keyword is string => Boolean(keyword)),
      })),
    [membersQuery.data],
  );

  // ============================================================================
  // Functions
  // ============================================================================
  const handleMemberReachEnd = () => {
    if (membersQuery.hasNextPage && !membersQuery.isFetchingNextPage) {
      void membersQuery.fetchNextPage();
    }
  };

  const onSubmit = (values: CouponIssueFormValues) => {
    if (!coupon) return;
    issueMutation.mutate(mapCouponIssueFormToREQ(coupon.id, values));
  };

  // ============================================================================
  // Effects
  // ============================================================================
  useEffect(() => {
    if (!coupon) return;
    reset(getCouponIssueFormDefaultValues());
    setMemberSearchTerm('');
  }, [coupon, reset]);

  // Drop the picked members when switching to "all users" so a stale list can't be submitted.
  useEffect(() => {
    if (targetType !== CouponIssueTargetType.SPECIFIC_USERS) setValue('user_ids', []);
  }, [targetType, setValue]);

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <AppDialogModal
      isOpen={coupon !== undefined}
      setIsOpen={(open) => !open && onClose()}
      title={t('orders.coupons.issue.title')}
      width={560}
      okText={t('orders.coupons.actions.issue')}
      cancelText={tCommon('action.cancel')}
      confirmLoading={issueMutation.isPending}
      onOk={handleSubmit(onSubmit)}
    >
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 py-1' noValidate>
        {coupon ? (
          <div className='bg-muted/40 rounded-lg px-3 py-2'>
            <p className='text-sm font-medium'>{coupon.name}</p>
            <p className='text-muted-foreground font-mono text-xs'>{coupon.code}</p>
          </div>
        ) : null}

        <AppRadioGroupFormField
          name='target_type'
          control={control}
          label={t('orders.coupons.issue.target_label')}
          options={targetOptions}
          disabled={issueMutation.isPending}
          required
        />

        {targetType === CouponIssueTargetType.SPECIFIC_USERS ? (
          <AppSelectFormField
            mode='multiple'
            name='user_ids'
            control={control}
            label={t('orders.coupons.issue.fields.user_ids')}
            placeholder={t('orders.coupons.issue.placeholders.user_ids')}
            options={memberOptions}
            emptyText={membersQuery.isFetching ? tCommon('message.loading') : tCommon('message.no_options_found')}
            onSearchValueChange={setMemberSearchTerm}
            onReachEnd={handleMemberReachEnd}
            isFetchingNextPage={membersQuery.isFetchingNextPage}
            disabled={issueMutation.isPending}
            className='h-10'
            searchable
            required
          />
        ) : null}

        {targetType === CouponIssueTargetType.ALL_USERS ? (
          <div className='flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-amber-800'>
            <AlertTriangle className='mt-0.5 size-4 shrink-0' />
            <p className='text-sm'>{t('orders.coupons.issue.all_users_warning')}</p>
          </div>
        ) : null}

        {/* Submitting happens through the modal's OK button; this keeps Enter working inside the form. */}
        <button type='submit' className='hidden' aria-hidden='true' tabIndex={-1} />
      </form>
    </AppDialogModal>
  );
}
