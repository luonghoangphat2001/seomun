'use client';

import { SavedOptionRESP } from '@/apis/my/saved-options/saved-options.response';
import { Button, Modal, ModalHandle } from '@/components/common';
import { useTranslations } from 'next-intl';
import { forwardRef, useRef } from 'react';

import { LoadOptionsModal } from './LoadOptionsModal';
import { SaveOptionsModal } from './SaveOptionsModal';

type OptionsModalProps = {
  onApplySavedOption?: (item: SavedOptionRESP) => void;
  productId?: number;
};

export const OptionsModal = forwardRef<ModalHandle, OptionsModalProps>(({ onApplySavedOption, productId }, ref) => {
  const t = useTranslations();

  const loadOptionsModalRef = useRef<ModalHandle>(null);
  const saveOptionsModalRef = useRef<ModalHandle>(null);

  const onClose = () => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.close();
    }
  };

  const handleApplySavedOption = (item: SavedOptionRESP) => {
    onApplySavedOption?.(item);
    onClose();
  };

  return (
    <Modal ref={ref} position={'bottom'} size='md'>
      <div className='space-y-4 p-4'>
        <Button type='button' size='lg' variant='outline' fullWidth onClick={() => loadOptionsModalRef.current?.open()}>
          {t('product.load_options')}
        </Button>
        <Button type='button' size='lg' variant='outline' fullWidth onClick={() => saveOptionsModalRef.current?.open()}>
          {t('product.save_options')}
        </Button>
        <LoadOptionsModal ref={loadOptionsModalRef} onApply={handleApplySavedOption} productId={productId} />
        <SaveOptionsModal ref={saveOptionsModalRef} />
      </div>
    </Modal>
  );
});

OptionsModal.displayName = 'OptionsModal';
