import { useFindIdMutation, useSendCodeMutation, useVerifyCodeMutation } from '@/apis/auth/auth.query';
import { FindIdRESP } from '@/apis/auth/auth.response';
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
import { FailureStep } from './FailureStep';
import { createFindIdSchema, FindIdFormValues } from './schema';
import { SuccessStep } from './SuccessStep';

export interface FindIdModalHandle {
  open: () => void;
  close: () => void;
}

export interface FindIdModalProps {
  className?: string;
  onFindPassword?: () => void;
}

export const FindIdModal = forwardRef<FindIdModalHandle, FindIdModalProps>(({ onFindPassword }, ref) => {
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');
  const modalRef = useRef<ModalHandle>(null);

  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [step, setStep] = useState<'form' | 'success' | 'failure'>('form');
  const [foundIdData, setFoundIdData] = useState<FindIdRESP>();
  const [code, setCode] = useState<string>();
  const [failureMessage, setFailureMessage] = useState<string>();

  const findIdSchema = createFindIdSchema(tAuth, tValidation);

  const methods = useForm<FindIdFormValues>({
    resolver: zodResolver(findIdSchema),
    defaultValues: {
      findType: VerifyCodeType.EMAIL,
      name: '',
      emailId: '',
      emailDomain: '',
      emailDomainSelect: 'direct',
      cellphone1: '',
      cellphone2: '',
      cellphone3: '',
      company_name: '',
      representative_name: '',
      business_registration_number: '',
    },
  });

  const { control, setValue, clearErrors, reset, watch, handleSubmit } = methods;
  const findType = watch('findType');
  const cellphone1 = watch('cellphone1');
  const cellphone2 = watch('cellphone2');
  const cellphone3 = watch('cellphone3');
  const formattedPhone = [cellphone1, cellphone2, cellphone3].filter(Boolean).join('-');

  const otpModalRef = useRef<OtpModalHandle>(null);

  useImperativeHandle(ref, () => ({
    open: () => {
      reset();
      setStep('form');
      setFailureMessage(undefined);
      modalRef.current?.open();
    },
    close: () => {
      modalRef.current?.close();
    },
  }));

  const { mutate: findId, isPending: isFindingId } = useFindIdMutation({
    onSuccess: (res) => {
      setFoundIdData(res.data);
      setStep('success');
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
      setFailureMessage(error.response?.data.message || tAuth('send_code_failed'));
      otpModalRef.current?.close();
      setStep('failure');
    },
  });

  const { mutate: verifyCode, isPending: isVerifyingCode } = useVerifyCodeMutation({
    onSuccess: () => {
      otpModalRef.current?.close();
      const data = methods.getValues();
      findId({
        name: data.name,
        type: VerifyCodeType.MOBILE,
        mobile: formattedPhone,
        verification_code: code,
      });
    },
    onError: (error) => {
      toast.error(error.response?.data.message || tAuth('verification_failed'));
    },
  });

  const isSubmitting = isFindingId || isSendingCode || isVerifyingCode;

  const handleSendCode = () =>
    sendCode({
      name: methods.getValues().name,
      type: VerifyCodeType.MOBILE,
      purpose: VerifyCodePurpose.FIND_ID,
      mobile: formattedPhone,
    });

  const onSubmit = (data: FindIdFormValues) => {
    if (data.findType === VerifyCodeType.MOBILE) {
      handleSendCode();
      return;
    }

    if (data.findType === VerifyCodeType.BUSINESS) {
      findId({
        type: VerifyCodeType.BUSINESS,
        company_name: data.company_name,
        representative_name: data.representative_name,
        business_registration_number: data.business_registration_number?.replace(/-/g, ''),
      });
      return;
    }

    findId({
      name: data.name,
      type: VerifyCodeType.EMAIL,
      email: `${data.emailId}@${data.emailDomain}`,
    });
  };

  const handleVerifyOtp = (otp: string) => {
    setCode(otp);

    verifyCode({
      type: VerifyCodeType.MOBILE,
      purpose: VerifyCodePurpose.FIND_ID,
      mobile: formattedPhone,
      code: otp,
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
        title={tAuth('find_id_title')}
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
                {tAuth('find_id_title')}
              </Button>
            </div>
          ) : step === 'success' ? (
            <div className='flex justify-end gap-2 md:gap-4 md:px-6'>
              <Button variant='outline' size='md' onClick={() => modalRef.current?.close()} className='h-10'>
                {tCommon('cancel')}
              </Button>
              <Button
                variant='primary'
                size='md'
                onClick={() => {
                  modalRef.current?.close();
                  onFindPassword?.();
                }}
                className='h-10'>
                {tAuth('find_password_title')}
              </Button>
            </div>
          ) : (
            <div className='flex justify-end gap-2 md:gap-4 md:px-6'>
              <Button variant='outline' size='md' onClick={() => modalRef.current?.close()} className='h-10'>
                {tCommon('cancel')}
              </Button>
              <Button
                variant='primary'
                size='md'
                onClick={() => {
                  setFailureMessage(undefined);
                  setStep('form');
                }}
                className='h-10'>
                {tAuth('please_try_again')}
              </Button>
            </div>
          )
        }>
        {step === 'form' && (
          <FormProvider {...methods}>
            <div className='border-border-soft flex flex-col gap-6 border-t border-b px-4 py-6 max-md:border-none md:gap-12 md:px-10 md:py-8'>
              <RadioGroup
                value={findType}
                onChange={(val) => {
                  setValue('findType', val as VerifyCodeType, { shouldValidate: true, shouldDirty: true });
                  clearErrors();
                }}
                className='flex-col gap-x-8 gap-y-3 md:flex-row'>
                <Radio value={VerifyCodeType.EMAIL} label={tAuth('find_by_email')} labelClassName='body-16' />
                <Radio value={VerifyCodeType.MOBILE} label={tAuth('find_by_phone')} labelClassName='body-16' />
                <Radio value={VerifyCodeType.BUSINESS} label={tAuth('find_by_business_number')} labelClassName='body-16' />
              </RadioGroup>

              <div className='space-y-4'>
                {findType !== VerifyCodeType.BUSINESS && (
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
                )}

                {findType === VerifyCodeType.EMAIL && (
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
                    selectInputClassName='md:w-[153px]'
                    emailInputClassName='md:w-[234px]'
                  />
                )}
                {findType === VerifyCodeType.MOBILE && (
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
                    isPrefixInput
                  />
                )}
                {findType === VerifyCodeType.BUSINESS && (
                  <>
                    <FormInput
                      control={control}
                      name='company_name'
                      label={tAuth('business_name')}
                      placeholder={tAuth('business_name')}
                      labelPlacement={isDesktop ? 'left' : 'top'}
                      inputClassName='w-full md:w-[234px]'
                      containerClassName='justify-start md:gap-8'
                      labelClassName='w-[94px]'
                    />
                    <FormInput
                      label={tAuth('representative_name')}
                      control={control}
                      name='representative_name'
                      labelPlacement={isDesktop ? 'left' : 'top'}
                      inputClassName='w-full md:w-[234px]'
                      containerClassName='justify-start md:gap-8'
                      labelClassName='w-[94px]'
                    />
                    <FormInput
                      control={control}
                      name='business_registration_number'
                      label={tAuth('business_number')}
                      placeholder={tAuth('business_number')}
                      labelPlacement={isDesktop ? 'left' : 'top'}
                      inputClassName='w-full md:w-[234px]'
                      containerClassName='justify-start md:gap-8'
                      labelClassName='w-[94px]'
                    />
                  </>
                )}
              </div>

              {/* <div className='border-text-brand bg-fill-brand-soft caption-12 space-y-1 border-l-4 p-4'>
                <div className='flex gap-1'>
                  <Document className='text-text-secondary size-3 shrink-0 opacity-50' />
                  <p className='font-bold'>{tAuth('if_you_cannot')}</p>
                </div>
                <p className='text-text-secondary'>{tAuth('please_download')}</p>
              </div> */}
              <p className='text-text-secondary button-13 ml-5 list-item list-disc'>{tAuth('if_you_cannot')}</p>
            </div>
          </FormProvider>
        )}

        {step === 'success' && <SuccessStep name={foundIdData?.username} date={foundIdData?.created_at} />}
        {step === 'failure' && <FailureStep message={failureMessage} />}
      </Modal>

      <OtpModal
        ref={otpModalRef}
        phone={formattedPhone}
        onVerify={handleVerifyOtp}
        onResend={handleSendCode}
        isVerifying={isVerifyingCode}
      />
    </>
  );
});

FindIdModal.displayName = 'FindIdModal';
