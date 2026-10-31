import { useMemo } from 'react';

import { useCustomerListInfiniteQuery } from '@/features/customers';

import type { DashboardCustomerOption } from '../api';

const PER_PAGE = 20;

/** Loads customers for the dashboard filter multiselect, paginated via infinite scroll. */
export function useDashboardCustomerOptions(searchTerm?: string) {
  const query = useCustomerListInfiniteQuery({ per_page: PER_PAGE, search_term: searchTerm || undefined });

  const customers = useMemo<DashboardCustomerOption[]>(
    () =>
      (query.data?.pages.flatMap((page) => page.data.members) ?? []).map((member) => ({
        id: String(member.id),
        name: member.name,
        manager: member.username,
      })),
    [query.data],
  );

  return {
    customers,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
