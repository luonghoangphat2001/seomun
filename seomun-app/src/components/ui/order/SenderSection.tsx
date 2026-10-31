'use client';

import { useFormContext } from 'react-hook-form';
import { OrderCheckOutFormValues } from './schema';
import { useTranslations } from 'next-intl';
import { FormAddress, FormCellphone, FormCheckbox, FormInput } from '@/components/form';
import { useMediaQuery } from '@/hooks';
import { PHONE_OPTIONS } from '@/constants/common';

const SenderSection = () => {
  const t = useTranslations('');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { control, watch } = useFormContext<OrderCheckOutFormValues>();
  const isChangeSenderInfo = watch('isChangeSenderInfo');

  return (
    <section className='border-border-soft border-t pt-6 md:pt-8'>
      <div className='flex items-center gap-5'>
        <p className='title-18'>{t('common.sender')}</p>
        <FormCheckbox
          control={control}
          name='isChangeSenderInfo'
          label={t('common.change_sender_info')}
          labelClassName='body-16'
        />
      </div>
      {isChangeSenderInfo && (
        <div className='mt-6 space-y-4 md:max-w-125 md:space-y-6'>
          <FormInput
            control={control}
            name='senderInfo.businessName'
            placeholder={t('footer.preface_printing')}
            label={t('common.name_business')}
            labelPlacement={isDesktop ? 'left' : 'top'}
            labelClassName='w-[126px] gap-1'
            inputClassName='w-full md:w-[358px]'
            required
          />
          <FormCellphone
            labelPlacement={isDesktop ? 'left' : 'top'}
            control={control}
            namePrefix='senderInfo.phoneHead'
            name1='senderInfo.phoneBody'
            name2='senderInfo.phoneTail'
            label={t('common.contact_info')}
            phoneOptions={PHONE_OPTIONS}
            // placeholderSelect={t('auth.select')}
            isPrefixInput
            labelClassName='w-[126px] mb-0'
            inputClassName='w-full md:w-[358px]'
            verificationClassName='hidden'
            required
          />
          <FormAddress
            required
            control={control}
            nameZipCode='senderInfo.postCode'
            nameAddress='senderInfo.address'
            nameDetailedAddress='senderInfo.addressDetail'
            label={t('auth.address')}
            zipCodePlaceholder={t('auth.zip_code_search')}
            addressPlaceholder={t('auth.address')}
            detailedAddressPlaceholder={t('auth.detailed_address')}
            searchLabel={t('auth.zip_code_search')}
            labelClassName='w-[126px] mb-0'
            inputClassName='w-full md:w-[358px]'
            labelPlacement={isDesktop ? 'left' : 'top'}
          />
        </div>
      )}
    </section>
  );
};

export default SenderSection;
