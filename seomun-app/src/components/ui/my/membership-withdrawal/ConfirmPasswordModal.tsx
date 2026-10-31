'use client';

import { useWithdrawalAccountMutation } from '@/apis/my/withdrawal/withdrawal.query';
import { useAuthStore, useMediaQuery } from '@/hooks';
import { ROUTES } from '@/routes';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { MembershipWithDrawalFormValues } from './schema';
import { forwardRef } from 'react';
import { Button, Input, Modal, ModalHandle } from '@/components/common';
import { FormInput } from '@/components/form';
import toast from 'react-hot-toast';

type ConfirmPasswordModalProps = {
  canWithdraw?: boolean;
  blockingReason?: string | null;
  isCheckingWithdrawal?: boolean;
  onClose: () => void;
};

export const ConfirmPasswordModal = forwardRef<ModalHandle, ConfirmPasswordModalProps>(
  ({ canWithdraw, blockingReason, isCheckingWithdrawal = false, onClose }, ref) => {
    const t = useTranslations();
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const { user, logout } = useAuthStore();

    const { control, handleSubmit, clearErrors, setValue } = useFormContext<MembershipWithDrawalFormValues>();

    const { mutate: withdrawalAccount, isPending: isWithdrawing } = useWithdrawalAccountMutation({
      onSuccess: (resp) => {
        toast.success(resp.message ?? t('common.success'));
        onClose();
        logout();
        window.location.replace(ROUTES.LOGIN);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message ?? error.message ?? t('common.error'));
      },
    });

    const isSubmitting = isCheckingWithdrawal || isWithdrawing;

    const resetModal = () => {
      setValue('password', '');
      clearErrors('password');
    };

    const onContinue = (input: MembershipWithDrawalFormValues) => {
      if (!canWithdraw) {
        toast.error(blockingReason ?? t('common.error'));
        return;
      }

      withdrawalAccount({
        password: input.password,
        reasons: [input.reason],
        additional_comment: input.additionalComment || undefined,
      });
    };

    return (
      <Modal
        ref={ref}
        position={isDesktop ? 'center' : 'bottom'}
        title={
          <h2 className='modal-title whitespace-pre-line md:whitespace-nowrap'>
            {t('my.enter_password_to_withdraw').replace(/\\n/g, '\n')}
          </h2>
        }
        size={'md'}
        className='max-w-200 md:w-[95%]'
        titleClassName='pt-0 line-clamp-none'
        titleContainerClassName='items-center'
        closeOnOverlayClick={false}
        onClose={resetModal}
        footer={
          <div className='modal-footer'>
            <Button variant={'outline'} onClick={onClose} className='modal-footer-button' disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubmit(onContinue)}
              className='modal-footer-button'
              loading={isSubmitting}
              disabled={isSubmitting}>
              {t('common.continue')}
            </Button>
          </div>
        }>
        <div className='modal-body space-y-3 md:space-y-8'>
          <Input
            label={t('auth.id')}
            labelPlacement={isDesktop ? 'left' : 'top'}
            placeholder={t('auth.id')}
            readOnly
            value={user?.username || ''}
          />

          {/* <FormInput
          control={control}
          name='username'
          label={t('auth.id')}
          labelPlacement={isDesktop ? 'left' : 'top'}
          placeholder={t('auth.id')}
          disabled
        /> */}
          <FormInput
            control={control}
            name='password'
            label={t('auth.password')}
            type='password'
            labelPlacement={isDesktop ? 'left' : 'top'}
            placeholder={t('auth.password')}
          />
        </div>
      </Modal>
    );
  },
);

ConfirmPasswordModal.displayName = 'ConfirmPasswordModal';
