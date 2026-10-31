import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

import { AppButton } from '@/components/shared/app-button';
import { AppInput } from '@/components/shared/app-input';
import { AppInputFormField, AppSelectFormField } from '@/components/shared/form-fields';
import { AppFormField } from '@/components/shared/form-fields/AppFormField';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Userlist } from '../api/post-payment-limit.response';

import { useCreateUserLimitMutation, useUpdateUserLimitMutation, useUserLimitDetailQuery } from '../api';
import { USER_LIMIT_STATUS_LABELS } from '../constants';
import { UserLimitStatus } from '../enums';
import { postPaymentLimitFormSchema, getPostPaymentLimitFormDefaults, type PostPaymentLimitFormValues } from '../schemas';
import { UserPickerDialog } from './UserPickerDialog';

type PostPaymentLimitDialogProps = {
  editId?: number;
  open: boolean;
  onClose: () => void;
};

export function PostPaymentLimitDialog({ editId, open, onClose }: PostPaymentLimitDialogProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  const statusOptions = Object.values(UserLimitStatus).map((value) => ({
    value,
    label: USER_LIMIT_STATUS_LABELS[value](t),
  }));

  const isEdit = editId !== undefined;

  // ============================================================================
  // State
  // ============================================================================
  const [isUserPickerOpen, setIsUserPickerOpen] = useState(false);
  const [pickedCustomerName, setPickedCustomerName] = useState('');

  // ============================================================================
  // Hooks
  // ============================================================================
  const { data: detailData, isLoading: isDetailLoading } = useUserLimitDetailQuery(editId ?? 0);

  const { control, handleSubmit, reset, setValue } = useForm<PostPaymentLimitFormValues>({
    resolver: zodResolver(postPaymentLimitFormSchema),
    defaultValues: getPostPaymentLimitFormDefaults(),
  });

  const createMutation = useCreateUserLimitMutation({
    onSuccess: () => {
      toast.success(t('post_payment_limit.dialog.create_success', 'Limit created.'));
      setPickedCustomerName('');
      onClose();
      reset(getPostPaymentLimitFormDefaults());
    },
    onError: (error) => {
      const is422UserIdTaken =
        error.response?.status === 422 &&
        typeof error.response?.data?.errors === 'object' &&
        error.response?.data?.errors !== null &&
        'user_id' in (error.response.data.errors as object);

      toast.error(
        is422UserIdTaken
          ? t('post_payment_limit.dialog.create_error_user_id_taken', 'This user already has a limit assigned.')
          : t('post_payment_limit.dialog.create_error', 'Failed to create limit.'),
      );
    },
  });

  const updateMutation = useUpdateUserLimitMutation(editId ?? 0, {
    onSuccess: () => {
      toast.success(t('post_payment_limit.dialog.update_success', 'Limit updated.'));
      onClose();
    },
    onError: () => {
      toast.error(t('post_payment_limit.dialog.update_error', 'Failed to update limit.'));
    },
  });

  // ============================================================================
  // Effects
  // ============================================================================
  useEffect(() => {
    if (!open) return;
    if (isEdit && detailData?.data.limit) {
      const detail = detailData.data.limit;
      reset({
        user_id: String(detail.customer?.id ?? ''),
        limit: String(detail.limit),
        remaining_amount: String(detail.remaining_amount ?? ''),
        status: detail.status,
      });
    } else if (!isEdit) {
      reset(getPostPaymentLimitFormDefaults());
    }
  }, [open, isEdit, detailData, reset]);

  // ============================================================================
  // Functions
  // ============================================================================
  const handleClose = () => {
    setPickedCustomerName('');
    onClose();
  };

  const handleUserSelect = (user: Userlist) => {
    setValue('user_id', String(user.id), { shouldValidate: true });
    setPickedCustomerName(user.name);
  };

  const onSubmit = (values: PostPaymentLimitFormValues) => {
    const userId = Number(values.user_id);
    const limit = Number(values.limit);
    if (isEdit) {
      updateMutation.mutate({ user_id: userId, limit, status: values.status });
    } else {
      const remaining = values.remaining_amount ? Number(values.remaining_amount) : limit;
      createMutation.mutate({ user_id: userId, limit, remaining_amount: remaining, status: values.status });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const displayCustomerName = isEdit ? (detailData?.data.limit?.customer?.name ?? '') : pickedCustomerName;

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <>
      <UserPickerDialog open={isUserPickerOpen} onClose={() => setIsUserPickerOpen(false)} onSelect={handleUserSelect} />

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {isEdit
                ? t('post_payment_limit.dialog.edit_title', 'Edit Postpaid Limit')
                : t('post_payment_limit.dialog.create_title', 'Create Postpaid Limit')}
            </DialogTitle>
          </DialogHeader>

          {isEdit && isDetailLoading ? (
            <div className='flex h-32 items-center justify-center'>
              <p className='text-muted-foreground text-sm'>{tCommon('message.loading', 'Loading…')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <AppFormField label={t('post_payment_limit.dialog.user', 'User')} required>
                {() => (
                  <div className='flex items-center gap-2'>
                    <AppInput
                      readOnly
                      value={displayCustomerName}
                      placeholder={t('post_payment_limit.dialog.user_placeholder', 'No user selected')}
                      className='flex-1'
                    />
                    {!isEdit && (
                      <Button type='button' variant='outline' size='sm' onClick={() => setIsUserPickerOpen(true)}>
                        {t('post_payment_limit.dialog.select_user', 'Select')}
                      </Button>
                    )}
                  </div>
                )}
              </AppFormField>

              <AppInputFormField
                name='limit'
                control={control}
                label={t('post_payment_limit.dialog.limit', 'Limit (KRW)')}
                placeholder='0'
                type='number'
                min={1}
                required
                onKeyDown={(e) => ['+', '-', 'e', 'E'].includes(e.key) && e.preventDefault()}
              />

              {!isEdit && (
                <AppInputFormField
                  name='remaining_amount'
                  control={control}
                  label={t('post_payment_limit.dialog.remaining_amount', 'Initial Remaining (KRW)')}
                  placeholder={t('post_payment_limit.dialog.remaining_amount_hint', 'Defaults to limit if empty')}
                  type='number'
                  min={0}
                />
              )}

              <AppSelectFormField
                name='status'
                control={control}
                label={t('post_payment_limit.dialog.status', 'Status')}
                options={statusOptions}
                clearable={false}
                required
              />

              <div className='flex justify-end gap-2 pt-2'>
                <Button type='button' variant='outline' onClick={handleClose} disabled={isPending}>
                  {tCommon('action.cancel', 'Cancel')}
                </Button>
                <AppButton type='submit' isLoading={isPending}>
                  {tCommon('action.save', 'Save')}
                </AppButton>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
