'use client';

import { FormAddress, FormCellphone, FormCheckbox, FormDeliveryMessage, FormInput } from '@/components/form';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { ShippingAddressFormValues } from '../../schema';
import { useMediaQuery } from '@/hooks';
import { cn } from '@/lib/utils';
import { DELIVERY_MESSAGE_OPTIONS, PHONE_OPTIONS } from '@/constants/common';

const ShippingAddressAddForm = () => {
  const tAuth = useTranslations('auth');
  const t = useTranslations();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const labelPlacement = isDesktop ? 'left' : 'top';
  const { control } = useFormContext<ShippingAddressFormValues>();

  return (
    <div
      className={cn('border-border-soft scrollbar-hide max-h-111 overflow-auto border-y px-4 py-6 max-md:border-none md:px-10')}>
      <form className='space-y-4 md:max-w-125 md:space-y-5'>
        <FormInput
          control={control}
          name='ordererName'
          placeholder={t('footer.preface_printing')}
          label={t('common.orderer')}
          labelPlacement={labelPlacement}
          containerClassName='flex-1'
          labelClassName='w-[126px] gap-1'
          inputClassName='w-full md:w-[358px]'
          required
        />
        <FormAddress
          control={control}
          nameZipCode='postCode'
          nameAddress='address'
          nameDetailedAddress='addressDetail'
          label={tAuth('address')}
          zipCodePlaceholder={tAuth('zip_code_search')}
          addressPlaceholder={tAuth('address')}
          detailedAddressPlaceholder={tAuth('detailed_address')}
          searchLabel={tAuth('zip_code_search')}
          labelClassName='w-[126px] mb-0'
          inputClassName='w-full md:w-[358px]'
          required
          labelPlacement={labelPlacement}
        />
        <FormCellphone
          required
          labelPlacement={labelPlacement}
          control={control}
          namePrefix='phoneHead'
          name1='phoneBody'
          name2='phoneTail'
          label={t('auth.phone_number')}
          phoneOptions={PHONE_OPTIONS}
          placeholderSelect={tAuth('select')}
          labelClassName='w-[126px] mb-0'
          inputClassName='w-full md:w-[358px]'
          verificationClassName='hidden'
        />

        <FormDeliveryMessage
          labelPlacement={labelPlacement}
          control={control}
          messageOptions={DELIVERY_MESSAGE_OPTIONS}
          nameMessageOption='messageOption'
          nameMessageNote='messageNote'
          label={t('common.delivery_message')}
          messageOptionPlaceholder={t('common.select')}
          messageNotePlaceholder={t('placeholder.direct_message')}
          labelClassName='w-full md:w-[126px] shrink'
          inputClassName='w-full md:max-w-[358px]'
        />

        <div className='mt-1'>
          <FormCheckbox
            control={control}
            name='isDefault'
            label={t('common.set_default_address')}
            labelClassName='body-18 ml-2'
          />
        </div>
      </form>
    </div>
  );
};

export default ShippingAddressAddForm;
