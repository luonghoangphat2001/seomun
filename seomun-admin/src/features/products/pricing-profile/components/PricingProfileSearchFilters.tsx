import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppSelect } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

// import { PricingCalculatorType } from '../enums';
import type { PricingProfileFilterValues } from '../schemas';

type PricingProfileSearchFiltersProps = {
  initialValues: PricingProfileFilterValues;
  onSearch: (values: PricingProfileFilterValues) => void;
  onReset: () => void;
};

export function PricingProfileSearchFilters({ initialValues, onSearch, onReset }: PricingProfileSearchFiltersProps) {
  const { t } = useTranslation('page');
  // const [calculatorType, setCalculatorType] = useState<PricingCalculatorType | undefined>(initialValues.calculator_type);
  const [isActive, setIsActive] = useState<'true' | 'false' | undefined>(initialValues.is_active);

  // const calculatorOptions = useMemo(
  //   () =>
  //     Object.values(PricingCalculatorType).map((calculator) => ({
  //       value: calculator,
  //       label: t(`products.pricing_profiles.calculators.${calculator}`),
  //     })),
  //   [t],
  // );
  const statusOptions = useMemo(
    () => [
      { value: 'true', label: t('products.pricing_profiles.status.active') },
      { value: 'false', label: t('products.pricing_profiles.status.inactive') },
    ],
    [t],
  );

  const reset = () => {
    // setCalculatorType(undefined);
    setIsActive(undefined);
    onReset();
  };

  return (
    <AppSearchFilter onSearch={() => onSearch({ is_active: isActive })} onReset={reset}>
      {/* <div className='space-y-2'>
        <AppLabel label={t('products.pricing_profiles.fields.calculator')} htmlFor='pricing-profile-calculator-filter' />
        <AppSelect
          id='pricing-profile-calculator-filter'
          value={calculatorType}
          onValueChange={(value) => setCalculatorType((value || undefined) as PricingCalculatorType | undefined)}
          options={calculatorOptions}
          placeholder={t('products.pricing_profiles.filters.all_calculators')}
          clearable
        />
      </div> */}
      <AppSearchFilterField label={t('products.pricing_profiles.fields.status')} htmlFor='pricing-profile-status-filter'>
        <AppSelect
          id='pricing-profile-status-filter'
          value={isActive}
          onValueChange={(value) => setIsActive((value || undefined) as 'true' | 'false' | undefined)}
          options={statusOptions}
          placeholder={t('products.pricing_profiles.filters.all_statuses')}
          clearable
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
