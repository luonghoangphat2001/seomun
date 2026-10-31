'use client';

import { Button, MessageModal, Modal, ModalHandle, Radio } from '@/components/common';
import { FormDragDrop, FormInput, FormRadioGroup } from '@/components/form';
import { ALLOWED_DESIGN_FILE_ACCEPT, isAllowedDesignFile, UNSUPPORTED_DESIGN_FILE_MESSAGE } from '@/constants/common';
import { PrintOption } from '@/enums/product';
import { useAuthStore, useMediaQuery } from '@/hooks';
import { useRouter } from '@/i18n/navigation';
import { LOCAL_STORAGE_KEYS, LocalStorage } from '@/lib/storages';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FileUploadFormValues, getFileUploadSchema } from './schema';
import { cn } from '@/lib/utils';
import { useUploadProductFileMutation } from '@/apis/product/product.query';
import { useUploadFileMutation } from '@/apis/file/file.query';
import { transformUploadFileInputToREQ } from '@/apis/product/product.service';
import { ROUTES } from '@/routes';
import { ProductOrderConfig, ProductSelectedOptions } from '@/types';
import type { ProductQuoteREQ } from '@/apis/product/product.request';
import { useAddToCartMutation } from '@/apis/cart/cart.query';

export type FileUploadMode = 'order' | 'cart';

export interface FileUploadModalHandle {
  open: (mode?: FileUploadMode) => void;
  close: () => void;
}

type FileUploadModalProps = {
  productSlug: string;
  quoteRequest?: ProductQuoteREQ;
  quotationTotal?: number;
  formValues: ProductOrderConfig;
};

const fileUploadDefaultValues: FileUploadFormValues = {
  title: '',
  printOption: PrintOption.AS_IS,
  files: [],
};

