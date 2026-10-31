import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';

import type { ErpOptionGroupListREQ, ErpOptionListREQ } from '../api/option.request';
import { ErpOptionGroupSortField } from '../enums';
import type { OptionDetailSearch, OptionListSearch } from '../schemas/option-list-search.schema';

export type NormalizedErpOptionGroupListParams = ErpOptionGroupListREQ & Required<Pick<ErpOptionGroupListREQ, 'page' | 'per_page'>>;
export type NormalizedErpOptionListParams = ErpOptionListREQ & Required<Pick<ErpOptionListREQ, 'page' | 'per_page'>>;

export function normalizeOptionQuery(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function isErpOptionGroupSortField(value: string): value is ErpOptionGroupSortField {
  return Object.values(ErpOptionGroupSortField).includes(value as ErpOptionGroupSortField);
}

export function buildErpOptionGroupListParams(search: OptionListSearch): NormalizedErpOptionGroupListParams {
  const sortBy = search.sort_by && isErpOptionGroupSortField(search.sort_by) ? search.sort_by : ErpOptionGroupSortField.CREATED_AT;

  return {
    code: normalizeOptionQuery(search.code),
    label: normalizeOptionQuery(search.label),
    type: search.type,
    created_from: normalizeOptionQuery(search.created_from),
    created_to: normalizeOptionQuery(search.created_to),
    sort_by: sortBy,
    sort_order: search.sort_order ?? SortOrder.DESC,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}

export function buildErpOptionListParams(groupId: number, search: OptionDetailSearch): NormalizedErpOptionListParams {
  return {
    erp_option_group_id: groupId,
    option_code: normalizeOptionQuery(search.option_code),
    option_label: normalizeOptionQuery(search.option_label),
    created_from: normalizeOptionQuery(search.created_from),
    created_to: normalizeOptionQuery(search.created_to),
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}
