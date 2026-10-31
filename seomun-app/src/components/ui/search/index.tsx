'use client';

import { useSearchProductQuery } from '@/apis/product/product.query';
import { SafeImage, Skeleton } from '@/components/common';
import { Link } from '@/i18n/navigation';
import { cn, formatCurrency } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

const ProductSearch = () => {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('q');
  const categoryIdParam = searchParams.get('categoryId');
  const categoryId = categoryIdParam ? Number(categoryIdParam) : undefined;
  const locale = useLocale() as 'ko' | 'en';
  const tCommon = useTranslations('common');

  const { data: dataProduct, isLoading } = useSearchProductQuery({
    q: keyword || undefined,
    category_id: Number.isFinite(categoryId) ? categoryId : undefined,
    page: 1,
    per_page: 999,
  });
  const products = dataProduct?.list || [];

  return (
    <section className='global-padding pt-8 pb-30'>
      <p>
        <span className='body-18'>검색 결과</span>
        <span className='title-18 text-text-brand ml-2 font-semibold'>{products.length || 0}건</span>
      </p>
      <div
        className={cn(
          'mt-6 grid grid-cols-2 gap-3 transition-opacity duration-300 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-5',
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
    </section>
  );
};

export default ProductSearch;
