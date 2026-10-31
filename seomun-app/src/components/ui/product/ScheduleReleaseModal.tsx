'use client';

import { Button, Modal, ModalHandle } from '@/components/common';
import { useTranslations } from 'next-intl';
import { forwardRef } from 'react';

export const ScheduleReleaseModal = forwardRef<ModalHandle>((_, ref) => {
  const t = useTranslations();
  const onClose = () => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.close();
    }
  };

  return (
    <Modal
      ref={ref}
      position={'center'}
      // onClose={onClose}
      title={<p className='title-18 p-2'>{t('product.schedule_release')}</p>}
      titleClassName='pt-0'
      size={'md'}
      className='max-w-200'
      footer={
        <div className='flex justify-center py-2'>
          <Button onClick={onClose} variant='ghost' className='body-16 bg-border-light'>
            {t('common.close')}
          </Button>
        </div>
      }>
      <div className='body-14 px-6'>
        {t.rich('product.schedule_release_note', {
          b: (chunks) => <b>{chunks}</b>,
          br: () => <br />,
        })}
      </div>
    </Modal>
  );
});

ScheduleReleaseModal.displayName = 'ScheduleReleaseModal';
