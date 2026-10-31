import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppInput } from '@/components/shared/app-input';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';
import { AppSelect } from '@/components/shared/app-select';
import type { CategoryFilterOptionRESP } from '../api';
import type { CategoryListSearch } from '../schemas';

type CategoryFilterProps = {
  filters?: CategoryFilterOptionRESP['data']['filters'];
  initialFilter: Partial<CategoryListSearch>;
  isLoading?: boolean;
  onSubmit: (filter: Partial<CategoryListSearch>) => void;
  onReset: () => void;
  className?: string;
};

export function CategoryFilter({ filters, initialFilter, isLoading = false, onSubmit, onReset, className }: CategoryFilterProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<Partial<CategoryListSearch>>(initialFilter);

  const statusOptions = useMemo(
    () => (filters?.status_options ?? []).map((option) => ({ ...option, label: t(`page.category.status.${option.value}`, option.label) })),
    [filters?.status_options, t],
  );

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  const handleFieldChange = <K extends keyof CategoryListSearch>(field: K, value: CategoryListSearch[K]) => {
    setFilter((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    onSubmit(filter);
  };

  const handleReset = () => {
    setFilter({});
    onReset();
  };

  return (
    <AppSearchFilter onSearch={handleSubmit} onReset={handleReset} className={className}>
      <AppSearchFilterField label={t('page.category.filter.name', 'Category Name')} htmlFor='filter-name'>
        <AppInput
          id='filter-name'
          placeholder={t('page.category.filter.name_placeholder', 'Search by category name')}
          value={filter.name ?? ''}
          onValueChange={(value) => handleFieldChange('name', value || undefined)}
        />
      </AppSearchFilterField>

      {/* Level */}
      {/* <AppSearchFilterField label={t('page.category.filter.level', 'Level')}>
        <AppSelect
          value={filter.level}
          options={filters?.category_levels ?? []}
          placeholder={t('page.category.filter.level_placeholder', 'Select level')}
          onValueChange={(val) => handleFieldChange('level', val)}
          disabled={isLoading}
          clearable
        />
      </AppSearchFilterField> */}

      <AppSearchFilterField label={t('page.category.filter.status', 'Status')} htmlFor='filter-status'>
        <AppSelect
          id='filter-status'
          value={filter.status}
          options={statusOptions}
          placeholder={t('page.category.filter.status_placeholder', 'Select status')}
          onValueChange={(val) => handleFieldChange('status', val)}
          disabled={isLoading}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('page.category.filter.registrant', 'Registrant')} htmlFor='filter-registrant'>
        <AppInput
          id='filter-registrant'
          placeholder={t('page.category.filter.registrant_placeholder', 'Search by registrant name')}
          value={filter.registrant ?? ''}
          onValueChange={(value) => handleFieldChange('registrant', value || undefined)}
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
