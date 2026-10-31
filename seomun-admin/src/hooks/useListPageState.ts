import { functionalUpdate, type OnChangeFn, type PaginationState, type SortingState } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';

import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';

export type BaseSearch<TSortField extends string = string> = {
  page?: number;
  per_page?: number;
  sort_by?: TSortField;
  sort_order?: SortOrder;
};

export type BaseQueryParams<TSortField extends string = string> = {
  page: number;
  per_page: number;
  sort_by?: TSortField;
  sort_order?: SortOrder;
};

type FilterSearchPatch<TSearch, TSortField extends string> = Partial<Omit<TSearch, keyof BaseSearch<TSortField>>>;

type NavigateSearchParams<TSearch> = {
  search: (prev: TSearch) => TSearch;
};

type NavigateSearchFn<TSearch> = (params: NavigateSearchParams<TSearch>) => void | Promise<void>;

export type ListPageStateParams<
  TSearch extends BaseSearch<TSortField>,
  TFilterValues,
  TSortField extends string = string,
  TQueryParams extends BaseQueryParams<TSortField> = BaseQueryParams<TSortField>,
> = {
  search: TSearch;
  navigate: NavigateSearchFn<TSearch>;
  defaultPage?: number;
  defaultPerPage?: number;
  buildQueryParams: (search: TSearch) => TQueryParams;
  mapSearchToFilters: (search: TSearch) => TFilterValues;
  mapFiltersToSearch: (values: TFilterValues) => FilterSearchPatch<TSearch, TSortField>;
  resetSearch: (prev: TSearch) => TSearch;
  parseSortField?: (columnId: string) => TSortField | undefined;
};

export type ListPageStateResult<TQueryParams, TFilterValues> = {
  queryParams: TQueryParams;
  appliedFilters: TFilterValues;
  tableState: {
    pagination: PaginationState;
    sorting: SortingState;
  };
  applyFilters: (values: TFilterValues) => void;
  resetFilters: () => void;
  onPaginationChange: OnChangeFn<PaginationState>;
  onSortingChange: OnChangeFn<SortingState>;
};

export function useListPageState<
  TSearch extends BaseSearch<TSortField>,
  TFilterValues,
  TSortField extends string = string,
  TQueryParams extends BaseQueryParams<TSortField> = BaseQueryParams<TSortField>,
>({
  search,
  navigate,
  defaultPage = DEFAULT_PAGE,
  defaultPerPage = DEFAULT_PER_PAGE,
  buildQueryParams,
  mapSearchToFilters,
  mapFiltersToSearch,
  resetSearch,
  parseSortField,
}: ListPageStateParams<TSearch, TFilterValues, TSortField, TQueryParams>): ListPageStateResult<TQueryParams, TFilterValues> {
  const queryParams = useMemo(() => buildQueryParams(search), [buildQueryParams, search]);
  const appliedFilters = useMemo(() => mapSearchToFilters(search), [mapSearchToFilters, search]);

  const tableState = useMemo(
    () => ({
      pagination: {
        pageIndex: Math.max(queryParams.page - 1, 0),
        pageSize: Math.max(queryParams.per_page, 1),
      } satisfies PaginationState,
      sorting: (queryParams.sort_by ? [{ id: queryParams.sort_by, desc: queryParams.sort_order === SortOrder.DESC }] : []) satisfies SortingState,
    }),
    [queryParams.page, queryParams.per_page, queryParams.sort_by, queryParams.sort_order],
  );

  const applyFilters = useCallback(
    (values: TFilterValues) => {
      void navigate({
        search: (prev) => ({
          ...prev,
          ...mapFiltersToSearch(values),
          page: undefined,
        }),
      });
    },
    [mapFiltersToSearch, navigate],
  );

  const resetFilters = useCallback(() => {
    void navigate({ search: resetSearch });
  }, [navigate, resetSearch]);

  const onPaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updaterOrValue) => {
      const next = functionalUpdate(updaterOrValue, tableState.pagination);
      const nextPage = Math.max(next.pageIndex + 1, defaultPage);
      const nextPageSize = Math.max(next.pageSize, 1);
      const isPageSizeChanged = nextPageSize !== tableState.pagination.pageSize;

      void navigate({
        search: (prev) => ({
          ...prev,
          page: isPageSizeChanged || nextPage === defaultPage ? undefined : nextPage,
          per_page: nextPageSize === defaultPerPage ? undefined : nextPageSize,
        }),
      });
    },
    [defaultPage, defaultPerPage, navigate, tableState.pagination],
  );

  const onSortingChange: OnChangeFn<SortingState> = useCallback(
    (updaterOrValue) => {
      const next = functionalUpdate(updaterOrValue, tableState.sorting);
      const first = next[0];
      const sortBy = first ? (parseSortField ? parseSortField(first.id) : (first.id as TSortField)) : undefined;

      void navigate({
        search: (prev) => ({
          ...prev,
          page: undefined,
          sort_by: sortBy,
          sort_order: sortBy ? (first.desc ? SortOrder.DESC : SortOrder.ASC) : undefined,
        }),
      });
    },
    [navigate, parseSortField, tableState.sorting],
  );

  return {
    queryParams,
    appliedFilters,
    tableState,
    applyFilters,
    resetFilters,
    onPaginationChange,
    onSortingChange,
  };
}
