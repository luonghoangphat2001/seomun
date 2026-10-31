import { keepPreviousData, queryOptions, useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import type { IBaseError } from '@/types/api';

import type { DirectShippingListSearch } from '../schemas';
import { getDirectShippingAPI, getDirectShippingsAPI, updateDirectShippingStatusAPI } from './direct-shipping.api';
import type { DirectShippingListREQ, DirectShippingStatusREQ } from './direct-shipping.request';
import type { DirectShippingDetailRESP } from './direct-shipping.response';

export const directShippingKeys = {
  all: ['delivery', 'direct-shipping'] as const,
  lists: () => [...directShippingKeys.all, 'list'] as const,
  list: (params: DirectShippingListREQ) => [...directShippingKeys.lists(), params] as const,
  detail: (id: number) => [...directShippingKeys.all, 'detail', id] as const,
};

const PHONE_SEARCH_PATTERN = /^\d{2,4}(-\d{3,4}){1,2}$/;

function normalizeSearchTerm(value?: string) {
  const term = value?.trim();
  if (!term) return undefined;
  return PHONE_SEARCH_PATTERN.test(term) ? term.replace(/-/g, '') : term;
}

export function buildDirectShippingListParams(search: DirectShippingListSearch): DirectShippingListREQ {
  return {
    search_term: normalizeSearchTerm(search.search_term),
    user_id: search.user_id,
    status: search.status,
    date_from: search.date_from,
    date_to: search.date_to,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}

export function useDirectShippingsQuery(params: DirectShippingListREQ) {
  return useQuery({
    queryKey: directShippingKeys.list(params),
    queryFn: () => getDirectShippingsAPI(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function directShippingDetailQueryOptions(id: number | null) {
  return queryOptions({
    queryKey: directShippingKeys.detail(id ?? 0),
    queryFn: () => getDirectShippingAPI(id as number),
    enabled: id !== null,
  });
}

export function useDirectShippingDetailQuery(id: number | null) {
  return useQuery(directShippingDetailQueryOptions(id));
}

export function useUpdateDirectShippingStatusMutation(
  options?: UseMutationOptions<DirectShippingDetailRESP, AxiosError<IBaseError>, DirectShippingStatusREQ>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateDirectShippingStatusAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: directShippingKeys.all });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
