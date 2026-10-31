import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppInput } from '@/components/shared/app-input';
import { AppSelect, type AppSelectOption } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';
import { useCategoryListQuery } from '@/features/categories';

import { PRODUCT_STATUS_OPTIONS } from '../constants';
import type { ProductListLocale } from '../api';
import { EMPTY_PRODUCT_SEARCH_FILTER_VALUES, type ProductSearchFilterValues } from '../schemas';

interface ProductSearchFiltersProps {
  initialValues: ProductSearchFilterValues;
  locale: ProductListLocale;
  onSearch: (values: ProductSearchFilterValues) => void;
  onReset: () => void;
}

export function ProductSearchFilters({ initialValues, locale, onSearch, onReset }: ProductSearchFiltersProps) {
  const { t } = useTranslation('page');
  const [values, setValues] = useState<ProductSearchFilterValues>(initialValues);
  const categoryQuery = useCategoryListQuery({ page: 1, per_page: 100 });

  const categoryOptions = useMemo<AppSelectOption<string>[]>(
    () =>
      (categoryQuery.data?.data.categories ?? []).map((category) => ({
        value: String(category.id),
        label: (locale === 'en' ? category.name_en || category.name : category.name || category.name_en) || category.slug,
      })),
    [categoryQuery.data?.data.categories, locale],
  );

  const statusOptions = useMemo(
    () =>
      PRODUCT_STATUS_OPTIONS.map((option) => ({
        value: option.value,
        label: t(`products.management.status.${option.value}`),
      })),
    [t],
  );

  const handleSubmit = () => {
    onSearch(values);
  };

  const handleReset = () => {
    setValues({ ...EMPTY_PRODUCT_SEARCH_FILTER_VALUES });
    onReset();
  };

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  return (
    <AppSearchFilter onSearch={handleSubmit} onReset={handleReset}>
      <AppSearchFilterField label={t('products.management.filters.search_term')} htmlFor='product-search-term'>
        <AppInput
          id='product-search-term'
          value={values.search_term}
          onValueChange={(search_term) => setValues((previous) => ({ ...previous, search_term }))}
          placeholder={t('products.management.filters.search_term_placeholder')}
          size='md'
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('products.management.filters.product_name')} htmlFor='product-search-name'>
        <AppInput
          id='product-search-name'
          value={values.product_name}
          onValueChange={(product_name) => setValues((previous) => ({ ...previous, product_name }))}
          placeholder={t('products.management.filters.product_name_placeholder')}
          size='md'
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('products.management.filters.product_code')} htmlFor='product-search-code'>
        <AppInput
          id='product-search-code'
          value={values.product_code}
          onValueChange={(product_code) => setValues((previous) => ({ ...previous, product_code }))}
          placeholder={t('products.management.filters.product_code_placeholder')}
          size='md'
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('products.management.filters.category')} htmlFor='product-search-category'>
        <AppSelect
          id='product-search-category'
          value={values.category_id}
          onValueChange={(category_id) => setValues((previous) => ({ ...previous, category_id }))}
          options={categoryOptions}
          placeholder={
            categoryQuery.isLoading ? t('products.management.filters.loading_categories') : t('products.management.filters.all_categories')
          }
          size='md'
          clearable
          searchable
          disabled={categoryQuery.isLoading}
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('products.management.filters.status')} htmlFor='product-search-status'>
        <AppSelect
          id='product-search-status'
          value={values.status}
          onValueChange={(status) => setValues((previous) => ({ ...previous, status }))}
          options={statusOptions}
          placeholder={t('products.management.filters.all_statuses')}
          size='md'
          clearable
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
