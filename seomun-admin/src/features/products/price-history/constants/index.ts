import type { PriceHistoryActionType, PriceHistoryTargetSection } from '../api';

export type PriceHistorySearchFilterValues = {
  query: string;
  action_type?: PriceHistoryActionType;
  target_section?: PriceHistoryTargetSection;
};

export const EMPTY_PRICE_HISTORY_SEARCH_FILTER_VALUES: PriceHistorySearchFilterValues = {
  query: '',
  action_type: undefined,
  target_section: undefined,
};

export const PRICE_HISTORY_ACTION_OPTIONS: Array<{ value: PriceHistoryActionType; label: string }> = [
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Edit' },
  { value: 'DELETE', label: 'Delete' },
];

export const PRICE_HISTORY_TARGET_SECTION_OPTIONS: Array<{ value: PriceHistoryTargetSection; label: string }> = [
  { value: 'papers', label: 'Paper' },
  { value: 'printing', label: 'Printing' },
  { value: 'post_processing', label: 'Post-processing' },
  { value: 'options', label: 'Option' },
];

export const PRICE_HISTORY_FIELD_LABEL_KEYS = {
  manufacturer: 'page.products.price_history.fields.manufacturer',
  paper_name: 'page.products.price_history.fields.paper_name',
  specification: 'page.products.price_history.fields.specification',
  color: 'page.products.price_history.fields.color',
  pattern: 'page.products.price_history.fields.pattern',
  basis_weight: 'page.products.price_history.fields.basis_weight',
  unit_price_name: 'page.products.price_history.fields.unit_price_name',
  applicable_estimate: 'page.products.price_history.fields.applicable_estimate',
  unit_price_key: 'page.products.price_history.fields.unit_price_key',
  unit_price_tab: 'page.products.price_history.fields.unit_price_tab',
  unit_price_item: 'page.products.price_history.fields.unit_price_item',
  option_name: 'page.products.price_history.fields.option_name',
  field_name: 'page.products.price_history.fields.field_name',
  option_code: 'page.products.price_history.fields.option_code',
  option_value: 'page.products.price_history.fields.option_value',
} as const;

export function getPriceHistoryFieldLabelKey(fieldKey: string) {
  return PRICE_HISTORY_FIELD_LABEL_KEYS[fieldKey as keyof typeof PRICE_HISTORY_FIELD_LABEL_KEYS];
}
