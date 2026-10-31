'use client';

import { Modal, ModalHandle, Skeleton } from '@/components/common';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/common/carousel';
import { SafeImage } from '@/components/common/safe-image';
import { XIcon } from '@/icons';
import { cn } from '@/lib/utils';
import { UseEmblaCarouselType } from 'embla-carousel-react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

export interface ImagePreviewModalHandle {
  open: (index?: number) => void;
  close: () => void;
}

interface ImagePreviewModalProps {
  images: string[];
}

type CarouselApi = UseEmblaCarouselType[1];

export const ImagePreviewModal = forwardRef<ImagePreviewModalHandle, ImagePreviewModalProps>(({ images }, ref) => {
  const modalRef = useRef<ModalHandle>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [initialIndex, setInitialIndex] = useState<number | null>(null);

  useImperativeHandle(ref, () => ({
    open: (index = 0) => {
      setInitialIndex(index);
      modalRef.current?.open();
    },
    close: () => {
      modalRef.current?.close();
    },
  }));

  useEffect(() => {
    if (!api) return;
    api.scrollTo(initialIndex ?? 0, true);
  }, [api, initialIndex]);

  return (
    <Modal ref={modalRef} size='lg' className='!bg-transparent shadow-none' bodyClassName='p-0 overflow-visible'>
      <div className='relative flex h-full min-h-[400px] flex-col items-center justify-center md:min-h-[500px]'>
        <button
          onClick={() => modalRef.current?.close()}
          className='absolute -top-12 right-0 z-50 p-2 text-white transition-opacity hover:opacity-70 md:top-0 md:-right-10'>
          <XIcon width={32} height={32} />
        </button>

        {initialIndex == null ? (
          <Skeleton className='aspect-[3/2] w-full max-w-[800px] rounded-lg' />
        ) : (
          <Carousel setApi={setApi} className='w-full'>
            <CarouselContent className='mx-0'>
              {images.map((src, index) => (
                <CarouselItem key={index} className='flex items-center justify-center p-0'>
                  <div
                    className={cn('relative aspect-[3/2] w-full max-w-[800px] overflow-hidden rounded-lg bg-white')}
                    style={{
                      backgroundImage:
                        'linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)',
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    }}>
                    <SafeImage src={src} alt={`Preview ${index + 1}`} fill className='object-contain' />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {images.length > 1 && (
              <>
                <CarouselPrevious className='hover:bg-text-brand left-4 size-9 border-none bg-white/50 hover:text-white disabled:opacity-0 [&_span_svg]:size-5' />
                <CarouselNext className='hover:bg-text-brand right-4 size-9 border-none bg-white/50 hover:text-white disabled:opacity-0 [&_span_svg]:size-5' />
              </>
            )}
          </Carousel>
        )}
      </div>
    </Modal>
  );
});

ImagePreviewModal.displayName = 'ImagePreviewModal';
