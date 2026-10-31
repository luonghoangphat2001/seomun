'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLenis } from 'lenis/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { createRegisterSchema, RegisterSchema } from './schema';

import { Button } from '@/components/common';
import { UserMemberType } from '@/enums/user';
import { ChevronLeft } from '@/icons';

import { useRegisterMutation } from '@/apis/auth/auth.query';
import { useRouter } from '@/i18n/navigation';
import { saveAuthSession } from '@/lib/utils/auth';
import { ROUTES } from '@/routes';
import toast from 'react-hot-toast';
import { RegisterFormStep } from './RegisterFormStep';
import { RegisterTypeStep } from './RegisterTypeStep';

export default function RegisterPage() {
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');

  const registerSchema = createRegisterSchema(tAuth, tValidation);

  const router = useRouter();
  const lenis = useLenis();

  const { mutate: register, isPending } = useRegisterMutation({
    onSuccess: async (data) => {
      await saveAuthSession({
        accessToken: data.data.access_token,
        refreshToken: data.data.refresh_token,
        user: data.data.user,
      });

      toast.success(data.message ?? tCommon('success'));
      router.push(ROUTES.HOME);
    },
    onError: (error) => {
      toast.error(error.response?.data.message ?? tCommon('error'));
    },
  });

  const [step, setStep] = useState(1);

  const methods = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      memberType: UserMemberType.INDIVIDUAL,
      termOfService: false,
      privacyPolicy: false,
      smsReception: false,
      emailReception: false,

      id: '',
      password: '',
      verifyPassword: '',
      name: '',
      cellphonePrefix: '',
      cellphone1: '',
      cellphone2: '',
      zipCode: '',
      address: '',
      detailedAddress: '',
      emailId: '',
      emailDomain: '',
      emailDomainSelect: 'direct',

      bizRegNumber: '',
      companyName: '',
      ceoName: '',
      industry: '',
      bizType: '',
      bizZipCode: '',
      bizAddress: '',
      bizDetailedAddress: '',
      taxEmail: '',
      homepage: '',
      bizCertificate: [],
      recaptchaToken: '',
    },
  });

  const { watch, setValue, control, reset, handleSubmit } = methods;

  const [memberType, termOfService, privacyPolicy] = watch(['memberType', 'termOfService', 'privacyPolicy']);

  const allAgreed = termOfService && privacyPolicy;

  const scrollToTop = () => {
    const resetScroll = () => {
      lenis?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    };

    resetScroll();
    requestAnimationFrame(resetScroll);
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
      scrollToTop();
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      scrollToTop();
    } else {
      reset();
    }
  };

  const onSubmit = (data: RegisterSchema) => {
    const formData = new FormData();

    formData.append('member_type', data.memberType);
    formData.append('name', data.name);
    formData.append('username', data.id);
    formData.append('password', data.password);
    formData.append('password_confirmation', data.verifyPassword);
    if (data.emailId && data.emailDomain) formData.append('email', `${data.emailId}@${data.emailDomain}`);
    formData.append('mobile', `${data.cellphonePrefix}${data.cellphone1}${data.cellphone2}`);

    if (data.landlinePrefix && data.landline1 && data.landline2) {
      formData.append('phone', `${data.landlinePrefix}${data.landline1}${data.landline2}`);
    }

    formData.append('postcode', data.zipCode);
    formData.append('address', data.address);
    formData.append('detail_address', data.detailedAddress ?? '');

    formData.append('agree_privacy', data.privacyPolicy.toString());
    formData.append('agree_terms', data.termOfService.toString());
    formData.append('agree_sms', data.smsReception.toString());
    formData.append('agree_email', data.emailReception.toString());

    if (data.memberType === UserMemberType.BUSINESS) {
      if (data.companyName) formData.append('company_name', data.companyName);
      if (data.bizRegNumber) formData.append('business_registration_number', data.bizRegNumber);
      if (data.ceoName) formData.append('representative_name', data.ceoName);
      if (data.industry) formData.append('industry_type', data.industry);
      if (data.bizType) formData.append('business_type', data.bizType);
      if (data.bizZipCode) formData.append('business_postcode', data.bizZipCode);
      if (data.bizAddress) formData.append('business_address', data.bizAddress);
      if (data.bizDetailedAddress) formData.append('business_address_detail', data.bizDetailedAddress);
      if (data.taxEmail) formData.append('tax_invoice_email', data.taxEmail);
      if (data.homepage) formData.append('homepage_url', data.homepage);

      if (data.bizCertificate?.length > 0) {
        formData.append(`business_registration_file`, data.bizCertificate[0].file);
      }
    }
    register(formData);
  };

  return (
    <FormProvider {...methods}>
      <section className='global-padding space-y-4 pb-12 sm:space-y-8 sm:pt-4 sm:pb-16'>
        <div className='flex items-center gap-3'>
          {step === 2 && (
            <button onClick={handleBack} className='hover:bg-fill-soft rounded-full p-1 transition-colors'>
              <ChevronLeft className='size-6' />
            </button>
          )}
          <h2 className='title-24'>
            {step === 1
              ? tAuth('join_membership')
              : memberType === UserMemberType.BUSINESS
                ? tAuth('corporate_signup')
                : tAuth('individual_signup')}
          </h2>
        </div>

        <div className='mx-auto flex max-w-[690px] flex-col gap-8 sm:gap-12'>
          {step === 1 ? (
            <RegisterTypeStep control={control} watch={watch} setValue={setValue} />
          ) : (
            <RegisterFormStep control={control} setValue={setValue} />
          )}

          <div className='flex w-full justify-center gap-4 sm:w-auto'>
            <Button
              variant='outline'
              size='lg'
              className='w-full md:w-30'
              onClick={step === 1 ? () => router.back() : handleBack}>
              {tCommon('cancel')}
            </Button>
            <Button
              variant='primary'
              size='lg'
              className='w-full md:w-30'
              disabled={(step === 1 ? !allAgreed : false) || isPending}
              loading={isPending}
              onClick={step === 1 ? handleNext : handleSubmit(onSubmit)}>
              {tAuth('signup_btn')}
            </Button>
          </div>
        </div>
      </section>
    </FormProvider>
  );
}
