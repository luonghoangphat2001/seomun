import { keepPreviousData, useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

import { createOutsourcingAPI, deleteOutsourcingAPI, updateOutsourcingAPI } from './outsourcing.api';
import type { OutsourcingCreateREQ, OutsourcingListREQ, OutsourcingUpdateREQ } from './outsourcing.request';
import type {
  CreateOutsourcingRESP,
  DeleteOutsourcingRESP,
  OutsourcingDetailRESP,
  OutsourcingListRESP,
  UpdateOutsourcingRESP,
} from './outsourcing.response';
import { getOutsourcingDetailService, getOutsourcingListService } from './outsourcing.service';

export const outsourcingKeys = {
  all: ['outsourcing'] as const,
  lists: () => [...outsourcingKeys.all, 'list'] as const,
  list: (params: OutsourcingListREQ) => [...outsourcingKeys.lists(), params] as const,
  details: () => [...outsourcingKeys.all, 'detail'] as const,
  detail: (outsourcingId: number) => [...outsourcingKeys.all, 'detail', outsourcingId] as const,
};

export const useOutsourcingQuery = (
  params: OutsourcingListREQ,
  options?: Omit<UseQueryOptions<OutsourcingListRESP, AxiosError<IBaseError>>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<OutsourcingListRESP, AxiosError<IBaseError>>({
    ...options,
    queryKey: outsourcingKeys.list(params),
    queryFn: () => getOutsourcingListService(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};

export const outsourcingDetailQueryOptions = (outsourcingId: number) => ({
  queryKey: outsourcingKeys.detail(outsourcingId),
  queryFn: () => getOutsourcingDetailService(outsourcingId),
  staleTime: 30_000,
});

export const useOutsourcingDetailQuery = (
  outsourcingId: number,
  options?: Omit<UseQueryOptions<OutsourcingDetailRESP, AxiosError<IBaseError>>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<OutsourcingDetailRESP, AxiosError<IBaseError>>({
    ...outsourcingDetailQueryOptions(outsourcingId),
    ...options,
  });
};

export function useCreateOutsourcingMutation(options?: UseMutationOptions<CreateOutsourcingRESP, AxiosError<IBaseError>, OutsourcingCreateREQ>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createOutsourcingAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: outsourcingKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateOutsourcingMutation(
  outsourcingId: number,
  options?: UseMutationOptions<UpdateOutsourcingRESP, AxiosError<IBaseError>, OutsourcingUpdateREQ>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (payload: OutsourcingUpdateREQ) => updateOutsourcingAPI(outsourcingId, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: outsourcingKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: outsourcingKeys.detail(outsourcingId) });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteOutsourcingMutation(options?: UseMutationOptions<DeleteOutsourcingRESP, AxiosError<IBaseError>, number>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteOutsourcingAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: outsourcingKeys.lists() });
      await queryClient.removeQueries({ queryKey: outsourcingKeys.detail(variables) });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
