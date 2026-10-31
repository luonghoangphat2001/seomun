'use client';

import { Banner as BannerType } from '@/apis/banner/banner.response';
import {
  Carousel,
  CarouselContent,
  CarouselCounter,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  SafeImage,
} from '@/components/common';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import Autoplay from 'embla-carousel-autoplay';

export const Banner = ({ banners }: { banners: BannerType[] }) => {
  return (
    <Carousel
      opts={{
        loop: true,
        align: 'center',
      }}
      plugins={[
        Autoplay({
          delay: 4000,
        }),
      ]}
      className='w-full sm:pt-3'>
      <CarouselContent className={cn('mx-0', banners.length == 1 && 'justify-center')}>
        {banners?.map((banner) => {
          const bannerContent = (
            <div className='group relative h-40 w-full cursor-pointer overflow-hidden sm:h-110 sm:rounded-[24px]'>
              <div className='absolute inset-0 animate-pulse bg-gray-200' />
              <div className='from-primary/10 to-primary/5 flex h-full w-full items-center justify-center bg-gradient-to-r transition-all duration-300 group-hover:scale-[1.01]'>
                <SafeImage src={banner.image_url} alt={banner.name} fill className='hidden object-cover sm:block' />
                <SafeImage
                  src={banner.image_url_mobile || banner.image_url}
                  alt={banner.name}
                  fill
                  className='object-cover sm:hidden'
                />
              </div>
            </div>
          );

          const isExternal = banner.link_url?.startsWith('http') || banner.link_url?.startsWith('//');

          return (
            <CarouselItem key={banner.id} className='w-full px-0 sm:px-4 md:max-w-[1464px] md:px-3'>
              {banner.link_url ? (
                isExternal ? (
                  <a href={banner.link_url} target='_blank' rel='noopener noreferrer' className='block h-full w-full'>
                    {bannerContent}
                  </a>
                ) : (
                  <Link href={banner.link_url} className='block h-full w-full'>
                    {bannerContent}
                  </Link>
                )
              ) : (
                bannerContent
              )}
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className='left-4 bg-white/80 hover:bg-white sm:hidden' />
      <CarouselNext className='right-4 bg-white/80 hover:bg-white sm:hidden' />
      <CarouselCounter className='mt-4 hidden justify-center sm:flex' />
    </Carousel>
  );
};
