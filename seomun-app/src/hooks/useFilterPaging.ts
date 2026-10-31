'use client';

import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PaginationREQ } from '@/types';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useDebounce } from './useDebounce';

type FilterPagingType<T> = {
  getInitialFilter: (params: URLSearchParams) => T;
  prefix?: string;
  defaultPage?: number;
  defaultPerPage?: number;
};

export function useFilterPaging<T extends PaginationREQ & Record<string, unknown>>({
  getInitialFilter,
  prefix,
  defaultPage = 1,
  defaultPerPage = 10,
}: FilterPagingType<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialFilter = useMemo(
    () => getInitialFilter(new URLSearchParams(searchParams.toString())),
    [getInitialFilter, searchParams],
  );

  const [filter, _setFilter] = useState<T>(initialFilter);
  const filterRef = useRef<T>(initialFilter);

  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: Math.max(Number(filter.page ?? defaultPage) - 1, 0),
      pageSize: Number(filter.per_page ?? defaultPerPage),
    }),
    [filter.page, filter.per_page, defaultPage, defaultPerPage],
  );

  const updateUrl = useCallback(
    (nextFilter: T) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(nextFilter).forEach(([key, value]) => {
        const paramKey = prefix ? `${prefix}_${key}` : key;

        if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
          params.delete(paramKey);
          return;
        }

        if (value !== undefined && value !== null && value !== '') {
          params.set(paramKey, String(value));
        } else {
          params.delete(paramKey);
        }
      });

      const nextQueryString = params.toString();
      const currentQueryString = searchParams.toString();

      if (nextQueryString === currentQueryString) return;

      router.replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname, {
        scroll: false,
      });
    },
    [pathname, prefix, router, searchParams],
  );

  const setFilterAndUrl = useCallback(
    (updater: T | ((prev: T) => T)) => {
      const prev = filterRef.current;

      const nextFilter = typeof updater === 'function' ? (updater as (prev: T) => T)(prev) : updater;

      filterRef.current = nextFilter;
      _setFilter(nextFilter);

      updateUrl(nextFilter);
    },
    [updateUrl],
  );

  const handleFilterChange = useCallback(
    (newFilter: Partial<T>) => {
      setFilterAndUrl((prev) => ({
        ...prev,
        ...newFilter,
        page: defaultPage,
      }));
    },
    [defaultPage, setFilterAndUrl],
  );

  const handlePagingChange = useCallback(
    (pageNumber: number, pageSize?: number) => {
      setFilterAndUrl((prev) => ({
        ...prev,
        page: pageNumber,
        per_page: pageSize ?? prev.per_page ?? defaultPerPage,
      }));
    },
    [defaultPerPage, setFilterAndUrl],
  );

  const onPaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updater) => {
      setFilterAndUrl((prev) => {
        const current: PaginationState = {
          pageIndex: Math.max(Number(prev.page ?? defaultPage) - 1, 0),
          pageSize: Number(prev.per_page ?? defaultPerPage),
        };

        const next = typeof updater === 'function' ? updater(current) : updater;

        return {
          ...prev,
          page: next.pageIndex + 1,
          per_page: next.pageSize,
        };
      });
    },
    [defaultPage, defaultPerPage, setFilterAndUrl],
  );

  // ponytail: only the search box needs debouncing — paging and filter clicks must reach the query right away
  const debouncedSearch = useDebounce(filter.search, 300);
  const debouncedFilter = { ...filter, search: debouncedSearch } as T;

  return {
    filter,
    debouncedFilter,
    pagination,
    setFilter: setFilterAndUrl,
    handleFilterChange,
    handlePagingChange,
    onPaginationChange,
  };
}
