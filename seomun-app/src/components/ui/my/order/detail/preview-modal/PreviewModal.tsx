'use client';

import { Button, Modal, ModalHandle, SafeImage } from '@/components/common';
import { useMediaQuery } from '@/hooks';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { forwardRef } from 'react';

type PreviewModalProps = {
  images?: string[];
};

export const PreviewModal = forwardRef<ModalHandle, PreviewModalProps>(({ images = [] }, ref) => {
  const t = useTranslations();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const onClose = () => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.close();
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (isDesktop && e.deltaY !== 0) {
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  return (
    <Modal
      ref={ref}
      position={isDesktop ? 'center' : 'bottom'}
      title={
        <div className='flex w-full items-center justify-between gap-2 md:px-6 md:pt-2.5 md:pb-0.5'>
          <p className='title-18 md:title-24'>{t('common.design_preview')}</p>
          <p className='hidden md:block'>[{String(images.length).padStart(2, '0')}건]</p>
        </div>
      }
      size={'md'}
      className='max-w-301 md:w-[95%]'
      titleClassName='pt-0'
      footer={
        <div className='flex justify-end gap-3 md:gap-4 md:px-6 md:pt-2'>
          <Button variant={'outline'} onClick={onClose}>
            {t('common.check')}
          </Button>
        </div>
      }>
      <div
        onWheel={handleWheel}
        className={cn(
          'scrollbar-hide border-border-soft flex w-full flex-col gap-2 border-y px-4 py-6 max-md:border-none md:flex-row md:flex-nowrap md:gap-6 md:overflow-x-auto md:px-10 md:py-8',
        )}>
        {images.length > 0 ? (
          images.map((img, index) => (
            <div
              key={index}
              className='border-border-soft flex h-[301px] max-w-full shrink-0 items-center justify-center border p-1 md:w-[550px]'>
              <SafeImage
                src={img}
                alt={`design-${index + 1}`}
                width={550}
                height={301}
                className='max-h-[293px] max-w-[542px] object-contain'
              />
            </div>
          ))
        ) : (
          <div className='flex h-full w-full items-center justify-center py-10'>
            <p className='text-text-secondary'>{t('common.image_not_found')}</p>
          </div>
        )}
      </div>
    </Modal>
  );
});

PreviewModal.displayName = 'PreviewModal';
