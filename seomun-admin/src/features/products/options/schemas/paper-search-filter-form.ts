import type { PaperCategory } from '../enums';

export type PaperSearchFilterFormValues = {
  category?: PaperCategory;
  name: string;
  is_active?: 'true' | 'false';
};

export const PAPER_SEARCH_FILTER_DEFAULT_VALUES: PaperSearchFilterFormValues = {
  category: undefined,
  name: '',
  is_active: undefined,
};
