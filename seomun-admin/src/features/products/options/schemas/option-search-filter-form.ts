import type { ErpOptionGroupType } from '../enums';

export type OptionSearchFilterFormValues = {
  label: string;
  code: string;
  type?: ErpOptionGroupType;
  created_from: Date | null;
  created_to: Date | null;
};

export const OPTION_SEARCH_FILTER_DEFAULT_VALUES: OptionSearchFilterFormValues = {
  label: '',
  code: '',
  type: undefined,
  created_from: null,
  created_to: null,
};

export type OptionDetailSearchFilterFormValues = {
  option_code: string;
  option_label: string;
  created_from: Date | null;
  created_to: Date | null;
};

export const OPTION_DETAIL_SEARCH_FILTER_DEFAULT_VALUES: OptionDetailSearchFilterFormValues = {
  option_code: '',
  option_label: '',
  created_from: null,
  created_to: null,
};
