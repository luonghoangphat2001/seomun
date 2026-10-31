'use client';

import { useSwitchToAccountBusinessMutation } from '@/apis/my/profile/profile.query';
import { SwitchToBusinessREQ } from '@/apis/my/profile/profile.request';
import { Button, Modal, ModalHandle } from '@/components/common';
import { FormAddress, FormInput, FormUpload } from '@/components/form';
import { useMediaQuery } from '@/hooks';
import { refreshAuthProfile } from '@/lib/utils/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { forwardRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { switchToBusinessDefault, switchToBusinessSchema, SwitchToBusinessFormValues } from './schema';

const SWITCH_TO_BUSINESS_FORM_ID = 'switch-to-business-form';

export const SwitchToBusinessModal = forwardRef<ModalHandle>((_, ref) => {
  const t = useTranslations();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const form = useForm<SwitchToBusinessFormValues>({
    mode: 'all',
    defaultValues: switchToBusinessDefault,
    resolver: zodResolver(switchToBusinessSchema(t)),
  });
  const { mutateAsync: switchToBusiness, isPending } = useSwitchToAccountBusinessMutation();

  const closeModal = () => {
    if (ref && 'current' in ref) {
      ref.current?.close();
    }
  };

  const resetModal = () => {
    form.reset(switchToBusinessDefault);
  };

  const onSubmit = async (input: SwitchToBusinessFormValues) => {
    const request: SwitchToBusinessREQ = {
      company_name: input.companyName?.trim(),
      business_registration_number: input.bizRegNumber?.trim(),
      representative_name: input.ceoName?.trim(),
      industry_type: input.industry?.trim(),
      business_type: input.bizType?.trim(),
      business_postcode: input.bizZipCode?.trim(),
      business_address: input.bizAddress?.trim(),
      business_address_detail: input.bizDetailedAddress?.trim(),
      tax_invoice_email: input.taxEmail?.trim(),
      homepage_url: input.homepage?.trim(),
      business_registration_file: input.bizCertificate[0]?.file,
    };

    try {
      await switchToBusiness(request);
      await refreshAuthProfile();
      toast.success(t('common.success_update'));
      closeModal();
    } catch (error) {
      const message =
        typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;

      toast.error(message ?? t('common.fail_update'));
    }
  };

  // eslint-disable-next-line react-hooks/refs
  const handleFormSubmit = form.handleSubmit(onSubmit);

  return (
    <Modal
      ref={ref}
      position={isDesktop ? 'center' : 'bottom'}
      title={<h2 className='modal-title'>{t('my.convert_corporate_member')}</h2>}
      titleClassName='pt-0'
      size='lg'
      className='max-h-dvh md:w-[95%]'
      onClose={resetModal}
      footer={
        <div className='modal-footer'>
          <Button variant='outline' onClick={closeModal} className='modal-footer-button' disabled={isPending}>
            {t('common.cancel')}
          </Button>
          <Button
            form={SWITCH_TO_BUSINESS_FORM_ID}
            type='submit'
            className='modal-footer-button'
            loading={isPending}
            disabled={isPending}>
            {t('common.save')}
          </Button>
        </div>
      }>
      <FormProvider {...form}>
        <form id={SWITCH_TO_BUSINESS_FORM_ID} onSubmit={handleFormSubmit} className='modal-body space-y-4 md:space-y-6'>
          <FormInput
            labelPlacement={isDesktop ? 'left' : 'top'}
            label={t('auth.business_registration_number')}
            control={form.control}
            name='bizRegNumber'
            placeholder={t('auth.business_registration_number')}
            required
            labelClassName='w-full md:w-[160px]'
            inputClassName='w-full'
          />
          <FormInput
            labelPlacement={isDesktop ? 'left' : 'top'}
            label={t('auth.company_name')}
            control={form.control}
            name='companyName'
            placeholder={t('auth.company_name')}
            required
            labelClassName='w-full md:w-[160px]'
            inputClassName='w-full'
          />
          <FormInput
            labelPlacement={isDesktop ? 'left' : 'top'}
            label={t('auth.representative_name')}
            control={form.control}
            name='ceoName'
            placeholder={t('auth.representative_name')}
            required
            labelClassName='w-full md:w-[160px]'
            inputClassName='w-full'
          />
          <FormInput
            labelPlacement={isDesktop ? 'left' : 'top'}
            label={t('auth.industry')}
            control={form.control}
            name='industry'
            placeholder={t('auth.industry')}
            required
            labelClassName='w-full md:w-[160px]'
            inputClassName='w-full'
          />
          <FormInput
            labelPlacement={isDesktop ? 'left' : 'top'}
            label={t('auth.business_type')}
            control={form.control}
            name='bizType'
            placeholder={t('auth.business_type')}
            required
            labelClassName='w-full md:w-[160px]'
            inputClassName='w-full'
          />
          <FormAddress
            labelPlacement={isDesktop ? 'left' : 'top'}
            control={form.control}
            nameZipCode='bizZipCode'
            nameAddress='bizAddress'
            nameDetailedAddress='bizDetailedAddress'
            label={t('auth.address')}
            required
            zipCodePlaceholder={t('auth.zip_code_search')}
            addressPlaceholder={t('auth.address')}
            detailedAddressPlaceholder={t('auth.detailed_address')}
            searchLabel={t('auth.zip_code_search')}
            labelClassName='w-full md:w-[160px] shrink-1'
            inputClassName='w-full'
          />
          <FormInput
            labelPlacement={isDesktop ? 'left' : 'top'}
            label={t('auth.email')}
            subLabel={t('auth.for_tax')}
            control={form.control}
            name='taxEmail'
            type='email'
            placeholder={t('auth.email')}
            required
            labelClassName='w-full md:w-[160px]'
            inputClassName='w-full'
          />
          <FormInput
            labelPlacement={isDesktop ? 'left' : 'top'}
            label={t('auth.homepage')}
            control={form.control}
            name='homepage'
            placeholder={t('auth.homepage')}
            labelClassName='w-full md:w-[160px]'
            inputClassName='w-full'
          />
          <FormUpload
            labelPlacement={isDesktop ? 'left' : 'top'}
            label={t('auth.business_registration_certificate')}
            control={form.control}
            name='bizCertificate'
            labelButton={t('auth.upload')}
            helperText={t('auth.upload_support_message')}
            required
            labelClassName='w-full md:w-[160px]'
            containerClassName='[&>div]:w-full'
            multiple={false}
            accept='image/*,application/pdf'
          />
        </form>
      </FormProvider>
    </Modal>
  );
});

SwitchToBusinessModal.displayName = 'SwitchToBusinessModal';
