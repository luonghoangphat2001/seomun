import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppInput } from '@/components/shared/app-input';
import { AppSelect } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import {
  EMPTY_PRICE_HISTORY_SEARCH_FILTER_VALUES,
  PRICE_HISTORY_ACTION_OPTIONS,
  PRICE_HISTORY_TARGET_SECTION_OPTIONS,
  type PriceHistorySearchFilterValues,
} from '../constants';

type PriceHistorySearchFiltersProps = {
  initialValues: PriceHistorySearchFilterValues;
  onSearch: (values: PriceHistorySearchFilterValues) => void;
  onReset: () => void;
};

export function PriceHistorySearchFilters({ initialValues, onSearch, onReset }: PriceHistorySearchFiltersProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<PriceHistorySearchFilterValues>(initialValues);

  const translatedActionOptions = useMemo(
    () =>
      PRICE_HISTORY_ACTION_OPTIONS.map((option) => ({
        ...option,
        label: t(`page.products.price_history.actions.${option.value}`, option.label),
      })),
    [t],
  );

  const translatedSectionOptions = useMemo(
    () =>
      PRICE_HISTORY_TARGET_SECTION_OPTIONS.map((option) => ({
        ...option,
        label: t(`page.products.price_history.sections.${option.value}`, option.label),
      })),
    [t],
  );

  const handleSubmit = () => {
    onSearch(values);
  };

  const handleReset = () => {
    setValues(EMPTY_PRICE_HISTORY_SEARCH_FILTER_VALUES);
    onReset();
  };

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  return (
    <AppSearchFilter onSearch={handleSubmit} onReset={handleReset}>
      <AppSearchFilterField label={t('page.products.price_history.filters.search')} htmlFor='price-history-search-query'>
        <AppInput
          id='price-history-search-query'
          value={values.query}
          onValueChange={(query) => setValues((previous) => ({ ...previous, query }))}
          placeholder={t('page.products.price_history.filters.search_placeholder')}
          size='md'
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('page.products.price_history.filters.action')} htmlFor='price-history-search-action'>
        <AppSelect
          id='price-history-search-action'
          value={values.action_type}
          onValueChange={(action_type) => setValues((previous) => ({ ...previous, action_type }))}
          options={translatedActionOptions}
          placeholder={t('page.products.price_history.filters.all_actions')}
          size='md'
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('page.products.price_history.filters.section')} htmlFor='price-history-search-section'>
        <AppSelect
          id='price-history-search-section'
          value={values.target_section}
          onValueChange={(target_section) => setValues((previous) => ({ ...previous, target_section }))}
          options={translatedSectionOptions}
          placeholder={t('page.products.price_history.filters.all_sections')}
          size='md'
          clearable
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
