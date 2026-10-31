import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import type { CategoryListREQ } from '../api/category.request';
import type { CategoryListSearch } from '../schemas';

export type NormalizedCategoryListParams = CategoryListREQ & Required<Pick<CategoryListREQ, 'page' | 'per_page'>>;

export function buildCategoryListParams(search: CategoryListSearch): NormalizedCategoryListParams {
  return {
    name: search.name,
    level: search.level,
    status: search.status,
    registrant: search.registrant,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}
