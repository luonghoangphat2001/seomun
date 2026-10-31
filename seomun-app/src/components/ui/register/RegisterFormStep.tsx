'use client';

import { useSendCodeMutation, useVerifyCodeMutation } from '@/apis/auth/auth.query';
import { Checkbox, OtpModalHandle } from '@/components/common';
import { FormAddress, FormCellphone, FormEmail, FormInput, FormUpload } from '@/components/form';
import { EMAIL_DOMAINS, PHONE_PREFIXES } from '@/constants/common';
import { VerifyCodePurpose, VerifyCodeType } from '@/enums/auth';
import { UserMemberType } from '@/enums/user';
import { useMediaQuery } from '@/hooks';
import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Control, Controller, UseFormSetValue, useFormContext, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import { RegisterSchema } from './schema';

interface RegisterFormStepProps {
  control: Control<RegisterSchema>;
  setValue: UseFormSetValue<RegisterSchema>;
}

export const RegisterFormStep: React.FC<RegisterFormStepProps> = ({ control, setValue }) => {
  const tAuth = useTranslations('auth');
  const tValidation = useTranslations('validation');

  const { setError, clearErrors } = useFormContext();

  const locale = useLocale();

  const isDesktop = useMediaQuery('(min-width: 768px)');
  const labelPlacement = isDesktop ? 'left' : 'top';

  const memberType = useWatch({ control, name: 'memberType' });

  const phoneOptions = PHONE_PREFIXES.map((p) => ({ label: p, value: p }));
  const emailOptions = [
    { label: tAuth('direct_input'), value: 'direct' },
    ...Object.values(EMAIL_DOMAINS).map((d) => ({ label: d, value: d })),
  ];

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [cellphonePrefix, cellphone1, cellphone2] = useWatch({
    control,
    name: ['cellphonePrefix', 'cellphone1', 'cellphone2'],
  });

  const [name, zipCode, address, detailedAddress, emailId, emailDomain] = useWatch({
    control,
    name: ['name', 'zipCode', 'address', 'detailedAddress', 'emailId', 'emailDomain'],
  });

  const fullPhone = `${cellphonePrefix}${cellphone1}${cellphone2}`;

  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isBasicInfoCopied, setIsBasicInfoCopied] = useState(false);

  useEffect(() => {
    if (!isBasicInfoCopied) return;

    setValue('ceoName', name, { shouldDirty: true, shouldValidate: true });
    setValue('bizZipCode', zipCode, { shouldDirty: true, shouldValidate: true });
    setValue('bizAddress', address, { shouldDirty: true, shouldValidate: true });
    setValue('bizDetailedAddress', detailedAddress, { shouldDirty: true });
    setValue('taxEmail', emailId && emailDomain ? `${emailId}@${emailDomain}` : '', { shouldDirty: true, shouldValidate: true });
  }, [address, detailedAddress, emailDomain, emailId, isBasicInfoCopied, name, setValue, zipCode]);

  const { mutate: sendCode, isPending: isSending } = useSendCodeMutation({
    onSuccess: () => {
      toast.success(tAuth('verification_code_sent'));
    },
    onError: (error) => {
      toast.error(error.response?.data.message || tAuth('send_code_failed'));
    },
  });

  const otpModalRef = useRef<OtpModalHandle>(null);
  const { mutate: verifyCode, isPending: isVerifying } = useVerifyCodeMutation({
    onSuccess: () => {
      setIsPhoneVerified(true);
      toast.success(tAuth('verification_success'));
      otpModalRef.current?.close();
    },
    onError: (error) => {
      toast.error(error.response?.data.message || tAuth('verification_failed'));
    },
  });

  const handleSendCode = () => {
    if (!cellphonePrefix || !cellphone1 || !cellphone2) {
      toast.error(tValidation('required', { field: tAuth('cellphone') }));
      return;
    }
    sendCode({
      mobile: fullPhone,
      purpose: VerifyCodePurpose.REGISTER,
      type: VerifyCodeType.MOBILE,
    });
  };

  const handleVerifyOtp = (otp: string) => {
    verifyCode({
      mobile: fullPhone,
      purpose: VerifyCodePurpose.REGISTER,
      type: VerifyCodeType.MOBILE,
      code: otp,
    });
  };

  return (
    <div className='w-full space-y-8 md:space-y-12'>
      {/* Basic Information Section */}
      <div className='w-full space-y-4 md:space-y-3'>
        <h3 className='title-18 font-semibold'>{tAuth('basic_information')}</h3>

        <div className='space-y-4'>
          {/* ID */}
          <FormInput
            labelPlacement={labelPlacement}
            label={tAuth('id')}
            control={control}
            name='id'
            placeholder={tAuth('id')}
            required
            labelClassName='w-full md:w-[124px]'
            inputClassName='w-full md:w-[548px]'
            autoComplete='off'
          />

          {/* Password */}
          <FormInput
            labelPlacement={labelPlacement}
            label={tAuth('password')}
            control={control}
            name='password'
            type='password'
            placeholder={tAuth('password')}
            required
            helperText={tAuth('password_rule_message')}
            labelClassName='w-full md:w-[124px]'
            inputClassName='w-full md:w-[548px]'
            autoComplete='off'
          />

          {/* Verify Password */}
          <FormInput
            labelPlacement={labelPlacement}
            label={tAuth('verify_password')}
            control={control}
            name='verifyPassword'
            type='password'
            placeholder={tAuth('verify_password')}
            labelClassName='w-full md:w-[124px]'
            inputClassName='w-full md:w-[548px]'
            required
          />

          {/* Name */}
          <FormInput
            labelPlacement={labelPlacement}
            label={tAuth('name')}
            control={control}
            name='name'
            placeholder={tAuth('name')}
            required
            labelClassName='w-full md:w-[124px]'
            inputClassName='w-full md:w-[548px]'
          />

          {/* Cellphone */}
          <FormCellphone
            labelPlacement={labelPlacement}
            control={control}
            namePrefix='cellphonePrefix'
            name1='cellphone1'
            name2='cellphone2'
            label={tAuth('cellphone')}
            phoneOptions={phoneOptions}
            placeholderSelect={tAuth('select')}
            required
            showVerification
            verificationLabel={tAuth('send_verification_code')}
            showIcon
            popoverContent={tAuth('cellphone_support_message')}
            labelClassName='w-full md:w-[124px]'
            inputClassName='w-full md:w-[548px]'
            onSendCode={handleSendCode}
            onOtpVerify={handleVerifyOtp}
            onOtpResend={handleSendCode}
            isSendingCode={isSending}
            isVerifying={isVerifying}
            otpModalRef={otpModalRef}
            readOnly={isPhoneVerified}
            isVerified={isPhoneVerified}
            isPrefixInput
          />

          {/* Landline */}
          <FormCellphone
            labelPlacement={labelPlacement}
            control={control}
            namePrefix='landlinePrefix'
            name1='landline1'
            name2='landline2'
            label={tAuth('landline_phone')}
            phoneOptions={phoneOptions}
            placeholderSelect={tAuth('select')}
            labelClassName='w-full md:w-[124px]'
            inputClassName='w-full md:w-[548px]'
          />

          {/* Address */}
          <FormAddress
            labelPlacement={labelPlacement}
            control={control}
            nameZipCode='zipCode'
            nameAddress='address'
            nameDetailedAddress='detailedAddress'
            label={tAuth('address')}
            required
            zipCodePlaceholder={tAuth('zip_code_search')}
            addressPlaceholder={tAuth('address')}
            detailedAddressPlaceholder={tAuth('detailed_address')}
            searchLabel={tAuth('zip_code_search')}
            labelClassName='w-full md:w-[124px]'
            inputClassName='w-full md:w-[548px]'
          />

          {/* Email */}
          <FormEmail
            labelPlacement={labelPlacement}
            control={control}
            setValue={setValue}
            nameId='emailId'
            nameDomain='emailDomain'
            nameDomainSelect='emailDomainSelect'
            label={tAuth('email')}
            emailOptions={emailOptions}
            placeholderId={tAuth('email')}
            placeholderDomain={tAuth('direct_input')}
            placeholderSelect={tAuth('direct_input')}
            labelClassName='w-full md:w-[124px]'
            inputClassName='w-full md:w-[548px]'
          />
        </div>
      </div>
      {/* Corporate Information Section */}
      {memberType === UserMemberType.BUSINESS && (
        <div className='w-full space-y-4 md:space-y-3'>
          <div className='flex items-center justify-between gap-4'>
            <h3 className='title-18 font-semibold'>{tAuth('company_information')}</h3>
            <Checkbox label={tAuth('copy_basic_information')} checked={isBasicInfoCopied} onChange={setIsBasicInfoCopied} />
          </div>

          <div className='space-y-4'>
            {/* Business Registration Number */}
            <FormInput
              labelPlacement={labelPlacement}
              label={tAuth('business_registration_number')}
              control={control}
              name='bizRegNumber'
              placeholder={tAuth('business_registration_number')}
              required
              labelClassName='w-full md:w-[124px]'
              inputClassName='w-full md:w-[548px]'
            />

            {/* Company Name */}
            <FormInput
              labelPlacement={labelPlacement}
              label={tAuth('company_name')}
              control={control}
              name='companyName'
              placeholder={tAuth('company_name')}
              required
              labelClassName='w-full md:w-[124px]'
              inputClassName='w-full md:w-[548px]'
            />

            {/* Representative Name */}
            <FormInput
              labelPlacement={labelPlacement}
              label={tAuth('representative_name')}
              control={control}
              name='ceoName'
              placeholder={tAuth('representative_name')}
              required
              labelClassName='w-full md:w-[124px]'
              inputClassName='w-full md:w-[548px]'
            />

            {/* Industry */}
            <FormInput
              labelPlacement={labelPlacement}
              label={tAuth('industry')}
              control={control}
              name='industry'
              placeholder={tAuth('industry')}
              required
              labelClassName='w-full md:w-[124px]'
              inputClassName='w-full md:w-[548px]'
            />

            {/* Business Type */}
            <FormInput
              labelPlacement={labelPlacement}
              label={tAuth('business_type')}
              control={control}
              name='bizType'
              placeholder={tAuth('business_type')}
              required
              labelClassName='w-full md:w-[124px]'
              inputClassName='w-full md:w-[548px]'
            />

            {/* Corporate Address */}
            <FormAddress
              labelPlacement={labelPlacement}
              control={control}
              nameZipCode='bizZipCode'
              nameAddress='bizAddress'
              nameDetailedAddress='bizDetailedAddress'
              label={tAuth('address')}
              required
              zipCodePlaceholder={tAuth('zip_code_search')}
              addressPlaceholder={tAuth('address')}
              detailedAddressPlaceholder={tAuth('detailed_address')}
              searchLabel={tAuth('zip_code_search')}
              labelClassName='w-full md:w-[124px]'
              inputClassName='w-full md:w-[548px]'
            />

            {/* Tax Email */}
            <FormInput
              labelPlacement={labelPlacement}
              label={tAuth('email')}
              subLabel={tAuth('for_tax')}
              control={control}
              name='taxEmail'
              type='email'
              placeholder={tAuth('email')}
              labelClassName='w-full md:w-[124px]'
              inputClassName='w-full md:w-[548px]'
              required
            />

            {/* Homepage */}
            <FormInput
              labelPlacement={labelPlacement}
              label={tAuth('homepage')}
              control={control}
              name='homepage'
              placeholder={tAuth('homepage')}
              labelClassName='w-full md:w-[124px]'
              inputClassName='w-full md:w-[548px]'
            />

            {/* Business Registration Certificate Upload */}
            <FormUpload
              labelPlacement={labelPlacement}
              label={tAuth('business_registration_certificate')}
              control={control}
              name='bizCertificate'
              labelButton={tAuth('upload')}
              helperText={tAuth('upload_support_message')}
              required
              labelClassName='w-full md:w-[124px]'
              containerClassName='[&>div]:md:w-[548px]'
              multiple={false}
              accept='image/*,application/pdf'
            />
          </div>
        </div>
      )}
      <Controller
        name='recaptchaToken'
        control={control}
        render={({ field: { onChange }, fieldState: { error } }) => (
          <div className={cn('mx-auto flex w-fit flex-col items-center rounded-sm', error?.message && 'border-error border')}>
            <ReCAPTCHA
              ref={recaptchaRef}
              hl={locale}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
              onChange={async (token) => {
                if (!token) {
                  recaptchaRef.current?.reset();
                  onChange('');
                  return;
                }
                try {
                  const response = await fetch('/api/verify-captcha', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                  });
                  const result = await response.json();
                  if (result.success) {
                    onChange(token);
                    clearErrors('recaptchaToken');
                  } else {
                    onChange('');
                    recaptchaRef.current?.reset();
                    toast.error(tValidation('recaptcha_failed'));
                    setError('recaptchaToken', { type: 'manual', message: tValidation('recaptcha_failed') });
                  }
                } catch {
                  recaptchaRef.current?.reset();
                  setError('recaptchaToken', { type: 'manual', message: tValidation('recaptcha_failed') });
                }
              }}
            />
          </div>
        )}
      />
    </div>
  );
};
