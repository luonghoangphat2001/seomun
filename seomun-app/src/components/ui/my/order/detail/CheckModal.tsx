'use client';

import { Button, Modal, ModalHandle } from '@/components/common';
import { useTranslations } from 'next-intl';
import { forwardRef } from 'react';

type CheckModalProps = {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export const CheckModal = forwardRef<ModalHandle, CheckModalProps>(({ onConfirm, onCancel, isLoading = false }, ref) => {
  const t = useTranslations();

  const onCheck = () => {
    onConfirm();
  };

  return (
    <Modal
      ref={ref}
      onClose={onCancel}
      title={<h2 className='modal-title'>{t('order.please_check')}</h2>}
      className='max-w-85.75 md:w-[95%] md:max-w-200'
      titleClassName='pt-0'
      footer={
        <div className='modal-footer justify-center gap-3 md:justify-end md:gap-4'>
          <Button variant={'outline'} onClick={onCancel} className='modal-footer-button' disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button className='modal-footer-button' onClick={onCheck} loading={isLoading} disabled={isLoading}>
            {t('common.check')}
          </Button>
        </div>
      }>
      <div className='modal-body flex flex-col items-center justify-center space-y-1 px-6 py-2 md:h-87 md:space-y-3 md:p-0'>
        <p className='title-14 md:title-20 text-center'>{t('order.print_proceed_proofreading')}</p>
        <p className='body-14 md:body-18 text-center'>{t('order.confirm_proceed_proofreading')}</p>
      </div>
    </Modal>
  );
});

CheckModal.displayName = 'CheckModal';
