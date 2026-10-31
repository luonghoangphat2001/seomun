import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { AppSelect } from '@/components/shared/app-select';
import { AppFieldLabel } from '@/components/shared/form-fields';

import type { UnitPriceSectionKey } from '../api';
import { UNIT_PRICE_SECTION_OPTIONS } from '../constants';

type UnitPriceSectionSelectProps = {
  value: UnitPriceSectionKey;
  onChange: (section: UnitPriceSectionKey) => void;
};

export function UnitPriceSectionSelect({ value, onChange }: UnitPriceSectionSelectProps) {
  const { t } = useTranslation();

  const translatedSectionOptions = useMemo(
    () =>
      UNIT_PRICE_SECTION_OPTIONS.map((option) => ({
        ...option,
        label: t(`page.products.unit_price_settings.sections.${option.value}`, option.label),
      })),
    [t],
  );

  return (
    <div className='flex flex-col gap-1.5 md:max-w-xs'>
      <AppFieldLabel htmlFor='unit-price-search-section' label={t('page.products.unit_price_settings.filters.section')} />
      <AppSelect
        id='unit-price-search-section'
        value={value}
        onValueChange={(next) => onChange(next ?? value)}
        options={translatedSectionOptions}
        size='md'
      />
    </div>
  );
}
