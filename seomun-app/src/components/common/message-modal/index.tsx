'use client';

import { Check, WarningCircle } from '@/icons';
import { forwardRef, ReactNode, useImperativeHandle, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '../button';
import { Modal, ModalHandle } from '../modal';
import { cn } from '@/lib/utils';

export type MessageModalType = 'success' | 'error';

export interface MessageModalProps {
  type?: MessageModalType;
  title?: ReactNode;
  message?: ReactNode;
  confirmText?: ReactNode;
  onClose?: () => void;
}

export const MessageModal = forwardRef<ModalHandle, MessageModalProps>(
  ({ type = 'success', title, message, confirmText, onClose }, ref) => {
    const t = useTranslations('common');
    const modalRef = useRef<ModalHandle>(null);
    const isSuccess = type === 'success';

    useImperativeHandle(ref, () => ({
      open: () => modalRef.current?.open(),
      close: () => modalRef.current?.close(),
    }));

    return (
      <Modal ref={modalRef} size='xs' className='mx-4 w-full max-w-90' onClose={onClose}>
        <div className='flex flex-col items-center px-6 pt-8 pb-6 text-center'>
          <div
            className={cn(
              'mb-4 flex size-14 items-center justify-center rounded-full',
              isSuccess ? 'bg-emerald-50 text-emerald-600' : 'text-error bg-red-50',
            )}>
            {isSuccess ? <Check className='size-7 stroke-2' /> : <WarningCircle className='size-8 stroke-2' />}
          </div>

          <h2 className='title-20 text-text-main'>{title ?? t(isSuccess ? 'success' : 'error')}</h2>
          {message && <p className='body-14 text-text-secondary mt-2 whitespace-pre-wrap'>{message}</p>}

          <Button className='mt-6' fullWidth onClick={() => modalRef.current?.close()}>
            {confirmText ?? t('check')}
          </Button>
        </div>
      </Modal>
    );
  },
);

MessageModal.displayName = 'MessageModal';
