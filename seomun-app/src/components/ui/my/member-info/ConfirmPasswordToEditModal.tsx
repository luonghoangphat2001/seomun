'use client';

import { useLoginMutation } from '@/apis/auth/auth.query';
import { LoginREQ } from '@/apis/auth/auth.request';
import { Button, Modal, ModalHandle } from '@/components/common';
import { FormInput } from '@/components/form';
import { useMediaQuery } from '@/hooks';
import { saveAuthSession } from '@/lib/utils/auth';
import { useTranslations } from 'next-intl';
import { forwardRef, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { confirmPasswordDefault, confirmPasswordSchema, ConfrimPasswordFormValues } from './schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemberInfoStore } from './store';
import toast from 'react-hot-toast';

type ConfirmPasswordToEditModalProps = {
  username?: string;
  onClose: () => void;
};

export const ConfirmPasswordToEditModal = forwardRef<ModalHandle, ConfirmPasswordToEditModalProps>(
  ({ username = '', onClose }, ref) => {
    const t = useTranslations();
    const tCommon = useTranslations('common');
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const { setPasswordConfirmed, setCurrentPassword } = useMemberInfoStore();
    const currentPasswordRef = useRef('');

    const { control, handleSubmit, clearErrors, reset } = useForm<ConfrimPasswordFormValues>({
      mode: 'all',
      defaultValues: confirmPasswordDefault,
      resolver: zodResolver(confirmPasswordSchema(t)),
    });

    const { mutate: login, isPending } = useLoginMutation({
      onSuccess: async (data) => {
        await saveAuthSession({
          accessToken: data.data.access_token,
          refreshToken: data.data.refresh_token,
          user: data.data.user,
        });

        setPasswordConfirmed(true);
        setCurrentPassword(currentPasswordRef.current);
        toast.success(tCommon('verify_success'));
        resetPassword();
        onClose();
      },
      onError: (error) => {
        toast.error(error.response?.data.message ?? tCommon('error'));
      },
    });

    useEffect(() => {
      reset({
        username,
        password: '',
      });
      clearErrors();
    }, [clearErrors, reset, username]);

    const resetPassword = () => {
      reset({
        username,
        password: '',
      });
      clearErrors();
      currentPasswordRef.current = '';
    };

    const onContinue = (input: ConfrimPasswordFormValues) => {
      currentPasswordRef.current = input.password.trim();
      const req: LoginREQ = {
        username: input.username.trim(),
        password: input.password.trim(),
        remember: false,
      };

      login(req);
    };

    const resetModal = () => {
      resetPassword();
    };

    // eslint-disable-next-line react-hooks/refs
    const onSubmit = handleSubmit(onContinue);

    return (
      <Modal
        ref={ref}
        position={isDesktop ? 'center' : 'bottom'}
        title={<h2 className='modal-title'>{t('placeholder.please_enter_your_password')}</h2>}
        size={'md'}
        className='max-w-200 md:w-[95%]'
        titleClassName='pt-0'
        onClose={resetModal}
        footer={
          <div className='modal-footer'>
            <Button variant={'outline'} onClick={onClose} className='modal-footer-button' disabled={isPending}>
              {t('common.cancel')}
            </Button>
            <Button onClick={onSubmit} className='modal-footer-button' loading={isPending} disabled={isPending}>
              {t('common.continue')}
            </Button>
          </div>
        }>
        <div className='modal-body space-y-3 md:space-y-8'>
          <FormInput
            control={control}
            name='username'
            label={t('auth.id')}
            labelPlacement={isDesktop ? 'left' : 'top'}
            placeholder={t('auth.id')}
            disabled
          />
          <FormInput
            control={control}
            name='password'
            label={t('auth.password')}
            type='password'
            labelPlacement={isDesktop ? 'left' : 'top'}
            placeholder={t('auth.password')}
            helperText={t('auth.password_rule_message')}
            autoComplete='off'
          />
        </div>
      </Modal>
    );
  },
);

ConfirmPasswordToEditModal.displayName = 'ConfirmPasswordToEditModal';
