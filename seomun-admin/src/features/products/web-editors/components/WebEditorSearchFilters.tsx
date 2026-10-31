import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppInput } from '@/components/shared/app-input';
import { AppSelect } from '@/components/shared/app-select';
import { AppSearchFilter, AppSearchFilterField } from '@/components/shared/app-search-filter';

import { WEB_EDITOR_TYPE_TRANSLATION_KEYS, WEB_EDITOR_TYPE_VALUES } from '../constants';
import { type WebEditorType } from '../enums';
import type { WebEditorFilterValues } from '../schemas';

// === Type definitions ===

type WebEditorSearchFiltersProps = {
  initialValues: WebEditorFilterValues;
  onSearch: (values: WebEditorFilterValues) => void;
  onReset: () => void;
};

// === Component ===

export function WebEditorSearchFilters({ initialValues, onSearch, onReset }: WebEditorSearchFiltersProps) {
  const { t } = useTranslation('page');

  // === State ===
  const [searchKeyword, setSearchKeyword] = useState<string>(initialValues.search_keyword ?? '');
  const [type, setType] = useState<WebEditorType | undefined>(initialValues.type);
  const [isActive, setIsActive] = useState<'true' | 'false' | undefined>(initialValues.is_active);

  // === Hooks ===
  const typeOptions = useMemo(() => WEB_EDITOR_TYPE_VALUES.map((v) => ({ value: v, label: t(WEB_EDITOR_TYPE_TRANSLATION_KEYS[v]) })), [t]);

  const statusOptions = useMemo(
    () => [
      { value: 'true' as const, label: t('products.web_editors.enum.status.active') },
      { value: 'false' as const, label: t('products.web_editors.enum.status.hidden') },
    ],
    [t],
  );

  // === Functions ===
  const handleSearch = () => {
    onSearch({ search_keyword: searchKeyword.trim() || undefined, type, is_active: isActive });
  };

  const handleReset = () => {
    setSearchKeyword('');
    setType(undefined);
    setIsActive(undefined);
    onReset();
  };

  // === JSX return ===
  return (
    <AppSearchFilter onSearch={handleSearch} onReset={handleReset}>
      <AppSearchFilterField label={t('products.web_editors.fields.name')} htmlFor='we-keyword'>
        <AppInput
          id='we-keyword'
          value={searchKeyword}
          onValueChange={setSearchKeyword}
          placeholder={t('products.web_editors.list.search_placeholder')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('products.web_editors.fields.type')} htmlFor='we-type'>
        <AppSelect
          id='we-type'
          value={type}
          onValueChange={(val) => setType((val || undefined) as WebEditorType | undefined)}
          options={typeOptions}
          placeholder={t('products.web_editors.list.all_types')}
          clearable
        />
      </AppSearchFilterField>

      <AppSearchFilterField label={t('products.web_editors.fields.status')} htmlFor='we-status'>
        <AppSelect
          id='we-status'
          value={isActive}
          onValueChange={(val) => setIsActive((val || undefined) as 'true' | 'false' | undefined)}
          options={statusOptions}
          placeholder={t('products.web_editors.list.all_status')}
          clearable
        />
      </AppSearchFilterField>
    </AppSearchFilter>
  );
}
