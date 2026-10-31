import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';

import type { ProductListREQ } from '../api/product.request';
import { ProductSortField } from '../enums';
import type { ProductListSearch } from '../schemas';

export type NormalizedProductListParams = ProductListREQ & Required<Pick<ProductListREQ, 'page' | 'per_page'>>;

export function normalizeProductQuery(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeProductBoolean(value?: boolean) {
  return typeof value === 'boolean' ? value : undefined;
}

export function isProductSortField(value: string): value is ProductSortField {
  return Object.values(ProductSortField).includes(value as ProductSortField);
}

export function buildProductListParams(search: ProductListSearch): NormalizedProductListParams {
  return {
    ...search,
    search_term: normalizeProductQuery(search.search_term),
    product_name: normalizeProductQuery(search.product_name),
    product_code: normalizeProductQuery(search.product_code),
    product_type: normalizeProductQuery(search.product_type),
    branch: normalizeProductQuery(search.branch),
    customer: normalizeProductQuery(search.customer),
    type: normalizeProductQuery(search.type),
    customer_usage: normalizeProductQuery(search.customer_usage),
    is_promotional: normalizeProductBoolean(search.is_promotional),
    is_public: normalizeProductBoolean(search.is_public),
    has_quotation: normalizeProductBoolean(search.has_quotation),
    sort_by: search.sort_by ?? ProductSortField.CREATED_AT,
    sort_order: search.sort_order ?? SortOrder.DESC,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}
