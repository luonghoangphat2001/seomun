'use client';

import { Category } from '@/apis/category/category.response';
import { useGetProductByCategoryQuery } from '@/apis/product/product.query';
import { Badge, Drawer } from '@/components/common';
import { Link } from '@/i18n/navigation';
import { ChevronRight, XIcon } from '@/icons';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { AnimatePresence, motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface HeaderMobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  isAuthenticated: boolean;
  onLogout: () => void;
}

interface MobileCategoryProductsProps {
  category: Category;
  locale: 'en' | 'ko';
  onClose: () => void;
}

const MobileCategoryProducts = ({ category, locale, onClose }: MobileCategoryProductsProps) => {
  const { data: productData, isLoading } = useGetProductByCategoryQuery(category.slug, {
    enabled: !!category.slug,
  });
  const products = productData?.data?.products ?? [];

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className='flex flex-col overflow-hidden'>
      {isLoading ? (
        <div className='flex justify-center px-2 py-3'>
          <div className='border-primary size-4 animate-spin rounded-full border-2 border-t-transparent' />
        </div>
      ) : (
        products.map((product) => (
          <Link
            key={product.id}
            href={ROUTES.PRODUCT.DETAIL(product.slug)}
            className='body-16 hover:text-primary text-text-main px-2 py-1.5 pl-5'
            onClick={onClose}>
            {product.name[locale]}
          </Link>
        ))
      )}
    </motion.div>
  );
};

export const HeaderMobileSidebar = ({ isOpen, onClose, categories, isAuthenticated, onLogout }: HeaderMobileSidebarProps) => {
  const t = useTranslations('header');
  const locale = useLocale() as 'en' | 'ko';
  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get('categoryId');
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

  const toggleCategory = (id: number) => {
    setExpandedCategories((prev) => (prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]));
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} position='right' size='md' className='pt-6 pr-4 pl-3'>
      <div className='shrink-0 p-2' onClick={onClose}>
        <XIcon className='text-text-main size-6' />
      </div>

      <div className='flex min-h-0 flex-1 flex-col gap-1.5'>
        <div data-lenis-prevent className='scrollbar-thin min-h-0 flex-1 overflow-y-auto'>
          {categories.map((category) => {
            const isExpanded = expandedCategories.includes(category.id);

            return (
              <div key={category.id} className=''>
                <div className='flex items-center justify-between px-2 py-1.5'>
                  <Link
                    href={ROUTES.SEARCH.CATEGORY(category.id)}
                    className={cn(
                      'title-16 flex flex-1 items-center gap-2 font-semibold',
                      selectedCategoryId === String(category.id) ? 'text-text-brand' : 'text-text-main',
                    )}
                    onClick={onClose}>
                    <span>{category.name[locale]}</span>
                    {category.is_best && (
                      <Badge
                        color='yellow'
                        variant='solid'
                        className='h-4 rounded-[8px] px-2 py-0.5 text-[10px] leading-none font-semibold uppercase'>
                        Best
                      </Badge>
                    )}
                  </Link>
                  <button
                    type='button'
                    className='p-1'
                    aria-label={`Toggle ${category.name[locale]} categories`}
                    onClick={() => toggleCategory(category.id)}>
                    <ChevronRight className={cn('size-4 duration-200', isExpanded ? 'rotate-90' : '-rotate-90')} />
                  </button>
                </div>

                <AnimatePresence>
                  {isExpanded && <MobileCategoryProducts category={category} locale={locale} onClose={onClose} />}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className='shrink-0 space-y-1.5'>
          <Link
            href={ROUTES.CUSTOMER_SERVICE.ANNOUNCEMENT}
            className='title-16 text-text-main p-2 font-semibold'
            onClick={onClose}>
            {t('customer_service')}
          </Link>
          {isAuthenticated && (
            <div
              className='title-16 text-text-main p-2 font-semibold'
              onClick={() => {
                onClose();
                onLogout();
              }}>
              {t('logout')}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};
