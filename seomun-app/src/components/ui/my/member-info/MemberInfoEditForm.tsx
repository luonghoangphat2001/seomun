'use client';

import { useSendCodeMutation, useVerifyCodeMutation } from '@/apis/auth/auth.query';
import { Description } from '@/components/common';
import { OtpModalHandle } from '@/components/common/otp-modal';
import { FormAddress, FormCellphone, FormEmail, FormInput, FormUpload } from '@/components/form';
import { EMAIL_DOMAINS, PHONE_OPTIONS } from '@/constants/common';
import { VerifyCodePurpose, VerifyCodeType } from '@/enums/auth';
import { useMediaQuery } from '@/hooks';
// import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';
import { EditMemberInfoFormValues } from './schema';
// import CautionSection from './CautionSection';
import { UserMemberType } from '@/enums/user';

interface MemberInfoEditFormProps {
  username: string;
}

const MemberInfoEditForm = ({ username }: MemberInfoEditFormProps) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const labelPlacement = isDesktop ? 'left' : 'top';
  const t = useTranslations();
  const emailOptions = [
    { label: t('auth.direct_input'), value: 'direct' },
    ...Object.values(EMAIL_DOMAINS).map((d) => ({ label: d, value: d })),
  ];

  const { control, setValue } = useFormContext<EditMemberInfoFormValues>();
  const memberTypeWatch = useWatch({ control, name: 'memberType' });
  const cellphonePrefix = useWatch({ control, name: 'cellphonePrefix' });
  const cellphone1 = useWatch({ control, name: 'cellphone1' });
  const cellphone2 = useWatch({ control, name: 'cellphone2' });

  const otpModalRef = useRef<OtpModalHandle>(null);
  const [verifiedMobile, setVerifiedMobile] = useState('');
  const currentMobile = `${cellphonePrefix ?? ''}${cellphone1 ?? ''}${cellphone2 ?? ''}`;
  const isMobileVerified = verifiedMobile === currentMobile && Boolean(currentMobile);

  const { mutate: sendCode, isPending: isSendingCode } = useSendCodeMutation({
    onSuccess: () => {
      toast.success(t('auth.verification_code_sent'));
      otpModalRef.current?.open();
    },
    onError: (error) => {
      toast.error(error.response?.data.message || t('auth.send_code_failed'));
    },
  });

  const { mutate: verifyCode, isPending: isVerifying } = useVerifyCodeMutation({
    onSuccess: () => {
      setVerifiedMobile(currentMobile);
      toast.success(t('auth.verification_success'));
      otpModalRef.current?.close();
    },
    onError: (error) => {
      toast.error(error.response?.data.message || t('auth.verification_failed'));
    },
  });

  const handleSendCode = () => {
    if (!cellphonePrefix || !cellphone1 || !cellphone2) {
      toast.error(t('validation.required', { field: t('auth.cellphone') }));
      return;
    }

    sendCode({
      type: VerifyCodeType.MOBILE,
      purpose: VerifyCodePurpose.CHANGE_PHONE,
      username,
      mobile: currentMobile,
    });
  };

  const handleVerifyOtp = (otp: string) => {
    verifyCode({
      type: VerifyCodeType.MOBILE,
      purpose: VerifyCodePurpose.CHANGE_PHONE,
      username,
      mobile: currentMobile,
      code: otp,
    });
  };

  return (
    <section className='mt-4 w-full space-y-4 md:mt-6 md:max-w-144.5 md:space-y-15'>
      <div className='mobile-seperator'></div>
      {/** Login Info */}
      <Description mode='form' isCollapse={false} title={t('my.login_info')} isTitleBorder={false}>
        <div className='mt-3 space-y-3 md:space-y-4'>
          <FormInput
            labelPlacement={labelPlacement}
            label={t('my.membership_classification')}
            control={control}
            name='memberType'
            placeholder={t('my.membership_classification')}
            containerClassName='flex-1'
            labelClassName='w-full md:w-[126px]'
            inputClassName='w-full md:max-w-[436px]'
            disabled
          />
          <FormInput
            labelPlacement={labelPlacement}
            label={t('auth.id')}
            control={control}
            name='username'
            placeholder={t('auth.id')}
            containerClassName='flex-1'
            labelClassName='w-full md:w-[126px]'
            inputClassName='w-full md:max-w-[436px]'
            disabled
          />
          <FormInput
            labelPlacement={labelPlacement}
            label={t('auth.password')}
            placeholder={t('auth.password')}
            control={control}
            name='password'
            type='password'
            containerClassName='flex-1'
            helperText={t('auth.password_rule_message')}
            labelClassName='w-full md:w-[126px]'
            inputClassName='w-full md:max-w-[436px]'
          />
          <FormInput
            labelPlacement={labelPlacement}
            label={t('auth.verify_password')}
            control={control}
            name='verifyPassword'
            type='password'
            placeholder={t('auth.verify_password')}
            containerClassName='flex-1'
            labelClassName='w-full md:w-[126px]'
            inputClassName='w-full md:max-w-[436px]'
          />
        </div>
      </Description>
      <div className='mobile-seperator'></div>
      {/** Basic Info */}
      <Description mode='form' isCollapse={false} title={t('auth.basic_information')} isTitleBorder={false}>
        <div className='mt-3 space-y-3 md:space-y-4'>
          <FormInput
            labelPlacement={labelPlacement}
            label={t('auth.name')}
            control={control}
            name='name'
            required
            placeholder={t('auth.name')}
            containerClassName='flex-1'
            labelClassName='w-full md:w-[126px]'
            inputClassName='w-full md:max-w-[436px]'
          />
          <FormCellphone
            labelPlacement={labelPlacement}
            control={control}
            namePrefix='cellphonePrefix'
            name1='cellphone1'
            name2='cellphone2'
            label={t('auth.cellphone')}
            phoneOptions={PHONE_OPTIONS}
            placeholderSelect={t('auth.select')}
            required
            showVerification
            verificationLabel={t('auth.send_verification_code')}
            popoverContent={t('auth.cellphone_support_message')}
            labelClassName='w-full md:w-[126px] shrink'
            inputClassName='w-full md:max-w-[436px]'
            showIcon={memberTypeWatch === UserMemberType.INDIVIDUAL}
            iconClassName='size-6 text-[#B0580D] ml-[9px]'
            onVerify={handleSendCode}
            onOtpVerify={handleVerifyOtp}
            onOtpResend={handleSendCode}
            isSendingCode={isSendingCode}
            isVerifying={isVerifying}
            otpModalRef={otpModalRef}
            readOnly={isMobileVerified}
            isVerified={isMobileVerified}
          />
          <FormCellphone
            labelPlacement={labelPlacement}
            control={control}
            namePrefix='landlinePrefix'
            name1='landline1'
            name2='landline2'
            label={t('auth.landline_phone')}
            phoneOptions={PHONE_OPTIONS}
            placeholderSelect={t('auth.select')}
            labelClassName='w-full md:w-[126px] shrink'
            inputClassName='w-full md:max-w-[436px]'
            verificationClassName='hidden'
          />
          <FormAddress
            labelPlacement={labelPlacement}
            control={control}
            nameZipCode='zipCode'
            nameAddress='address'
            nameDetailedAddress='detailedAddress'
            label={t('auth.address')}
            required
            zipCodePlaceholder={t('auth.zip_code_search')}
            addressPlaceholder={t('auth.address')}
            detailedAddressPlaceholder={t('auth.detailed_address')}
            searchLabel={t('auth.zip_code_search')}
            labelClassName='w-full md:w-[126px] shrink'
            inputClassName='w-full md:max-w-[436px]'
          />
          <FormEmail
            labelPlacement={labelPlacement}
            control={control}
            setValue={setValue}
            nameId='emailId'
            nameDomain='emailDomain'
            nameDomainSelect='emailDomainSelect'
            label={t('auth.email')}
            emailOptions={emailOptions}
            placeholderId={t('auth.email')}
            placeholderDomain={t('auth.direct_input')}
            placeholderSelect={t('auth.direct_input')}
            labelClassName='w-full md:w-[126px] shrink'
            inputClassName='w-full md:max-w-[436px]'
          />
        </div>
      </Description>
      <div className='mobile-seperator'></div>
      {/** Company Info */}
      {memberTypeWatch === UserMemberType.BUSINESS && (
        <Description mode='form' isCollapse={false} title={t('auth.company_information')} isTitleBorder={false}>
          <div className='mt-3 space-y-3 md:space-y-4'>
            <FormInput
              labelPlacement={labelPlacement}
              label={t('auth.business_registration_number')}
              control={control}
              name='bizRegNumber'
              required
              placeholder={t('auth.business_registration_number')}
              containerClassName='flex-1'
              labelClassName='w-full md:w-[126px]'
              inputClassName='w-full md:max-w-[436px]'
            />
            <FormInput
              labelPlacement={labelPlacement}
              label={t('auth.company_name')}
              control={control}
              name='companyName'
              required
              placeholder={t('auth.company_name')}
              containerClassName='flex-1'
              labelClassName='w-full md:w-[126px]'
              inputClassName='w-full md:max-w-[436px]'
            />
            <FormInput
              labelPlacement={labelPlacement}
              label={t('auth.representative_name')}
              control={control}
              name='ceoName'
              required
              placeholder={t('auth.representative_name')}
              containerClassName='flex-1'
              labelClassName='w-full md:w-[126px]'
              inputClassName='w-full md:max-w-[436px]'
            />
            <FormInput
              labelPlacement={labelPlacement}
              label={t('auth.industry')}
              control={control}
              name='industry'
              required
              placeholder={t('auth.industry')}
              containerClassName='flex-1'
              labelClassName='w-full md:w-[126px]'
              inputClassName='w-full md:max-w-[436px]'
            />
            <FormInput
              labelPlacement={labelPlacement}
              label={t('auth.business_type')}
              control={control}
              name='bizType'
              required
              placeholder={t('auth.business_type')}
              containerClassName='flex-1'
              labelClassName='w-full md:w-[126px]'
              inputClassName='w-full md:max-w-[436px]'
            />
            <FormAddress
              labelPlacement={labelPlacement}
              control={control}
              nameZipCode='bizZipCode'
              nameAddress='bizAddress'
              nameDetailedAddress='bizDetailedAddress'
              label={t('auth.address')}
              required
              zipCodePlaceholder={t('auth.zip_code_search')}
              addressPlaceholder={t('auth.address')}
              detailedAddressPlaceholder={t('auth.detailed_address')}
              searchLabel={t('auth.zip_code_search')}
              labelClassName='w-full md:w-[126px] shrink'
              inputClassName='w-full md:max-w-[436px]'
            />
            <FormInput
              labelPlacement={labelPlacement}
              label={t('auth.email')}
              subLabel={t('auth.for_tax')}
              control={control}
              name='taxEmail'
              required
              placeholder={t('auth.email')}
              containerClassName='flex-1'
              labelClassName='w-full md:w-[126px]'
              inputClassName='w-full md:max-w-[436px]'
            />
            <FormInput
              labelPlacement={labelPlacement}
              label={t('auth.homepage')}
              control={control}
              name='homepage'
              placeholder={t('auth.homepage')}
              containerClassName='flex-1'
              labelClassName='w-full md:w-[126px]'
              inputClassName='w-full md:max-w-[436px]'
            />
            <FormUpload
              labelPlacement={labelPlacement}
              label={t('auth.business_registration_certificate')}
              control={control}
              name='bizCertificate'
              labelButton={t('auth.upload')}
              helperText={t('auth.upload_support_message')}
              labelClassName='w-full md:w-[126px]'
              containerClassName='[&>div]:md:max-w-[436px]'
              multiple={false}
              accept='image/*,application/pdf'
            />
          </div>
        </Description>
      )}
      <div className='mobile-seperator'></div>
      {/* <CautionSection memberType={memberTypeWatch} className={cn(!isDesktop && 'bg-white p-0')} /> */}
    </section>
  );
};

export default MemberInfoEditForm;
