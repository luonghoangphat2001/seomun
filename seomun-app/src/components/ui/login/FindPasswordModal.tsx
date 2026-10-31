import { useFindIdMutation, useResetPasswordMutation, useSendCodeMutation, useVerifyCodeMutation } from '@/apis/auth/auth.query';
import { Button, Modal, ModalHandle, Radio, RadioGroup } from '@/components/common';
import { OtpModal, OtpModalHandle } from '@/components/common/otp-modal';
import { FormCellphone, FormEmail, FormInput } from '@/components/form';
import { EMAIL_DOMAINS, PHONE_PREFIXES } from '@/constants/common';
import { VerifyCodePurpose, VerifyCodeType } from '@/enums/auth';
import { useMediaQuery } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ChangePasswordStep } from './ChangePasswordStep';
import { FailureStep } from './FailureStep';
import { ChangePasswordFormValues, createChangePasswordSchema, createFindPasswordSchema, FindPasswordFormValues } from './schema';
import { SuccessStep } from './SuccessStep';

export interface FindPasswordModalHandle {
  open: () => void;
  close: () => void;
}

export interface FindPasswordModalProps {
  className?: string;
}

export const FindPasswordModal = forwardRef<FindPasswordModalHandle, FindPasswordModalProps>((_, ref) => {
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');
  const modalRef = useRef<ModalHandle>(null);

  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [step, setStep] = useState<'form' | 'change-password' | 'success' | 'failure'>('form');
  const [code, setCode] = useState<string>();

  const findPasswordSchema = createFindPasswordSchema(tAuth, tValidation);
  const changePasswordSchema = createChangePasswordSchema(tAuth, tValidation);

  const methods = useForm<FindPasswordFormValues>({
    resolver: zodResolver(findPasswordSchema),
    defaultValues: {
      findType: 'email',
      name: '',
      id: '',
      emailId: '',
      emailDomain: '',
      emailDomainSelect: 'direct',
      cellphone1: '',
      cellphone2: '',
      cellphone3: '',
    },
  });

  const changePasswordMethods = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const { control, setValue, clearErrors, reset, watch, handleSubmit } = methods;
  const { control: cpControl, handleSubmit: cpHandleSubmit, reset: cpReset } = changePasswordMethods;

  const findType = watch('findType');
  const cellphone1 = watch('cellphone1');
  const cellphone2 = watch('cellphone2');
  const cellphone3 = watch('cellphone3');
  const formattedPhone = [cellphone1, cellphone2, cellphone3].filter(Boolean).join('-');

  const otpModalRef = useRef<OtpModalHandle>(null);

  useImperativeHandle(ref, () => ({
    open: () => {
      reset();
      cpReset();
      setStep('form');
      modalRef.current?.open();
    },
    close: () => {
      modalRef.current?.close();
    },
  }));

  const { mutate: findId, isPending: isFindingId } = useFindIdMutation({
    onSuccess: (res) => {
      const data = methods.getValues();
      if (res.data?.username === data.id) {
        setStep('change-password');
      } else {
        setStep('failure');
      }
    },
    onError: () => {
      setStep('failure');
    },
  });

  const { mutate: sendCode, isPending: isSendingCode } = useSendCodeMutation({
    onSuccess: () => {
      toast.success(tAuth('verification_code_sent'));
      otpModalRef.current?.open();
    },
    onError: (error) => {
      toast.error(error.response?.data.message || tAuth('send_code_failed'));
    },
  });

  const { mutate: verifyCode, isPending: isVerifyingCode } = useVerifyCodeMutation({
    onSuccess: () => {
      otpModalRef.current?.close();
      setStep('change-password');
    },
    onError: (error) => {
      toast.error(error.response?.data.message || tAuth('verification_failed'));
    },
  });

  const { mutate: resetPassword, isPending: isResettingPassword } = useResetPasswordMutation({
    onSuccess: () => {
      setStep('success');
    },
    onError: (error) => {
      toast.error(error.response?.data.message || tAuth('please_try_again'));
    },
  });

  const isSubmitting = isFindingId || isSendingCode || isVerifyingCode;

  const handleResendCode = () => {
    const data = methods.getValues();
    sendCode({
      type: findType === 'email' ? VerifyCodeType.EMAIL : VerifyCodeType.MOBILE,
      purpose: VerifyCodePurpose.RESET_PASSWORD,
      name: data.name,
      username: data.id,
      email: findType === 'email' ? `${data.emailId}@${data.emailDomain}` : undefined,
      mobile: findType === 'phone' ? formattedPhone : undefined,
    });
  };

  const onSubmit = (data: FindPasswordFormValues) => {
    if (data.findType === 'phone') {
      handleResendCode();
      return;
    }

    findId({
      name: data.name,
      username: data.id,
      type: VerifyCodeType.EMAIL,
      email: `${data.emailId}@${data.emailDomain}`,
    });
  };

  const handleVerifyOtp = (otp: string) => {
    setCode(otp);
    const data = methods.getValues();

    verifyCode({
      type: data.findType === 'email' ? VerifyCodeType.EMAIL : VerifyCodeType.MOBILE,
      purpose: VerifyCodePurpose.RESET_PASSWORD,
      email: data.findType === 'email' ? `${data.emailId}@${data.emailDomain}` : undefined,
      mobile: data.findType === 'phone' ? formattedPhone : undefined,
      code: otp,
    });
  };

  const onChangePasswordSubmit = (data: ChangePasswordFormValues) => {
    const formData = methods.getValues();
    resetPassword({
      username: formData.id,
      name: formData.name,
      type: formData.findType === 'email' ? VerifyCodeType.EMAIL : VerifyCodeType.MOBILE,
      email: formData.findType === 'email' ? `${formData.emailId}@${formData.emailDomain}` : undefined,
      mobile: formData.findType === 'phone' ? formattedPhone : undefined,
      verification_code: formData.findType === 'phone' ? code : undefined,
      password: data.password,
      password_confirmation: data.confirmPassword,
    });
  };

  const phoneOptions = PHONE_PREFIXES.map((p) => ({ label: p, value: p }));
  const emailOptions = [
    { label: tAuth('direct_input'), value: 'direct' },
    ...Object.values(EMAIL_DOMAINS).map((d) => ({ label: d, value: d })),
  ];

  return (
    <>
      <Modal
        ref={modalRef}
        position={isDesktop ? 'center' : 'bottom'}
        size='lg'
        title={tAuth('find_password_title')}
        titleClassName='title-18 md:title-24 md:px-6'
        className='!overflow-visible'
        bodyClassName='!overflow-visible'
        footer={
          step === 'form' ? (
            <div className='flex justify-end gap-2 md:gap-4 md:px-6'>
              <Button variant='outline' size='md' onClick={() => modalRef.current?.close()} className='h-10'>
                {tCommon('cancel')}
              </Button>
              <Button variant='primary' size='md' onClick={handleSubmit(onSubmit)} className='h-10' loading={isSubmitting}>
                {tAuth('find_password_title')}
              </Button>
            </div>
          ) : step === 'change-password' ? (
            <div className='flex justify-end gap-2 md:gap-4 md:px-6'>
              <Button variant='outline' size='md' onClick={() => modalRef.current?.close()} className='h-10'>
                {tCommon('cancel')}
              </Button>
              <Button
                variant='primary'
                size='md'
                onClick={cpHandleSubmit(onChangePasswordSubmit)}
                className='h-10'
                loading={isResettingPassword}>
                {tAuth('change_password')}
              </Button>
            </div>
          ) : step === 'success' ? (
            <div className='flex justify-end gap-2 md:gap-4 md:px-6'>
              <Button variant='primary' size='md' onClick={() => modalRef.current?.close()} className='h-10'>
                {tCommon('check')}
              </Button>
            </div>
          ) : (
            <div className='flex justify-end gap-2 md:gap-4 md:px-6'>
              <Button variant='outline' size='md' onClick={() => modalRef.current?.close()} className='h-10'>
                {tCommon('cancel')}
              </Button>
              <Button variant='primary' size='md' onClick={() => setStep('form')} className='h-10'>
                {tAuth('please_try_again')}
              </Button>
            </div>
          )
        }>
        {step === 'form' && (
          <FormProvider {...methods}>
            <div className='border-border-soft flex flex-col gap-4 border-t border-b px-4 py-6 max-md:border-none md:gap-12 md:px-10 md:py-8'>
              <RadioGroup
                value={findType}
                onChange={(val) => {
                  setValue('findType', val as 'email' | 'phone', { shouldValidate: true, shouldDirty: true });
                  clearErrors();
                }}
                className='gap-x-8'>
                <Radio value='email' label={tAuth('find_by_email')} labelClassName='body-16' />
                <Radio value='phone' label={tAuth('find_by_phone')} labelClassName='body-16' />
              </RadioGroup>

              <div className='space-y-4'>
                <FormInput
                  control={control}
                  name='name'
                  label={tAuth('name')}
                  placeholder={tAuth('name')}
                  labelPlacement={isDesktop ? 'left' : 'top'}
                  inputClassName='w-full md:w-[234px]'
                  containerClassName='justify-start md:gap-8'
                  labelClassName='w-[94px]'
                />

                <FormInput
                  control={control}
                  name='id'
                  label={tAuth('id')}
                  placeholder={tAuth('id')}
                  labelPlacement={isDesktop ? 'left' : 'top'}
                  inputClassName='w-full md:w-[234px]'
                  containerClassName='justify-start md:gap-8'
                  labelClassName='w-[94px]'
                />

                {findType === 'email' ? (
                  <FormEmail
                    labelPlacement={isDesktop ? 'left' : 'top'}
                    control={control}
                    setValue={setValue}
                    nameId='emailId'
                    nameDomain='emailDomain'
                    nameDomainSelect='emailDomainSelect'
                    label={tAuth('email')}
                    emailOptions={emailOptions}
                    placeholderId={tAuth('email')}
                    inputClassName='w-full md:ml-8'
                    emailInputClassName='md:w-[234px]'
                  />
                ) : (
                  <FormCellphone
                    labelPlacement={isDesktop ? 'left' : 'top'}
                    control={control}
                    namePrefix='cellphone1'
                    name1='cellphone2'
                    name2='cellphone3'
                    label={tAuth('phone_number')}
                    className='justify-start'
                    phoneOptions={phoneOptions}
                    placeholderSelect={'-'}
                    inputClassName='w-full md:w-[234px] md:ml-8 [&>div>div>div:last-child]:hidden'
                    showSeparator={false}
                  />
                )}
              </div>
            </div>
          </FormProvider>
        )}

        {step === 'change-password' && (
          <FormProvider {...changePasswordMethods}>
            <ChangePasswordStep control={cpControl} />
          </FormProvider>
        )}

        {step === 'success' && <SuccessStep />}
        {step === 'failure' && <FailureStep />}
      </Modal>

      <OtpModal
        ref={otpModalRef}
        phone={findType === 'phone' ? formattedPhone : undefined}
        onVerify={handleVerifyOtp}
        onResend={handleResendCode}
        isVerifying={isVerifyingCode}
      />
    </>
  );
});

FindPasswordModal.displayName = 'FindPasswordModal';
