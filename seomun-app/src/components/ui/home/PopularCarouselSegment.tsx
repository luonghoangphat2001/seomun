'use client';

import { Product } from '@/apis/product/product.response';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, SafeImage } from '@/components/common';
import { Link } from '@/i18n/navigation';
import { ChevronRight } from '@/icons';
import { ROUTES } from '@/routes';
import { useLocale, useTranslations } from 'next-intl';

interface PopularCarouselSegmentProps {
  products: Product[];
}

export const PopularCarouselSegment = ({ products }: PopularCarouselSegmentProps) => {
  const t = useTranslations('home');
  const locale = useLocale() as 'ko' | 'en';

  return (
    <div className='flex w-full flex-col gap-4 sm:gap-8'>
      <div className='flex items-center justify-between'>
        <h2 className='sm:title-24 lg:title-32 title-20 text-text-main'>{t('popular_products')}</h2>
      </div>

      <Carousel
        opts={{
          align: 'start',
          loop: true,
          dragFree: true,
        }}
        className='w-full'>
        <div className='absolute -top-12 right-0 flex items-center gap-2'>
          <CarouselPrevious className='static translate-y-0 border-gray-200 bg-white' />
          <CarouselNext className='static translate-y-0 border-gray-200 bg-white' />
        </div>

        <CarouselContent className='-ml-1.5 sm:-ml-2'>
          {products.map((product) => (
            <CarouselItem key={product.id} className='w-full max-w-[140px] pl-1.5 sm:max-w-[223px] sm:pl-2'>
              <Link href={ROUTES.PRODUCT.DETAIL(product.slug)} className='group block space-y-3 sm:space-y-4'>
                <div className='relative aspect-square overflow-hidden bg-gray-100'>
                  <SafeImage
                    src={product.first_image || product.images?.[0] || ''}
                    alt={product.name[locale]}
                    fill
                    className='object-cover transition-transform duration-300 group-hover:scale-110'
                    fallback='/images/no-image.png'
                  />
                  <div className='absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                    <div className='relative flex h-15 w-15 items-center justify-center'>
                      <div className='absolute h-full w-[1px] bg-white' />
                      <div className='absolute h-[1px] w-full bg-white' />
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='lg:body-18 body-16 text-text-main group-hover:text-primary line-clamp-1 max-w-4/5 transition-colors'>
                    {product.name[locale]}
                  </span>
                  <ChevronRight className='group-hover:text-primary size-4' />
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
