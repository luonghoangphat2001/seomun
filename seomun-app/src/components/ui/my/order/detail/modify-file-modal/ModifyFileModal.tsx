'use client';

import { OrderHistoryDesignFileRESP } from '@/apis/my/order/order.response';
import { Button, Modal, ModalHandle, SafeImage } from '@/components/common';
import { ALLOWED_DESIGN_FILE_EXTENSIONS } from '@/constants/common';
import { useMediaQuery } from '@/hooks';
import { Download, File } from '@/icons';
import { cn, formatFileSize, handleFileDownload } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { forwardRef, useState } from 'react';
import ModifyFileForm, { MODIFY_FILE_FORM_ID } from './ModifyFileForm';

type ModifyFile = Pick<OrderHistoryDesignFileRESP, 'url' | 'name'> & Partial<Pick<OrderHistoryDesignFileRESP, 'mime' | 'size'>>;

type ModifyFileModalProps = {
  orderNumber?: string;
  orderItemId?: number;
  file?: ModifyFile | null;
  previewImages?: string[];
  openCheckModal?: () => void;
  isProofConfirming?: boolean;
  canConfirmProofreading?: boolean;
};

const DESIGN_FILE_TYPE_TRANSLATION_KEYS: Record<string, string> = {
  pdf: 'common.file_type_pdf',
  jpg: 'common.file_type_jpg',
  jpeg: 'common.file_type_jpg',
  png: 'common.file_type_png',
  ai: 'common.file_type_ai',
  eps: 'common.file_type_eps',
  zip: 'common.file_type_zip',
};

export const ModifyFileModal = forwardRef<ModalHandle, ModifyFileModalProps>(
  (
    {
      orderNumber,
      orderItemId,
      file,
      previewImages = [],
      openCheckModal,
      isProofConfirming = false,
      canConfirmProofreading = false,
    },
    ref,
  ) => {
    const t = useTranslations();
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const [isModify, setIsModify] = useState(false);
    const [isResubmitting, setIsResubmitting] = useState(false);
    const fileSize = Number(file?.size);
    const fileExtension = file?.name.split('.').pop()?.toLowerCase();
    const fileType =
      fileExtension && ALLOWED_DESIGN_FILE_EXTENSIONS.has(fileExtension)
        ? t(DESIGN_FILE_TYPE_TRANSLATION_KEYS[fileExtension] ?? 'common.file')
        : t('common.file');

    const onClose = () => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.close();
      }
    };

    const resetModal = () => {
      setIsModify(false);
      setIsResubmitting(false);
    };

    return (
      <Modal
        ref={ref}
        onClose={resetModal}
        position={isDesktop ? 'center' : 'bottom'}
        title={
          <div className='w-full md:px-6 md:pt-2.5 md:pb-0.5'>
            <p className='title-18 md:title-24'>{isModify ? t('order.resubmit_file') : t('common.modify_file_and_verify')}</p>
          </div>
        }
        titleClassName='pt-0'
        size='md'
        className='max-h-dvh max-w-200'
        footer={
          <div className='flex flex-wrap justify-end gap-3 md:gap-4 md:px-6 md:pt-2'>
            {!isModify ? (
              <>
                <Button variant='ghost' onClick={onClose} className='hidden md:inline-block' size={isDesktop ? 'default' : 'sm'}>
                  {t('common.cancel')}
                </Button>
                <Button variant='outline' onClick={() => setIsModify(true)} disabled={!file}>
                  {t('order.resubmit_file')}
                </Button>
                <Button
                  onClick={() => openCheckModal?.()}
                  size={isDesktop ? 'default' : 'sm'}
                  loading={isProofConfirming}
                  disabled={!orderNumber || !canConfirmProofreading || isProofConfirming}>
                  {t('order.proofreading_confirm')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant='outline'
                  onClick={() => setIsModify(false)}
                  size={isDesktop ? 'default' : 'sm'}
                  disabled={isResubmitting}>
                  {t('common.cancel')}
                </Button>
                <Button
                  form={MODIFY_FILE_FORM_ID}
                  type='submit'
                  size={isDesktop ? 'default' : 'sm'}
                  loading={isResubmitting}
                  disabled={!orderNumber || !orderItemId || isResubmitting}>
                  {t('common.send_request')}
                </Button>
              </>
            )}
          </div>
        }>
        {!isModify ? (
          <div className={cn('border-border-soft w-full border-y px-4 py-6 max-md:border-none md:px-10 md:py-6')}>
            <div className='scrollbar-thin max-h-122.5 space-y-4 overflow-auto md:max-h-77'>
              {previewImages.length > 0 && (
                <div className='flex flex-col gap-2 md:flex-row md:gap-6'>
                  {previewImages.map((image) => (
                    <div key={image} className='relative h-48.25 w-full md:flex-1'>
                      <SafeImage src={image} alt={file?.name ?? 'design'} fill className='object-contain' />
                    </div>
                  ))}
                </div>
              )}
              {file ? (
                <div className='border-border-brand bg-primary-50 flex items-center gap-3 rounded-lg border p-4'>
                  <File className='text-text-brand size-8' />
                  <div className='flex-1 space-y-1'>
                    <p className='title-14 md:title-16'>{file.name}</p>
                    <p className='caption-12 text-text-secondary'>
                      {fileType}
                      {Number.isFinite(fileSize) && ` • ${formatFileSize(fileSize)}`}
                    </p>
                  </div>
                  <button
                    type='button'
                    className='cursor-pointer hover:opacity-80'
                    onClick={() => handleFileDownload(file.url, file.name)}>
                    <Download className='text-text-brand size-5' />
                  </button>
                </div>
              ) : (
                <p className='body-14 text-text-secondary py-10 text-center'>-</p>
              )}
            </div>
          </div>
        ) : (
          <ModifyFileForm
            orderNumber={orderNumber}
            orderItemId={orderItemId}
            onSuccess={onClose}
            onPendingChange={setIsResubmitting}
          />
        )}
      </Modal>
    );
  },
);

ModifyFileModal.displayName = 'ModifyFileModal';
