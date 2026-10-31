import { ErrorRESP } from '@/types';
import { useInfiniteQuery, useMutation, UseMutationOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { SavedOptionApi } from './saved-options.api';
import { SavedOptionCreateREQ, SavedOptionListREQ } from './saved-options.request';

export const SAVED_OPTION_QUERY_KEYS = {
  LIST: 'SAVED_OPTION_LIST',
  MOBILE_LIST: 'SAVED_OPTION_MOBILE_LIST',
};

export const useSavedOptionListQuery = (params?: SavedOptionListREQ, enabled = false) =>
  useQuery({
    queryKey: [SAVED_OPTION_QUERY_KEYS.LIST, params],
    queryFn: () => SavedOptionApi.list(params),
    select: (resp) => ({
      list: resp.data.saved_options,
      pagination: resp.pagination,
    }),
    enabled,
  });

export const useSavedOptionMobileListQuery = (params?: SavedOptionListREQ) =>
  useInfiniteQuery({
    queryKey: [SAVED_OPTION_QUERY_KEYS.MOBILE_LIST, params],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => SavedOptionApi.list({ ...params, page: pageParam }),
    getNextPageParam: (resp) => {
      const pagination = resp.pagination;

      const currentPage = pagination.current_page || 1;
      const totalPage = pagination.total_page || 1;

      return currentPage < totalPage ? currentPage + 1 : undefined;
    },
  });

export const useSavedOptionCreateMutation = (
  options?: UseMutationOptions<unknown, AxiosError<ErrorRESP>, SavedOptionCreateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: SavedOptionApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SAVED_OPTION_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [SAVED_OPTION_QUERY_KEYS.MOBILE_LIST] });
    },
    ...options,
  });
};

export const useSavedOptionDeleteMutation = (options?: UseMutationOptions<unknown, AxiosError<ErrorRESP>, number>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: SavedOptionApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SAVED_OPTION_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [SAVED_OPTION_QUERY_KEYS.MOBILE_LIST] });
    },
    ...options,
  });
};
