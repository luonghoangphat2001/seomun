'use client';

import { forwardRef } from 'react';
import { Modal, ModalHandle } from '.';
import { useTranslations } from 'next-intl';
import { Button } from '../button';

type ConfirmModalProps = {
  onClose: () => void;
  title?: string;
  description?: string;
  textConfirm?: string;
  onConfirm?: () => void;
  isLoading?: boolean;
};

export const ConfirmModal = forwardRef<ModalHandle, ConfirmModalProps>(
  ({ onClose, title, description, textConfirm, onConfirm, isLoading }, ref) => {
    const t = useTranslations();

    return (
      <Modal
        ref={ref}
        title={title || t('editor.delete')}
        closeOnOverlayClick={false}
        size='sm'
        footer={
          <div className='flex gap-2'>
            <Button variant='outline' disabled={isLoading} fullWidth onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button variant='primary' disabled={isLoading} fullWidth onClick={onConfirm} loading={isLoading}>
              {textConfirm || t('editor.delete')}
            </Button>
          </div>
        }>
        <div className='p-4 text-center'>
          <p className='body-16'>{description || t('common.confirm_delete')}</p>
        </div>
      </Modal>
    );
  },
);

ConfirmModal.displayName = 'ConfirmModal';
