'use client';

import { SafeImage } from '@/components/common';
import { Carousel, CarouselContent, CarouselItem } from '@/components/common/carousel';
import { useWebEditorStore } from '@/hooks';
import { ChevronLeft, ChevronRight, Minus, Plus, Zoomin } from '@/icons';
import { cn } from '@/lib/utils';
import { UseEmblaCarouselType } from 'embla-carousel-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

type CarouselApi = UseEmblaCarouselType[1];

export const SlideshowModal = () => {
  const t = useTranslations('editor');
  const { isSlideshowOpen, slideshowImages, closeSlideshow } = useWebEditorStore();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (!api) return;

    const updateState = () => {
      setCount(api.scrollSnapList()?.length || 0);
      setCurrent(api.selectedScrollSnap() + 1);
    };

    const timer = setTimeout(updateState, 0);

    api.on('select', updateState);
    api.on('reInit', updateState);

    return () => {
      clearTimeout(timer);
      api.off('select', updateState);
      api.off('reInit', updateState);
    };
  }, [api]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSlideshow();
      }
    };

    if (isSlideshowOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        setZoom(100);
      }, 0);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isSlideshowOpen, closeSlideshow]);

  const handleZoomOut = () => setZoom((prev) => Math.max(25, prev - 25));
  const handleZoomIn = () => setZoom((prev) => Math.min(400, prev + 25));

  if (!isSlideshowOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 z-[100] flex flex-col bg-[#1A1A1A]'>
        <div className='relative flex flex-1 items-center justify-center overflow-hidden'>
          <Carousel setApi={setApi} className='flex h-full w-full items-center justify-center [&>div]:h-full [&>div]:w-full'>
            <CarouselContent className='mx-0 h-full'>
              {slideshowImages.map((src, index) => (
                <CarouselItem key={index} className='flex h-full items-center justify-center py-8'>
                  <div
                    className='relative flex h-full w-full items-center justify-center transition-transform duration-200 ease-out'
                    style={{ transform: `scale(${zoom / 100})` }}>
                    <SafeImage fill src={src} alt={`Slide ${index + 1}`} className='object-contain' />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        <div className='relative h-1 w-full bg-white/10'>
          <div
            className='bg-text-brand h-full transition-all duration-300 ease-out'
            style={{ width: count > 0 ? `${(current / count) * 100}%` : '0%' }}
          />
        </div>

        <footer className='flex h-[64px] w-full items-center justify-between bg-[#2B2B2B] pr-10 pl-6 text-white'>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => api?.scrollPrev()}
              disabled={!api?.canScrollPrev()}
              className={cn(
                'flex size-10 items-center justify-center rounded-sm transition-colors disabled:opacity-30',
                api?.canScrollPrev() && 'hover:bg-white/10',
              )}>
              <ChevronLeft className='size-6' />
            </button>
            <span className='body-18'>
              {current}/{count}
            </span>
            <button
              onClick={() => api?.scrollNext()}
              disabled={!api?.canScrollNext()}
              className={cn(
                'flex size-10 items-center justify-center rounded-sm transition-colors disabled:opacity-30',
                api?.canScrollNext() && 'hover:bg-white/10',
              )}>
              <ChevronRight className='size-6' />
            </button>
          </div>

          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-3'>
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 25}
                className={cn(
                  'rounded p-1 transition-colors disabled:opacity-30',
                  zoom > 25 && 'hover:text-text-brand hover:bg-white/10',
                )}>
                <Minus className='size-6' />
              </button>
              <div className='border-border-soft body-16 flex h-10 w-15 items-center justify-center rounded-[8px] border'>
                {zoom} %
              </div>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 400}
                className={cn(
                  'rounded p-1 transition-colors disabled:opacity-30',
                  zoom < 400 && 'hover:text-text-brand hover:bg-white/10',
                )}>
                <Plus className='size-6' />
              </button>
            </div>

            <div className='mx-2 h-4 w-[1px] bg-white/20' />

            <button
              onClick={closeSlideshow}
              title={t('exit_presentation')}
              className='flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/10'>
              <Zoomin className='size-6' />
            </button>
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
};
