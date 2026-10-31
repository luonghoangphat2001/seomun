import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppInput } from '@/components/shared/app-input';
import { AppSelect } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';
import { useCategoriesInfiniteQuery } from '@/features/categories';
import { useProductsInfiniteQuery } from '@/features/products/management';
import { useDebounce } from '@/hooks/use-debounce';

import type { UnitPriceSectionKey } from '../../api';
import { dedupeByValue } from '../../utils/dedupe-by-value';
import { UnitPriceSectionSelect } from '../UnitPriceSectionSelect';

export type OtherPriceFilterValues = {
  product_id?: string;
  category_id?: string;
  search_keyword?: string;
  is_active?: 'true' | 'false';
};

export const EMPTY_OTHER_PRICE_FILTER_VALUES: OtherPriceFilterValues = {
  product_id: undefined,
  category_id: undefined,
  search_keyword: undefined,
  is_active: undefined,
};

type OtherPriceSearchFiltersProps = {
  section: UnitPriceSectionKey;
  onSectionChange: (section: UnitPriceSectionKey) => void;
  initialValues: OtherPriceFilterValues;
  onSearch: (values: OtherPriceFilterValues) => void;
  onReset: () => void;
};

export function OtherPriceSearchFilters({ section, onSectionChange, initialValues, onSearch, onReset }: OtherPriceSearchFiltersProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<OtherPriceFilterValues>(initialValues);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');

  const debouncedProductSearchTerm = useDebounce(productSearchTerm);
  const debouncedCategorySearchTerm = useDebounce(categorySearchTerm);

  const productsQuery = useProductsInfiniteQuery({ product_name: debouncedProductSearchTerm || undefined }, 'ko');
  const categoriesQuery = useCategoriesInfiniteQuery({ name: debouncedCategorySearchTerm || undefined });

  const productOptions = useMemo(
    () =>
      dedupeByValue(
        (productsQuery.data?.pages.flatMap((page) => page.data.products) ?? []).map((product) => ({
          value: String(product.id),
          label: product.product_name,
          description: product.product_name_en !== product.product_name ? (product.product_name_en ?? undefined) : undefined,
          keywords: product.product_name_en ? [product.product_name_en] : undefined,
        })),
      ),
    [productsQuery.data],
  );

  const categoryOptions = useMemo(
    () =>
      dedupeByValue(
        (categoriesQuery.data?.pages.flatMap((page) => page.data.categories) ?? []).map((category) => ({
          value: String(category.id),
          label: category.name,
        })),
      ),
    [categoriesQuery.data],
  );

  const statusOptions = useMemo(
    () => [
      { value: 'true' as const, label: t('page.products.unit_price_settings.other_price.status.active', 'Active') },
      { value: 'false' as const, label: t('page.products.unit_price_settings.other_price.status.inactive', 'Inactive') },
    ],
    [t],
  );

  const handleSubmit = () => {
    onSearch(values);
  };

  const handleReset = () => {
    setValues(EMPTY_OTHER_PRICE_FILTER_VALUES);
    setProductSearchTerm('');
    setCategorySearchTerm('');
    onReset();
  };

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  return (
    <AppSearchFilter onSearch={handleSubmit} onReset={handleReset}>
      <AppSearchFilterField>
        <UnitPriceSectionSelect value={section} onChange={onSectionChange} />
      </AppSearchFilterField>
      <AppSearchFilterField
        label={t('page.products.unit_price_settings.other_price.filters.search_keyword', 'Search term')}
        htmlFor='other-price-search-keyword'
      >
        <AppInput
          id='other-price-search-keyword'
          value={values.search_keyword ?? ''}
          onValueChange={(search_keyword) => setValues((previous) => ({ ...previous, search_keyword: search_keyword || undefined }))}
          placeholder={t('page.products.unit_price_settings.other_price.filters.search_keyword_placeholder', 'Enter a search term')}
          clearable
          size='md'
        />
      </AppSearchFilterField>

      <AppSearchFilterField
        label={t('page.products.unit_price_settings.other_price.filters.product', 'Product name')}
        htmlFor='other-price-search-product'
      >
        <AppSelect
          id='other-price-search-product'
          value={values.product_id}
          onValueChange={(product_id) => setValues((previous) => ({ ...previous, product_id }))}
          options={productOptions}
          placeholder={t('page.products.unit_price_settings.other_price.filters.product_placeholder', 'All products')}
          searchable
          onSearchValueChange={setProductSearchTerm}
          onReachEnd={() => {
            if (productsQuery.hasNextPage && !productsQuery.isFetchingNextPage) void productsQuery.fetchNextPage();
          }}
          isFetchingNextPage={productsQuery.isFetchingNextPage}
          clearable
          size='md'
        />
      </AppSearchFilterField>

      <AppSearchFilterField
        label={t('page.products.unit_price_settings.other_price.filters.category', 'Category')}
        htmlFor='other-price-search-category'
      >
        <AppSelect
          id='other-price-search-category'
          value={values.category_id}
          onValueChange={(category_id) => setValues((previous) => ({ ...previous, category_id }))}
          options={categoryOptions}
          placeholder={t('page.products.unit_price_settings.other_price.filters.category_placeholder', 'All categories')}
          searchable
          onSearchValueChange={setCategorySearchTerm}
          onReachEnd={() => {
            if (categoriesQuery.hasNextPage && !categoriesQuery.isFetchingNextPage) void categoriesQuery.fetchNextPage();
          }}
          isFetchingNextPage={categoriesQuery.isFetchingNextPage}
          clearable
          size='md'
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('page.products.unit_price_settings.other_price.filters.status', 'Status')} htmlFor='other-price-search-status'>
        <AppSelect
          id='other-price-search-status'
          value={values.is_active}
          onValueChange={(is_active) => setValues((previous) => ({ ...previous, is_active }))}
          options={statusOptions}
          placeholder={t('page.products.unit_price_settings.other_price.filters.status_placeholder', 'All statuses')}
          clearable
          size='md'
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
