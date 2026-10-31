'use client';

import { Button } from '@/components/common/button';
import { ChevronLeft, ChevronRight } from '@/icons';
import { cn } from '@/lib/utils';
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import React, { useCallback, useContext, useEffect, useState } from 'react';

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

interface CarouselProps {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: 'horizontal' | 'vertical';
  setApi?: (api: CarouselApi) => void;
  className?: string;
  children: React.ReactNode;
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: CarouselApi;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  orientation: 'horizontal' | 'vertical';
};

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }
  return context;
}

export const Carousel = ({ orientation = 'horizontal', opts, setApi, plugins, className, children, ...props }: CarouselProps) => {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  useEffect(() => {
    if (!api) return;

    // Use setTimeout to avoid synchronous setState inside useEffect warning
    const timer = setTimeout(() => {
      onSelect(api);
    }, 0);

    api.on('reInit', onSelect);
    api.on('select', onSelect);

    return () => {
      clearTimeout(timer);
      api?.off('select', onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        orientation,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}>
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn('relative', className)}
        role='region'
        aria-roledescription='carousel'
        {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
};

export const CarouselContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div ref={carouselRef} className='overflow-hidden'>
      <div className={cn('flex', orientation === 'horizontal' ? 'mx-3' : '-mt-4 flex-col', className)} {...props} />
    </div>
  );
};

export const CarouselItem = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { orientation } = useCarousel();

  return (
    <div
      role='group'
      aria-roledescription='slide'
      className={cn('min-w-0 shrink-0 grow-0 basis-full', orientation === 'horizontal' ? 'px-3' : 'py-3', className)}
      {...props}
    />
  );
};

export const CarouselPrevious = ({
  className,
  variant = 'outline',
  size = 'icon',
  ...props
}: React.ComponentProps<typeof Button>) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        'absolute z-10 h-8 w-8 rounded-full',
        orientation === 'horizontal'
          ? 'top-1/2 -left-12 -translate-y-1/2'
          : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-12 rotate-90',
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}>
      <ChevronLeft className='size-4' />
      <span className='sr-only'>{orientation === 'horizontal' ? 'Previous slide' : 'Scroll up'}</span>
    </Button>
  );
};

export const CarouselNext = ({
  className,
  variant = 'outline',
  size = 'icon',
  ...props
}: React.ComponentProps<typeof Button>) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        'absolute z-10 h-8 w-8 rounded-full',
        orientation === 'horizontal'
          ? 'top-1/2 -right-12 -translate-y-1/2'
          : 'bottom-1/2 left-1/2 -translate-x-1/2 translate-y-12 rotate-90',
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}>
      <ChevronRight className='size-4' />
      <span className='sr-only'>{orientation === 'horizontal' ? 'Next slide' : 'Scroll down'}</span>
    </Button>
  );
};

export const CarouselDots = ({ className }: { className?: string }) => {
  const { api } = useCarousel();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;

    const timer = setTimeout(() => {
      setScrollSnaps(api.scrollSnapList());
    }, 0);

    api.on('select', onSelect);
    api.on('reInit', onSelect);

    return () => {
      clearTimeout(timer);
    };
  }, [api, onSelect]);

  return (
    <div className={cn('flex items-center justify-center gap-2 py-4', className)}>
      {scrollSnaps.map((_, index) => (
        <button
          key={index}
          className={cn(
            'size-2 rounded-full transition-all duration-300',
            index === selectedIndex ? 'bg-primary w-4' : 'bg-gray-300',
          )}
          onClick={() => api?.scrollTo(index)}
        />
      ))}
    </div>
  );
};

export const CarouselCounter = ({ className }: { className?: string }) => {
  const { api, scrollPrev, scrollNext } = useCarousel();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const onSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;

    const timer = setTimeout(() => {
      setTotalCount(api.scrollSnapList().length);
      setSelectedIndex(api.selectedScrollSnap());
    }, 0);

    api.on('select', onSelect);
    api.on('reInit', onSelect);

    return () => {
      clearTimeout(timer);
    };
  }, [api, onSelect]);

  if (totalCount <= 1) return null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button variant='ghost' size='icon' onClick={scrollPrev}>
        <ChevronLeft className='size-6' />
      </Button>
      <div className='title-18 text-text-third flex items-center gap-0.5 font-medium tabular-nums'>
        <span className='text-text-main'>{(selectedIndex + 1).toString().padStart(2, '0')}</span>
        <span>/</span>
        <span>{totalCount.toString().padStart(2, '0')}</span>
      </div>
      <Button variant='ghost' size='icon' onClick={scrollNext}>
        <ChevronRight className='size-6' />
      </Button>
    </div>
  );
};
