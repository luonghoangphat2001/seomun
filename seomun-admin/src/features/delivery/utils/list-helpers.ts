import { SortOrder } from '@/enums';

export type PaginatedList<T> = {
  rows: T[];
  pageCount: number;
  totalCount: number;
};

export function normalizeDeliveryQuery(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.toLowerCase() : undefined;
}

export function isDateWithinRange(value: string, from?: string, to?: string) {
  if (from && value < from) {
    return false;
  }

  if (to && value > to) {
    return false;
  }

  return true;
}

export function compareDeliveryValues(first: string | number, second: string | number, sortOrder: SortOrder) {
  const direction = sortOrder === SortOrder.ASC ? 1 : -1;

  if (typeof first === 'number' && typeof second === 'number') {
    return (first - second) * direction;
  }

  return String(first).localeCompare(String(second)) * direction;
}

export function paginateDeliveryRows<T>(rows: T[], page: number, perPage: number): PaginatedList<T> {
  const safePage = Math.max(page, 1);
  const safePerPage = Math.max(perPage, 1);
  const pageCount = Math.ceil(rows.length / safePerPage);
  const start = (safePage - 1) * safePerPage;

  return {
    rows: rows.slice(start, start + safePerPage),
    pageCount,
    totalCount: rows.length,
  };
}
