import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppSelect } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';
import type { Paper } from '@/features/products/options';

import type { PaperPriceSearchFilters as PaperPriceSearchFiltersData, UnitPriceSectionKey } from '../../api';
import { localizePaperSizeDivisionOptions } from '../../constants';
import { UnitPriceSectionSelect } from '../UnitPriceSectionSelect';

export type PaperPriceFilterValues = {
  paper_id?: string;
  paper_size_division_code?: string;
  is_hot_deal?: 'true' | 'false';
};

export const EMPTY_PAPER_PRICE_FILTER_VALUES: PaperPriceFilterValues = {
  paper_id: undefined,
  paper_size_division_code: undefined,
  is_hot_deal: undefined,
};

type PaperPriceSearchFiltersProps = {
  section: UnitPriceSectionKey;
  onSectionChange: (section: UnitPriceSectionKey) => void;
  initialValues: PaperPriceFilterValues;
  papers: Paper[];
  searchFilters: PaperPriceSearchFiltersData | undefined;
  onSearch: (values: PaperPriceFilterValues) => void;
  onReset: () => void;
};

export function PaperPriceSearchFilters({
  section,
  onSectionChange,
  initialValues,
  papers,
  searchFilters,
  onSearch,
  onReset,
}: PaperPriceSearchFiltersProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<PaperPriceFilterValues>(initialValues);

  const paperOptions = useMemo(() => papers.map((paper) => ({ value: String(paper.id), label: paper.name })), [papers]);
  const sizeDivisionOptions = useMemo(
    () => localizePaperSizeDivisionOptions(t, searchFilters?.paper_size_division_code_options ?? []),
    [searchFilters, t],
  );
  const statusOptions = useMemo(
    () => [
      { value: 'true' as const, label: t('page.products.unit_price_settings.paper_price.status.hot_deal', 'Hot deal') },
      { value: 'false' as const, label: t('page.products.unit_price_settings.paper_price.status.none', 'None') },
    ],
    [t],
  );
  const handleSubmit = () => {
    onSearch(values);
  };

  const handleReset = () => {
    setValues(EMPTY_PAPER_PRICE_FILTER_VALUES);
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
      <AppSearchFilterField label={t('page.products.unit_price_settings.paper_price.filters.paper', 'Paper')} htmlFor='paper-price-search-paper'>
        <AppSelect
          id='paper-price-search-paper'
          value={values.paper_id}
          onValueChange={(paper_id) => setValues((previous) => ({ ...previous, paper_id }))}
          options={paperOptions}
          placeholder={t('page.products.unit_price_settings.paper_price.filters.paper_placeholder', 'All papers')}
          searchable
          clearable
          size='md'
        />
      </AppSearchFilterField>

      <AppSearchFilterField
        label={t('page.products.unit_price_settings.paper_price.filters.paper_size', 'Paper size')}
        htmlFor='paper-price-search-size'
      >
        <AppSelect
          id='paper-price-search-size'
          value={values.paper_size_division_code}
          onValueChange={(paper_size_division_code) => setValues((previous) => ({ ...previous, paper_size_division_code }))}
          options={sizeDivisionOptions}
          placeholder={t('page.products.unit_price_settings.paper_price.filters.paper_size_placeholder', 'All sizes')}
          clearable
          size='md'
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('page.products.unit_price_settings.paper_price.filters.status', 'Status')} htmlFor='paper-price-search-status'>
        <AppSelect
          id='paper-price-search-status'
          value={values.is_hot_deal}
          onValueChange={(is_hot_deal) => setValues((previous) => ({ ...previous, is_hot_deal }))}
          options={statusOptions}
          placeholder={t('page.products.unit_price_settings.paper_price.filters.status_placeholder', 'All statuses')}
          clearable
          size='md'
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
