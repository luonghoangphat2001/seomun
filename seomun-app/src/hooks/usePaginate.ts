'use client';
import { PAGINATION } from '@/constants/common';
import { useMemo, useState } from 'react';

type UsePaginateOptions = {
  defaultPage?: number;
  defaultPageSize?: number;
};

type UsePaginateReturn<T> = {
  paginatedData: T[];
  totalPage: number;
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  resetPage: () => void;
};

export const usePaginate = <T>(data: T[], options?: UsePaginateOptions): UsePaginateReturn<T> => {
  const { defaultPage = PAGINATION.DEFAULT_PAGE_INDEX, defaultPageSize = PAGINATION.DEFAULT_PAGE_SIZE } = options ?? {};

  const [page, setPage] = useState(defaultPage);
  const [size, setSize] = useState(defaultPageSize);

  const totalRecords = data.length;
  const totalPage = Math.max(1, Math.ceil(totalRecords / size));

  const safePage = Math.min(page, totalPage);

  const paginatedData = useMemo(() => data.slice((safePage - 1) * size, safePage * size), [data, safePage, size]);

  const setCurrentPage = (nextPage: number) => {
    setPage(Math.max(1, Math.min(nextPage, totalPage)));
  };

  const setPageSize = (nextSize: number) => {
    setSize(nextSize);
    setPage(1);
  };

  const resetPage = () => setPage(1);

  return {
    paginatedData,
    totalPage,
    totalRecords,
    currentPage: safePage,
    pageSize: size,
    setCurrentPage,
    setPageSize,
    resetPage,
  };
};
