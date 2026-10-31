'use client';

import { useTranslations } from 'next-intl';
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form';

import { Checkbox } from '@/components/common';
import { FormCheckbox } from '@/components/form';
import { PRIVACY_POLICY_CONTENT } from '@/constants/privacy-policy';
import { TERM_OF_SERVICE_CONTENT } from '@/constants/term-of-service';
import { UserMemberType } from '@/enums/user';
import { User, UsersFour } from '@/icons';

import { MemberTypeCard } from './MemberTypeCard';
import { RegisterSchema } from './schema';

interface RegisterTypeStepProps {
  control: Control<RegisterSchema>;
  watch: UseFormWatch<RegisterSchema>;
  setValue: UseFormSetValue<RegisterSchema>;
}

export const RegisterTypeStep: React.FC<RegisterTypeStepProps> = ({ control, watch, setValue }) => {
  const tAuth = useTranslations('auth');

  const memberType = watch('memberType');
  const [termOfService, privacyPolicy, smsReception, emailReception] = watch([
    'termOfService',
    'privacyPolicy',
    'smsReception',
    'emailReception',
  ]);

  const allChecked = termOfService && privacyPolicy && smsReception && emailReception;

  const handleToggleAll = (checked: boolean) => {
    setValue('termOfService', checked);
    setValue('privacyPolicy', checked);
    setValue('smsReception', checked);
    setValue('emailReception', checked);
  };

  return (
    <div className='w-full space-y-8 sm:space-y-12'>
      <div className='w-full space-y-4'>
        <div className='space-y-1.5 sm:space-y-1'>
          <h3 className='title-16 sm:title-18 font-semibold'>{tAuth('membership_type')}</h3>
          <p className='body-14 text-text-secondary'>{tAuth('select_membership_type')}</p>
        </div>

        <div className='grid grid-cols-2 gap-4 sm:gap-6'>
          <MemberTypeCard
            icon={User}
            title={tAuth('individual_member')}
            description={tAuth('general_individual_member')}
            selected={memberType === UserMemberType.INDIVIDUAL}
            onClick={() => setValue('memberType', UserMemberType.INDIVIDUAL)}
          />
          <MemberTypeCard
            icon={UsersFour}
            title={tAuth('corporate_member')}
            description={tAuth('member_with_business_certificate')}
            selected={memberType === UserMemberType.BUSINESS}
            onClick={() => setValue('memberType', UserMemberType.BUSINESS)}
          />
        </div>
      </div>

      {/* Terms of Use Section */}
      <div className='w-full space-y-4'>
        <h3 className='title-16 sm:title-18 font-semibold'>{tAuth('term_of_use')}</h3>

        <div className='text-text-main space-y-3'>
          <Checkbox label={tAuth('agree_to_all')} checked={allChecked} onChange={handleToggleAll} />

          <div className='border-border-soft space-y-6 rounded-[12px] border p-6'>
            {/* Term of Service */}
            <div className='space-y-3'>
              <FormCheckbox control={control} name='termOfService' label={tAuth('term_of_service')} />
              <div
                data-lenis-prevent
                className='bg-fill-light text-text-secondary body-14 scrollbar-thin max-h-[156px] overflow-y-auto rounded-[8px] p-3 whitespace-pre-wrap'>
                <div className='whitespace-normal' dangerouslySetInnerHTML={{ __html: TERM_OF_SERVICE_CONTENT }} />
              </div>
            </div>

            {/* Privacy Policy */}
            <div className='space-y-3'>
              <FormCheckbox control={control} name='privacyPolicy' label={tAuth('privacy_policy')} />
              <div
                data-lenis-prevent
                className='bg-fill-light text-text-secondary body-14 scrollbar-thin max-h-[156px] overflow-y-auto rounded-[8px] p-3 whitespace-pre-wrap'>
                <div className='whitespace-normal' dangerouslySetInnerHTML={{ __html: PRIVACY_POLICY_CONTENT }} />
              </div>
            </div>

            {/* SMS Reception */}
            <div className='space-y-3'>
              <FormCheckbox control={control} name='smsReception' label={tAuth('sms_reception')} />
              <div className='bg-fill-light text-text-secondary body-14 scrollbar-thin max-h-[156px] overflow-y-auto rounded-[8px] p-3 whitespace-pre-wrap'>
                {tAuth('sms_reception_content')}
              </div>
            </div>

            {/* Email Reception */}
            <div className='space-y-3'>
              <FormCheckbox control={control} name='emailReception' label={tAuth('email_reception')} />
              <div className='bg-fill-light text-text-secondary body-14 scrollbar-thin max-h-[156px] overflow-y-auto rounded-[8px] p-3 whitespace-pre-wrap'>
                {tAuth('email_reception_content')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
