import type { SortOrder } from '@/enums';

export type PaginationRequest = {
  page?: number;
  per_page?: number;
};

export type SortRequest<TSortField extends string = string> = {
  sort_by?: TSortField;
  sort_order?: SortOrder;
};
