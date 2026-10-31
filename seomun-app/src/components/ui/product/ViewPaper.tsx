'use client';

import { PaperType } from '@/apis/product/product.response';
import { Button, Modal, ModalHandle, SafeImage } from '@/components/common';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { forwardRef, useEffect, useState } from 'react';

type ViewPaperProps = {
  paperTypes: PaperType[];
  selectedType: string;
};

export const ViewPaper = forwardRef<ModalHandle, ViewPaperProps>(({ paperTypes, selectedType }, ref) => {
  const t = useTranslations('product');
  const tCommon = useTranslations('common');

  const [paperType, setPaperType] = useState<PaperType | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const onClose = () => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.close();
    }
  };

  useEffect(() => {
    const type = paperTypes.find((type) => String(type.id) === selectedType);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPaperType(type || null);
  }, [paperTypes, selectedType]);

  return (
    <Modal
      ref={ref}
      position={isMobile ? 'bottom' : 'center'}
      size='xl'
      title={t('view_paper')}
      titleClassName='px-0 md:px-6 title-18 md:title-24'
      footer={
        isMobile ? undefined : (
          <div className='flex w-full justify-end px-6'>
            <Button variant='outline' className='h-10' onClick={onClose}>
              {tCommon('check')}
            </Button>
          </div>
        )
      }>
      <div className='border-border-soft flex flex-col gap-4 overflow-hidden border-t border-b px-4 py-6 md:flex-row md:gap-8 md:px-10 md:py-8'>
        <div className='scrollbar-hide flex w-auto flex-row overflow-auto md:max-h-93.75 md:w-47 md:flex-col'>
          {paperTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => setPaperType(type)}
              className={cn(
                'cursor-pointer p-3 whitespace-nowrap',
                paperType?.id === type.id
                  ? 'text-primary border-primary bg-border-light title-14 border-b'
                  : 'body-14 bg-transparent hover:bg-gray-100/50',
              )}>
              {type.label}
            </div>
          ))}
        </div>

        <div className='flex flex-1 flex-col items-center justify-center overflow-hidden'>
          <div className='group relative aspect-[2/1] w-full overflow-hidden bg-gray-50'>
            <SafeImage
              src={paperType?.attributes.image || ''}
              alt={paperType?.code || ''}
              fill
              className='object-cover transition-transform duration-700 group-hover:scale-105'
            />
            <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 to-transparent' />
          </div>
          <p className='body-16 mt-4 whitespace-pre-line'>{paperType?.attributes.description}</p>
        </div>
      </div>
    </Modal>
  );
});

ViewPaper.displayName = 'ViewPaper';
