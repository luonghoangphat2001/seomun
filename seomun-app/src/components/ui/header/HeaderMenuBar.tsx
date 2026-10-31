'use client';

import { Category } from '@/apis/category/category.response';
import { useGetProductByCategoryQuery } from '@/apis/product/product.query';
import { Button } from '@/components/common';
import { Badge } from '@/components/common/badge';
import { SafeImage } from '@/components/common/safe-image';
import { Link, useRouter } from '@/i18n/navigation';
import { ChevronRight, Menu } from '@/icons';
import { cn, formatCurrency } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface HeaderMenuBarProps {
  categories: Category[];
}

export const HeaderMenuBar = ({ categories }: HeaderMenuBarProps) => {
  const t = useTranslations('header');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();

  const locale = useLocale() as 'en' | 'ko';
  const selectedCategoryId = searchParams.get('categoryId');
  const [isCategoryHovered, setIsCategoryHovered] = useState(false);
  const [hoveredCategorySlug, setHoveredCategorySlug] = useState<string>('');

  const activeCategorySlug = hoveredCategorySlug || categories[0]?.slug || '';

  const { data: productData, isLoading } = useGetProductByCategoryQuery(activeCategorySlug, {
    enabled: isCategoryHovered && !!activeCategorySlug,
  });

  const products = productData?.data?.products ?? [];

  return (
    <nav className='relative flex items-start gap-6'>
      <div
        className='flex min-w-0 flex-1 items-center gap-6 self-stretch'
        onMouseEnter={() => setIsCategoryHovered(true)}
        onMouseLeave={() => setIsCategoryHovered(false)}>
        <div className='bg-primary-100 cursor-pointer rounded-sm p-2'>
          <Menu className='h-6 w-6' />
        </div>
        {/* <span className='body-18'>{t('category')}</span> */}

        <div className='scrollbar-hide flex min-w-0 flex-1 items-center gap-6 overflow-x-auto whitespace-nowrap'>
          {categories.map((category) => (
            <button
              key={category.id}
              type='button'
              className={cn(
                'body-18 hover:text-primary shrink-0 cursor-pointer px-2.5 pt-2 pb-4 transition-colors',
                isCategoryHovered && activeCategorySlug === category.slug
                  ? 'text-text-brand'
                  : !isCategoryHovered && selectedCategoryId === String(category.id)
                    ? 'text-text-brand'
                    : 'text-text-main',
              )}
              onClick={() => {
                setHoveredCategorySlug(category.slug);
                setIsCategoryHovered(true);
              }}
              onFocus={() => {
                setHoveredCategorySlug(category.slug);
                setIsCategoryHovered(true);
              }}
              onMouseEnter={() => setHoveredCategorySlug(category.slug)}>
              {category.name[locale]}
            </button>
          ))}
        </div>

        {isCategoryHovered && categories.length > 0 && (
          <div className='border-border-soft absolute top-full right-0 left-0 z-[100] flex max-h-[420px] gap-10 overflow-hidden border-t bg-white p-4 pt-3 shadow-sm'>
            <div
              data-lenis-prevent
              className='border-border-soft scrollbar-hide max-h-[390px] w-[180px] overflow-y-auto border-r'>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={ROUTES.SEARCH.CATEGORY(category.id)}
                  className={cn(
                    'group flex cursor-pointer items-center justify-between p-3 transition-all',
                    activeCategorySlug === category.slug ? 'text-text-brand bg-fill-light' : 'text-text-main hover:bg-white/50',
                  )}
                  onMouseEnter={() => setHoveredCategorySlug(category.slug)}>
                  <div className='flex items-center gap-2'>
                    <span className={cn('body-16 transition-colors')}>{category.name[locale]}</span>
                    {category.is_best && (
                      <Badge color='yellow' variant='solid' className='rounded-full px-2 py-0.5 text-xs font-semibold'>
                        BEST
                      </Badge>
                    )}
                  </div>
                  <ChevronRight className={cn('h-4 w-4 transition-transform')} />
                </Link>
              ))}
            </div>

            <div data-lenis-prevent className='scrollbar-thin max-h-[390px] min-w-0 flex-1 overflow-y-auto pr-2'>
              {isLoading ? (
                <div className='flex h-[390px] items-center justify-center'>
                  <div className='border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent'></div>
                </div>
              ) : products.length > 0 ? (
                <div className='grid grid-cols-5 gap-4 py-2 pr-1'>
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={ROUTES.PRODUCT.DETAIL(product.slug)}
                      className='group block min-w-0 space-y-2'
                      onClick={() => setIsCategoryHovered(false)}>
                      <div className='relative aspect-square overflow-hidden bg-gray-100'>
                        <SafeImage
                          src={product.first_image || product.images[0] || ''}
                          alt={product.name[locale]}
                          fill
                          className='object-cover transition-transform duration-300 group-hover:scale-105'
                          fallback='/images/no-image.png'
                        />
                      </div>
                      <div className='space-y-0.5'>
                        <p className='title-20 text-text-main group-hover:text-primary line-clamp-1 font-semibold transition-colors'>
                          {product.name[locale]}
                        </p>
                        <p className='body-18 text-text-main'>{formatCurrency(product.price)}~</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className='text-text-secondary flex h-[390px] items-center justify-center'>
                  <p className='body-16'>{tCommon('no_data')}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className='flex gap-3'>
        <Button
          size='sm'
          variant='outline-primary'
          className='body-16'
          onClick={() => router.push(ROUTES.CUSTOMER_SERVICE.ANNOUNCEMENT)}>
          {t('customer_service')}
        </Button>
        <Button size='sm' className='body-16' onClick={() => router.push(ROUTES.MY_PAGE.EDITOR)}>
          {t('self_design')}
        </Button>
      </div>
    </nav>
  );
};
