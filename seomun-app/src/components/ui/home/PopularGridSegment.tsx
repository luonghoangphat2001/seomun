'use client';

import { Category } from '@/apis/category/category.response';
import { ProductApi } from '@/apis/product/product.api';
import { Product } from '@/apis/product/product.response';
import { SafeImage, Skeleton } from '@/components/common';
import { Link } from '@/i18n/navigation';
import { Folder } from '@/icons';
import { cn, formatCurrency } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface PopularGridSegmentProps {
  categories: Category[];
}

export const PopularGridSegment = ({ categories }: PopularGridSegmentProps) => {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');

  const locale = useLocale() as 'ko' | 'en';
  const [activeCategory, setActiveCategory] = useState<Category>(categories[0]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeCategory) {
      loadProducts(activeCategory.slug);
    }
  }, [activeCategory]);

  const loadProducts = async (slug: string) => {
    setIsLoading(true);
    try {
      const res = await ProductApi.getProductByCategory({ slug });
      setProducts(res.data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex w-full flex-col gap-4 sm:gap-8'>
      <div className='flex flex-col gap-4 sm:gap-8'>
        <h2 className='title-20 sm:title-24 lg:title-32 text-text-main'>{t('view_popular_products')}</h2>

        <div className='scrollbar-hide flex w-full items-center gap-5 overflow-x-auto sm:gap-16'>
          {categories.map((category) => {
            const isActive = activeCategory?.id === category.id;
            return (
              <button
                key={category.id}
                onMouseEnter={() => setActiveCategory(category)}
                onClick={() => setActiveCategory(category)}
                className='group flex flex-col items-center gap-2 sm:gap-4.5'>
                <div
                  className={cn(
                    'bg-fill-light flex h-12 w-12 items-center justify-center rounded-full transition-all sm:h-16 sm:w-16 lg:h-20 lg:w-20',
                    isActive && 'border-primary bg-primary/5 text-text-brand border',
                  )}>
                  {category.icon ? (
                    <div
                      className={cn(
                        'size-6 transition-colors sm:size-7 lg:size-8',
                        isActive ? 'bg-text-brand' : 'bg-text-main group-hover:bg-primary',
                      )}
                      style={{
                        maskImage: `url(${category.icon})`,
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        maskSize: 'contain',
                        WebkitMaskImage: `url(${category.icon})`,
                        WebkitMaskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        WebkitMaskSize: 'contain',
                      }}
                    />
                  ) : (
                    <Folder className={cn('size-6 sm:size-7 lg:size-8', isActive && 'text-text-brand')} />
                  )}
                </div>
                <span
                  className={cn(
                    'title-14 sm:title-16 lg:title-18 line-clamp-1 font-semibold transition-colors',
                    isActive ? 'text-primary' : 'body-14 sm:body-18 text-text-main group-hover:text-primary',
                  )}>
                  {category.name[locale]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={cn(
          'grid grid-cols-2 gap-3 transition-opacity duration-300 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-5',
          isLoading ? 'pointer-events-none opacity-50' : 'opacity-100',
        )}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className='space-y-4'>
              <Skeleton className='aspect-square' />
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-4 w-1/2' />
            </div>
          ))
        ) : products.length > 0 ? (
          products.map((product) => (
            <Link key={product.id} href={ROUTES.PRODUCT.DETAIL(product.slug)} className='group block space-y-2 sm:space-y-5'>
              <div className='relative aspect-square overflow-hidden bg-gray-100'>
                <SafeImage
                  src={product.first_image || product.images[0] || ''}
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
              <div className='space-y-1 transition-colors'>
                <div className='group-hover:text-primary title-14 sm:title-16 lg:title-20 text-text-main line-clamp-1 font-semibold'>
                  {product.name[locale]}
                </div>
                <span className='group-hover:text-primary body-14 sm:body-16 lg:body-18 text-text-main'>
                  {formatCurrency(product.price)}~
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className='title-14 sm:title-18 text-text-third col-span-full py-10 text-center'>{tCommon('no_data')}</div>
        )}
      </div>
    </div>
  );
};
