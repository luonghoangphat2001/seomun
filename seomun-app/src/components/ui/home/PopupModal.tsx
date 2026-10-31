'use client';

import { useGetPopupList } from '@/apis/popup/popup.query';
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Button,
  Checkbox,
  Modal,
  ModalHandle,
  SafeImage,
} from '@/components/common';
import { XIcon } from '@/icons';
import { useEffect, useRef, useState } from 'react';

const POPUP_HIDDEN_UNTIL_KEY = 'home-popup-hidden-until';
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export const PopupModal = () => {
  const { data: popups = [] } = useGetPopupList();
  const modalRef = useRef<ModalHandle>(null);
  const hasOpenedRef = useRef(false);
  const [hideFor24Hours, setHideFor24Hours] = useState(false);

  useEffect(() => {
    if (hasOpenedRef.current || popups.length === 0) return;

    const hiddenUntil = Number(window.localStorage.getItem(POPUP_HIDDEN_UNTIL_KEY));
    if (hiddenUntil > Date.now()) return;

    if (hiddenUntil) window.localStorage.removeItem(POPUP_HIDDEN_UNTIL_KEY);

    hasOpenedRef.current = true;
    modalRef.current?.open();
  }, [popups.length]);

  const closeWithHidePreference = () => {
    if (hideFor24Hours) {
      window.localStorage.setItem(POPUP_HIDDEN_UNTIL_KEY, String(Date.now() + ONE_DAY_IN_MS));
    }

    modalRef.current?.close();
  };

  if (popups.length === 0) return null;

  const modalWidth = Math.max(...popups.map((popup) => popup.size_settings?.width || popup.width || 640));

  return (
    <Modal
      ref={modalRef}
      size='xl'
      rounded='lg'
      className='!w-auto !max-w-[calc(100vw-2rem)] !bg-gray-100 shadow-none'
      bodyClassName='overflow-visible p-0'
      overlayClassName='bg-black/50'>
      <div className='relative'>
        <button
          type='button'
          aria-label='Close popup'
          onClick={() => modalRef.current?.close()}
          className='absolute top-3 right-3 z-20 cursor-pointer rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70'>
          <XIcon width={20} height={20} />
        </button>

        <div style={{ width: `min(90vw, ${modalWidth}px)` }}>
          <Carousel opts={{ loop: popups.length > 1 }}>
            <CarouselContent className='mx-0'>
              {popups.map((popup, index) => {
                const width = popup.size_settings?.width || popup.width || 640;
                const height = popup.size_settings?.height || popup.height || 640;

                return (
                  <CarouselItem key={popup.id} className='flex items-center justify-center p-0'>
                    <SafeImage
                      src={popup.image_url}
                      alt={popup.name}
                      width={width}
                      height={height}
                      className='h-auto max-h-[80dvh] w-full rounded-lg object-contain'
                      priority={index === 0}
                    />
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            {popups.length > 1 && (
              <>
                <CarouselPrevious className='left-3 border-none bg-white/80 hover:bg-white' />
                <CarouselNext className='right-3 border-none bg-white/80 hover:bg-white' />
                <CarouselDots className='absolute right-0 bottom-2 left-0 z-10 py-0' />
              </>
            )}
          </Carousel>

          <div className='flex items-center justify-between rounded-b-lg border-t border-gray-300 bg-gray-200 px-4 py-3'>
            <Checkbox
              checked={hideFor24Hours}
              label='24시간 동안 보지 않기'
              labelClassName='text-text-main'
              onChange={setHideFor24Hours}
            />
            <Button
              variant='outline'
              size='xs'
              className='!text-text-main border-gray-400 hover:!bg-gray-300'
              onClick={closeWithHidePreference}>
              닫기
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
