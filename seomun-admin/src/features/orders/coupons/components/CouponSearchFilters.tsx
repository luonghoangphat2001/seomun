import { Search } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppDateRangePickerFormField, AppInputFormField, AppSelectFormField } from '@/components/shared/form-fields';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import { getCouponActiveFilterOptions } from '../constants';
import type { CouponSearchFilterValues } from '../schemas';

// ============================================================================
// Type definitions
// ============================================================================

type CouponSearchFiltersProps = {
  initialValues: CouponSearchFilterValues;
  onSearch: (values: CouponSearchFilterValues) => void;
  onReset: () => void;
};

export function CouponSearchFilters({ initialValues, onSearch, onReset }: CouponSearchFiltersProps) {
  // ============================================================================
  // Hooks
  // ============================================================================
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  const form = useForm<CouponSearchFilterValues>({ defaultValues: initialValues });

  // ============================================================================
  // Variables
  // ============================================================================
  const activeOptions = getCouponActiveFilterOptions(tCommon);

  // ============================================================================
  // Functions
  // ============================================================================
  const handleReset = () => {
    onReset();
  };

  // ============================================================================
  // Effects
  // ============================================================================
  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <AppSearchFilter onSearch={() => void form.handleSubmit(onSearch)()} onReset={handleReset}>
      <AppSearchFilterField wide>
        <AppDateRangePickerFormField
          control={form.control}
          fromName='starts_at_from'
          toName='expires_at_to'
          label={t('orders.coupons.filters.period')}
          placeholder={t('orders.coupons.filters.date_range_placeholder')}
          allowClear
        />
      </AppSearchFilterField>

      <AppSearchFilterField>
        <AppInputFormField
          name='search_term'
          control={form.control}
          label={tCommon('filter.search_term')}
          placeholder={t('orders.coupons.filters.search_term_placeholder')}
          prefix={<Search className='size-4' />}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField>
        <AppSelectFormField
          name='is_active'
          control={form.control}
          label={t('orders.coupons.filters.is_active')}
          placeholder={t('orders.coupons.filters.all_statuses')}
          options={activeOptions}
          clearable
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
