import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';

import type { TemplateListREQ } from '../api';
import { TemplateSortField } from '../enums';
import type { TemplateListSearch } from '../schemas';

export type NormalizedTemplateListParams = TemplateListREQ & Required<Pick<TemplateListREQ, 'page' | 'per_page'>>;

export function normalizeTemplateQuery(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function isTemplateSortField(value: string): value is TemplateSortField {
  return Object.values(TemplateSortField).includes(value as TemplateSortField);
}

export function buildTemplateListParams(search: TemplateListSearch): NormalizedTemplateListParams {
  const sortBy = search.sort_by && isTemplateSortField(search.sort_by) ? search.sort_by : undefined;

  return {
    template_name: normalizeTemplateQuery(search.template_name),
    specification: normalizeTemplateQuery(search.specification),
    registrant: normalizeTemplateQuery(search.registrant),
    status: search.status,
    last_modified_from: search.last_modified_from,
    last_modified_to: search.last_modified_to,
    sort_by: sortBy,
    sort_order: sortBy ? (search.sort_order ?? SortOrder.DESC) : undefined,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}
