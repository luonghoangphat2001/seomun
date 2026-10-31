'use client';

import { Button, Modal, ModalHandle } from '@/components/common';
import { FormTextarea, FormUpload } from '@/components/form';
import { useTranslations } from 'next-intl';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { FormProvider, UseFormReturn } from 'react-hook-form';
import { AdditionalInquiryFormValues } from './schema';

type ShippingInquiryDetailModalProps = {
  form: UseFormReturn<AdditionalInquiryFormValues>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  loading?: boolean;
};

export const ShippingInquiryDetailModal = forwardRef<ModalHandle, ShippingInquiryDetailModalProps>(
  ({ form, onSubmit, loading }, ref) => {
    const t = useTranslations();
    const {
      control,
      formState: { isDirty },
    } = form;

    const modalRef = useRef<ModalHandle>(null);

    useImperativeHandle(ref, () => ({
      open: () => modalRef.current?.open(),
      close: () => modalRef.current?.close(),
    }));

    return (
      <Modal
        ref={modalRef}
        position='bottom'
        size='md'
        title={t('inquiry.additional_inquiries')}
        className='md:hidden [&>div:first-child]:items-center'
        footer={
          <div className='flex justify-end gap-4'>
            <Button type='button' size='md' className='px-4' variant='outline' onClick={() => modalRef.current?.close()}>
              {t('common.cancel')}
            </Button>
            <Button
              type='button'
              size='md'
              className='px-4'
              variant='primary'
              disabled={!isDirty}
              loading={loading}
              onClick={onSubmit}>
              {t('common.check')}
            </Button>
          </div>
        }>
        <div className='p-4'>
          <FormProvider {...form}>
            <form className='space-y-4' onSubmit={onSubmit}>
              <FormTextarea
                control={control}
                name='comment'
                label={t('inquiry.company_name')}
                placeholder={t('inquiry.enter_comment')}
                rows={5}
                labelPlacement='top'
                required
              />
              <FormUpload
                control={control}
                name='files'
                label={t('inquiry.attachment')}
                labelButton={t('inquiry.file_upload')}
                helperText={t('inquiry.image_limit')}
                labelPlacement='top'
              />
            </form>
          </FormProvider>
        </div>
      </Modal>
    );
  },
);

ShippingInquiryDetailModal.displayName = 'ShippingInquiryDetailModal';
