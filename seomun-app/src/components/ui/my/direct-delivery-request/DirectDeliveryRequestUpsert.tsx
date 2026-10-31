'use client';

import { useDirectShippingCreateMutation } from '@/apis/customer-service/direct-shipping/direct-shipping.query';
import { Button, Popover } from '@/components/common';
import { FormAddress, FormCellphone, FormInput, FormRow, FormTextarea, FormUpload } from '@/components/form';
import { PHONE_OPTIONS } from '@/constants/common';
import { useAuthStore, useMediaQuery } from '@/hooks';
import { Info } from '@/icons';
import { useRouter } from '@/i18n/navigation';
import { splitPhonePattern } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageTitle from '../components/PageTitle';
import { directDeliveryRequestDefault, DirectDeliveryRequestFormValues, directDeliveryRequestSchema } from './schema';

export const DirectDeliveryRequestUpsert = () => {
  const t = useTranslations();
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { mutate: createDirectShipping, isPending } = useDirectShippingCreateMutation();
  const { profile } = useAuthStore();

  const form = useForm<DirectDeliveryRequestFormValues>({
    defaultValues: directDeliveryRequestDefault,
    resolver: zodResolver(directDeliveryRequestSchema(t)),
  });
  const { control, handleSubmit, reset } = form;

  useEffect(() => {
    if (!profile?.profile) return;

    const phone = splitPhonePattern(profile.profile.mobile);

    reset({
      ...directDeliveryRequestDefault,
      name: profile.profile.name ?? '',
      phonePrefix: phone?.part1 ?? '',
      phone1: phone?.part2 ?? '',
      phone2: phone?.part3 ?? '',
      zipCode: profile.profile.postcode ?? '',
      address: profile.profile.address ?? '',
      detailedAddress: profile.profile.detailed_address || '',
    });
  }, [profile, reset]);

  const onCreate = handleSubmit((input: DirectDeliveryRequestFormValues) => {
    if (isPending) return;

    const phone = `${input.phonePrefix}${input.phone1}${input.phone2}`.replace(/\D/g, '');
    const firstFile = input.files?.[0]?.file;

    createDirectShipping(
      {
        shipping_name: input.type,
        recipient_name: input.name.trim(),
        phone: phone || undefined,
        postcode: input.zipCode.trim() || undefined,
        address: input.address.trim(),
        detailed_address: input.detailedAddress?.trim() || undefined,
        storage_location: input.storage?.trim() || undefined,
        file: firstFile,
        detail_request: input.detail?.trim() || '',
      },
      {
        onSuccess: (resp) => {
          toast.success(resp.message ?? t('common.success_create'));
          router.push(ROUTES.MY_PAGE.DIRECT_SHIPPING_REQUEST);
        },
        onError: (error) => {
          toast.error(error.response?.data.message ?? t('common.fail_create'));
        },
      },
    );
  });

  return (
    <main className='relative -mt-4 space-y-4 md:mt-0 md:space-y-8'>
      <PageTitle
        title={t('inquiry.delivery_request')}
        returnRoute={ROUTES.MY_PAGE.DIRECT_SHIPPING_REQUEST}
        extra={
          <div className='mobile-button flex gap-3 md:hidden md:gap-4'>
            <Button className='body-16 h-12 flex-1 md:h-10 md:w-auto' onClick={onCreate} loading={isPending}>
              {t('inquiry.register')}
            </Button>
          </div>
        }
      />
      <FormProvider {...form}>
        <section className='max-w-171 space-y-4'>
          {/* Still validated by the schema; the asterisk is intentionally hidden. */}
          <FormInput
            labelPlacement={isDesktop ? 'left' : 'top'}
            label={t('inquiry.delivery_address')}
            control={control}
            name='type'
            placeholder={t('inquiry.delivery_address')}
            containerClassName='gap-1 md:gap-12'
            labelClassName='md:min-w-[94px] w-full md:w-[94px] mr-0'
          />
          <FormInput
            labelPlacement={isDesktop ? 'left' : 'top'}
            label={t('inquiry.name')}
            control={control}
            name='name'
            placeholder={t('inquiry.name')}
            containerClassName='gap-1 md:gap-12'
            labelClassName='md:min-w-[94px] w-full md:w-[94px] mr-0'
            required
          />
          <FormCellphone
            labelPlacement={isDesktop ? 'left' : 'top'}
            label={t('inquiry.phone_number')}
            control={control}
            namePrefix='phonePrefix'
            name1='phone1'
            name2='phone2'
            phoneOptions={PHONE_OPTIONS}
            isPrefixInput
            labelClassName='w-full md:w-[94px] mr-0'
            className='gap-1 md:gap-12'
            verificationClassName='hidden'
            required
          />
          <FormAddress
            labelPlacement={isDesktop ? 'left' : 'top'}
            label={t('inquiry.address')}
            control={control}
            nameZipCode='zipCode'
            nameAddress='address'
            nameDetailedAddress='detailedAddress'
            required
            zipCodePlaceholder={t('auth.zip_code_search')}
            addressPlaceholder={t('auth.address')}
            detailedAddressPlaceholder={t('auth.detailed_address')}
            searchLabel={t('auth.zip_code_search')}
            labelClassName='w-full md:w-[94px] mr-0'
            className='gap-1 md:gap-12'
            popoverContent={t('inquiry.ensure_smooth_delivery')}
            iconClassName='size-5 text-text-brand-secondary'
          />
          <FormRow
            labelPlacement={isDesktop ? 'left' : 'top'}
            label={t('inquiry.storage_location')}
            className='gap-1 md:gap-12'
            labelClassName='md:min-w-[94px] w-full md:w-[94px] mr-0'
            icon={
              <Popover
                contentClassName='w-[220px] caption-12'
                trigger={<Info className='text-text-brand-secondary size-5' />}
                align='left'>
                {t('inquiry.take_a_photo')}
              </Popover>
            }>
            <div className='flex flex-col gap-2'>
              <FormInput
                control={control}
                name='storage'
                placeholder={t('inquiry.storage_location')}
                containerClassName='w-full'
                hideError
              />
              <FormUpload
                control={control}
                name='files'
                labelButton={t('inquiry.file_upload')}
                helperText={t('inquiry.image_limit')}
                multiple={false}
              />
            </div>
          </FormRow>
          <FormTextarea
            labelPlacement={isDesktop ? 'left' : 'top'}
            label={t('inquiry.detailed_request')}
            control={control}
            name='detail'
            placeholder={t('inquiry.detailed_request')}
            rows={5}
            containerClassName='gap-1 md:gap-12 items-start'
            labelClassName='md:min-w-[94px] w-full md:w-[94px] mr-0 md:py-2'
            required
          />

          <Button size='lg' className='mt-8 hidden w-full md:inline-flex' onClick={onCreate} loading={isPending}>
            {t('inquiry.register')}
          </Button>
        </section>
      </FormProvider>
    </main>
  );
};
