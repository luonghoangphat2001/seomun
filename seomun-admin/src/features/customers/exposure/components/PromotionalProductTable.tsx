import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppInput } from '@/components/shared/app-input';
import type { Category } from '@/features/categories';
import type { PaginationMeta } from '@/types/api';

import type { PromotionalProduct } from '../../types/customer.type';

const PRODUCT_PAGE_SIZE_OPTIONS = [15, 20, 30, 50];

type PromotionalProductTableProps = {
  customerName?: string;
  searchTerm: string;
  categorySearchTerm: string;
  categories: Category[];
  selectedCategoryId?: number;
  products: PromotionalProduct[];
  pagination?: PaginationMeta;
  selectedProductIds: number[];
  isLoading?: boolean;
  isCategoryLoading?: boolean;
  isPending?: boolean;
  isDirty?: boolean;
  onSearchTermChange: (value: string) => void;
  onCategorySearchTermChange: (value: string) => void;
  onSelectCategory: (categoryId: number) => void;
  onClearCategory: () => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onToggleProduct: (productId: number, checked: boolean) => void;
  onSave: () => void;
};

export function PromotionalProductTable({
  customerName,
  searchTerm,
  categorySearchTerm,
  categories,
  selectedCategoryId,
  products,
  pagination,
  selectedProductIds,
  isLoading,
  isCategoryLoading,
  isPending,
  isDirty,
  onSearchTermChange,
  onCategorySearchTermChange,
  onSelectCategory,
  onClearCategory,
  onPageChange,
  onPerPageChange,
  onToggleProduct,
  onSave,
}: PromotionalProductTableProps) {
  const { t } = useTranslation();
  const currentPage = pagination?.current_page ?? 1;
  const perPage = pagination?.per_page ?? 15;
  const totalPage = pagination?.total_page ?? 1;
  const totalItem = pagination?.total_item ?? products.length;

  return (
    <section className='rounded-xl border'>
      <div className='border-b px-5 py-4'>
        <h2 className='text-sm font-semibold'>{t('page.customers.exposure.promotional_products_title', { customer_name: customerName ?? '' })}</h2>
      </div>

      <div className='space-y-4 p-5'>
        <div className='grid gap-3 md:grid-cols-2'>
          <AppInput
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder={t('page.customers.exposure.search_product_placeholder')}
          />

          <div className='space-y-2'>
            <AppInput
              value={categorySearchTerm}
              onChange={(event) => onCategorySearchTermChange(event.target.value)}
              placeholder={t('page.customers.exposure.search_category_placeholder')}
            />
            <div className='flex flex-wrap gap-2'>
              <AppButton type='button' variant={!selectedCategoryId ? 'default' : 'outline'} size='sm' onClick={onClearCategory}>
                {t('page.customers.exposure.all_categories')}
              </AppButton>
              {categories.slice(0, 6).map((category) => (
                <AppButton
                  key={category.id}
                  type='button'
                  variant={category.id === selectedCategoryId ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => onSelectCategory(category.id)}
                >
                  {category.name}
                </AppButton>
              ))}
            </div>
            {isCategoryLoading ? <p className='text-muted-foreground text-xs'>{t('common.message.loading')}</p> : null}
            {!isCategoryLoading && categories.length === 0 ? (
              <p className='text-muted-foreground text-xs'>{t('page.customers.exposure.no_categories')}</p>
            ) : null}
          </div>
        </div>

        {isLoading ? <p className='text-muted-foreground text-sm'>{t('common.message.loading')}</p> : null}
        {!isLoading && products.length === 0 ? <p className='text-muted-foreground text-sm'>{t('page.customers.exposure.empty_products')}</p> : null}

        <div className='space-y-2'>
          {products.map((product) => (
            <label key={product.id} className='flex items-center justify-between gap-4 rounded-lg border px-4 py-3'>
              <span>
                <span className='block font-medium'>{product.name}</span>
                <span className='text-muted-foreground text-sm'>
                  {product.sku} · {product.category?.name ?? '-'} · {product.price.toLocaleString()} KRW
                </span>
              </span>
              <input
                type='checkbox'
                checked={selectedProductIds.includes(product.id)}
                onChange={(event) => onToggleProduct(product.id, event.target.checked)}
              />
            </label>
          ))}
        </div>

        <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='text-muted-foreground text-sm'>
            {t('page.customers.exposure.pagination_summary', {
              page: currentPage,
              totalPage,
              totalItem,
              defaultValue: `Showing page ${currentPage} of ${totalPage} (${totalItem} items)`,
            })}
          </div>
          <div className='flex flex-wrap items-center gap-3'>
            <label className='text-muted-foreground flex items-center gap-2 text-sm'>
              <span>{t('page.customers.exposure.rows_per_page')}</span>
              <select
                className='border-input bg-background h-9 rounded-md border px-3 text-sm'
                value={perPage}
                onChange={(event) => onPerPageChange(Number(event.target.value))}
              >
                {PRODUCT_PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <AppButton type='button' variant='outline' size='sm' disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
              {t('common.action.previous')}
            </AppButton>
            <span className='rounded-md border px-3 py-1 text-sm'>{currentPage}</span>
            <AppButton type='button' variant='outline' size='sm' disabled={currentPage >= totalPage} onClick={() => onPageChange(currentPage + 1)}>
              {t('common.action.next')}
            </AppButton>
          </div>
        </div>

        <div className='flex justify-end'>
          <AppButton type='button' isLoading={isPending} disabled={!isDirty} onClick={onSave}>
            {t('page.customers.exposure.actions.save_products')}
          </AppButton>
        </div>
      </div>
    </section>
  );
}