export const FileUploadModal = forwardRef<FileUploadModalHandle, FileUploadModalProps>(
  ({ productSlug, quoteRequest, quotationTotal = 0, formValues }, ref) => {
    const t = useTranslations('product');
    const tCommon = useTranslations('common');
    const tValidation = useTranslations('validation');
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const fileUploadModalRef = useRef<ModalHandle>(null);
    const mustReadModalRef = useRef<ModalHandle>(null);
    const addToCartMessageModalRef = useRef<ModalHandle>(null);
    const pendingSubmitDataRef = useRef<FileUploadFormValues | null>(null);
    const uploadModeRef = useRef<FileUploadMode>('order');
    const router = useRouter();
    const { user } = useAuthStore();
    const userId = user?.id;
    const canSelectPrintOption = quotationTotal >= 100000;
    const [addToCartMessage, setAddToCartMessage] = useState('');

    const { control, handleSubmit, reset, setError } = useForm<FileUploadFormValues>({
      resolver: zodResolver(getFileUploadSchema(t, tValidation)),
      defaultValues: fileUploadDefaultValues,
    });

    useImperativeHandle(ref, () => ({
      open: (mode: FileUploadMode = 'order') => {
        uploadModeRef.current = mode;
        reset(fileUploadDefaultValues);
        fileUploadModalRef.current?.open();
      },
      close: () => fileUploadModalRef.current?.close(),
    }));

    //upload file to s3
    const { mutate: uploadFile, isPending: isUploadingFile } = useUploadFileMutation();
    //upload product file
    const { mutate: uploadProductFile, isPending: isUploadingProductFile } = useUploadProductFileMutation();
    //add to cart
    const { mutate: addToCart, isPending: isAddingToCart } = useAddToCartMutation();
    const isUploading = isUploadingFile || isUploadingProductFile || isAddingToCart;

    const uploadDesignFile = (data: FileUploadFormValues) => {
      const file = data.files[0];
      if (!file || !userId || !quoteRequest) return;

      uploadFile(
        { type: 'designs', file },
        {
          onSuccess: (response) => {
            const request = transformUploadFileInputToREQ(
              userId,
              quoteRequest.product_id,
              data,
              response.data.file,
              canSelectPrintOption,
            );

            uploadProductFile(request, {
              onSuccess: (resp) => {
                const designGroupId = resp.data.design_group.id;

                if (uploadModeRef.current === 'cart') {
                  addToCart(
                    {
                      product_id: quoteRequest.product_id,
                      design_group_id: designGroupId,
                      quantity: quoteRequest.quantity_sets.quantity,
                      number_of_cases: quoteRequest.quantity_sets.multiplier,
                      selected_options: quoteRequest.selected_options,
                      input_options: quoteRequest.input_options,
                    },
                    {
                      onSuccess: (cartResp) => {
                        fileUploadModalRef.current?.close();
                        setAddToCartMessage(cartResp.message ?? tCommon('success'));
                        addToCartMessageModalRef.current?.open();
                      },
                    },
                  );
                  return;
                }

                LocalStorage.set<ProductSelectedOptions>(LOCAL_STORAGE_KEYS.PRODUCT_SELECTED_OPTIONS, {
                  productId: quoteRequest.product_id,
                  designGroupId,
                  quoteRequest,
                  input: formValues,
                });
                router.push(`${ROUTES.ORDER}?productSlug=${productSlug}`);
              },
            });
          },
        },
      );
    };

    const onSubmit = (data: FileUploadFormValues) => {
      if (data.files.some((file) => !isAllowedDesignFile(file))) {
        setError('files', { message: UNSUPPORTED_DESIGN_FILE_MESSAGE });
        return;
      }

      if (canSelectPrintOption && data.printOption === PrintOption.SKIP_PROOFREADING) {
        pendingSubmitDataRef.current = data;
        mustReadModalRef.current?.open();
        return;
      }

      uploadDesignFile(data);
    };

    const confirmSkipProofreading = () => {
      const pendingSubmitData = pendingSubmitDataRef.current;
      pendingSubmitDataRef.current = null;
      mustReadModalRef.current?.close();

      if (pendingSubmitData) {
        uploadDesignFile(pendingSubmitData);
      }
    };

    const onFormSubmit = (e: React.SubmitEvent) => {
      e.stopPropagation();
      handleSubmit(onSubmit)(e);
    };

    return (
      <>
        <Modal
          ref={fileUploadModalRef}
          position={isDesktop ? 'center' : 'bottom'}
          title={t('file_upload')}
          size='md'
          className='w-full md:max-w-150 [&>div:last-child]:border-t-0'
          titleClassName='title-18 md:title-24 px-0 md:px-6'
          footer={
            <div className='flex justify-end px-6'>
              <Button
                form='file-upload-form'
                type='submit'
                variant='primary'
                size='md'
                disabled={isUploading}
                loading={isUploading}
                className='h-12 w-full rounded-lg md:h-auto md:w-auto'>
                {t('continue_ordering')}
              </Button>
            </div>
          }>
          <form
            id='file-upload-form'
            onSubmit={onFormSubmit}
            className={cn('border-border-soft flex flex-col gap-6 px-4 py-6 md:px-10 md:py-8', isDesktop && 'border-t border-b')}>
            <FormInput name='title' control={control} label={'주문명'} placeholder={'주문명'} containerClassName='w-full' />

            <div className='flex flex-col gap-3'>
              <FormDragDrop
                name='files'
                control={control}
                label={t('drag_drop')}
                description='Choose a file or drag it here'
                multiple={false}
                accept={ALLOWED_DESIGN_FILE_ACCEPT}
              />
              <p className='caption-12 text-center whitespace-pre-wrap md:text-left'>{t('changed_to_pdf')}</p>
            </div>

            <div className='caption-12 flex flex-col gap-2'>
              <h4 className='title-14 font-semibold'>{t('caution')}</h4>
              <ul className='flex flex-col gap-2'>
                <li className='flex items-start gap-2'>
                  <span className='mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-300' />
                  {t('caution_1')}
                </li>
                <li className='flex items-start gap-2'>
                  <span className='mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-300' />
                  {t('caution_2')}
                </li>
                <li className='flex items-start gap-2'>
                  <span className='mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-300' />
                  {t('caution_3')}
                </li>
              </ul>
            </div>

            <FormRadioGroup name='printOption' control={control} className='flex items-center gap-12'>
              <Radio label={t('like_that')} value={PrintOption.AS_IS} disabled={!canSelectPrintOption} />
              <Radio
                label={t.rich('print_without_proofreading', {
                  brand: (chunks) => <span className='text-text-brand'>{chunks}</span>,
                })}
                value={PrintOption.SKIP_PROOFREADING}
                disabled={!canSelectPrintOption}
              />
            </FormRadioGroup>
          </form>
        </Modal>

        <Modal
          ref={mustReadModalRef}
          title={t('must_read_title')}
          titleClassName='px-2'
          size='sm'
          footer={
            <div className='flex justify-center'>
              <Button variant='primary' onClick={confirmSkipProofreading} disabled={isUploading} loading={isUploading}>
                {t('all_right')}
              </Button>
            </div>
          }>
          <div className='body-14 mx-6 text-justify'>
            {t.rich('must_read_content', {
              brand: (chunks) => <span className='title-14 text-text-brand'>{chunks}</span>,
            })}
          </div>
        </Modal>

        <MessageModal ref={addToCartMessageModalRef} type='success' message={addToCartMessage} />
      </>
    );
  },
);

FileUploadModal.displayName = 'FileUploadModal';
