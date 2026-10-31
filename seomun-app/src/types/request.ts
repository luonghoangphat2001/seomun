export type PaginationREQ = {
  page?: number;
  per_page?: number;
};

export type SortREQ = {
  sort_order?: 'asc' | 'desc';
};
