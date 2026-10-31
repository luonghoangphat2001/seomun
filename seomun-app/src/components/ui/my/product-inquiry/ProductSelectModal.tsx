'use client';

import { useCategoryListQuery } from '@/apis/category/category.query';
import { Product } from '@/apis/product/product.response';
import { useSearchProductQuery } from '@/apis/product/product.query';
import { Button, Input, Modal, ModalHandle, SafeImage } from '@/components/common';
import { useDebounce } from '@/hooks';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ChevronRight, Search } from '@/icons';
import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import React, { forwardRef, useState } from 'react';

interface ProductSelectModalProps {
  onSelect: (product: Partial<Product>) => void;
}

export const ProductSelectModal = forwardRef<ModalHandle, ProductSelectModalProps>(({ onSelect }, ref) => {
  const t = useTranslations('inquiry');
  const tCommon = useTranslations('common');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { data: categoryData } = useCategoryListQuery({ root_only: true, with_children: true });
  const categories = categoryData?.data.categories || [];
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Partial<Product>>();
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearchValue = useDebounce(searchValue, 300);

  const locale = useLocale();
  const selectedCategory = categories.find((category) => category.id === selectedCategoryId) || categories[0];

  const searchKeyword = debouncedSearchValue.trim() || undefined;
  const productQueryParams = {
    category_id: selectedCategory?.id,
    page: 1,
    per_page: 15,
    ...(searchKeyword ? { q: searchKeyword } : {}),
  };
  const { data: productData, isLoading } = useSearchProductQuery(productQueryParams);

  const products = productData?.list || [];

  const handleConfirm = () => {
    if (selectedProduct) {
      onSelect(selectedProduct);
      (ref as React.RefObject<ModalHandle>).current?.close();
    }
  };

  return (
    <Modal
      ref={ref}
      title={t('product')}
      titleClassName='title-18 md:title-24 md:px-6'
      size='lg'
      position={isDesktop ? 'center' : 'bottom'}
      className='max-h-[85vh]'
      bodyClassName='flex flex-col'
      footer={
        <div className='flex justify-end gap-4 px-4 md:px-6 md:pt-2'>
          <Button variant='outline' size='md' onClick={() => (ref as React.RefObject<ModalHandle>).current?.close()}>
            {tCommon('cancel')}
          </Button>
          <Button size='md' onClick={handleConfirm} disabled={!selectedProduct}>
            {t('check')}
          </Button>
        </div>
      }>
      <div className='border-border-soft flex flex-1 flex-col gap-4 border-y px-4 pt-6 max-md:border-none md:px-10'>
        <Input
          placeholder={t('enter_product_name')}
          suffix={<Search className='text-text-main size-6' />}
          className='py-2.5'
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />

        <div className='flex h-[360px] gap-2 overflow-hidden'>
          <div className='scrollbar-thin border-border-soft w-29 shrink-0 overflow-y-auto border-r md:w-38'>
            {categories.length > 0 ? (
              categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                    setSelectedProduct(undefined);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-1.5 transition-all',
                    selectedCategory?.id === category.id ? 'bg-fill-light text-text-brand' : 'text-text-main hover:bg-gray-50',
                  )}>
                  <span className='body-16 truncate'>{category.name?.[locale as 'en' | 'ko']}</span>
                  <ChevronRight className='size-4 shrink-0' />
                </button>
              ))
            ) : (
              <div className='text-text-third flex h-40 items-center justify-center'>{tCommon('no_data')}</div>
            )}
          </div>

          <div className='scrollbar-thin flex-1 overflow-y-auto bg-white'>
            <div className='space-y-2'>
              {isLoading ? (
                <div className='space-y-3 p-3'>
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className='flex gap-2 p-3'>
                      <div className='size-12 shrink-0 rounded bg-gray-200' />
                      <div className='flex flex-1 flex-col gap-2'>
                        <div className='h-4 w-2/3 rounded bg-gray-200' />
                        <div className='h-3 w-full rounded bg-gray-200' />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={cn(
                      'flex cursor-pointer gap-2 p-3 transition-all',
                      selectedProduct?.id === product.id ? 'bg-fill-light' : 'hover:bg-gray-50',
                    )}>
                    <div className='relative size-12 shrink-0 overflow-hidden rounded bg-gray-100'>
                      <SafeImage src={product?.first_image || ''} alt={product?.name?.en ?? ''} fill className='object-cover' />
                    </div>
                    <div className='flex min-w-0 flex-1 flex-col justify-center gap-1.5'>
                      <p
                        className={cn(
                          'title-14 truncate',
                          selectedProduct?.id === product.id ? 'text-text-brand' : 'text-text-main',
                        )}>
                        {product.name?.[locale as 'en' | 'ko']}
                      </p>
                      <p
                        className={cn(
                          'body-14 line-clamp-1',
                          selectedProduct?.id === product.id ? 'text-text-brand' : 'text-text-main',
                        )}>
                        {product.short_description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-text-third flex h-40 items-center justify-center'>{tCommon('no_data')}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
});

ProductSelectModal.displayName = 'ProductSelectModal';
