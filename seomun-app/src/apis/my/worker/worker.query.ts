import { useInfiniteQuery, useMutation, UseMutationOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import { WorkerCreateREQ, WorkerListREQ, WorkerSendCodeREQ, WorkerUpdateREQ, WorkerVerifyCode } from './worker.request';
import { WorkerApi } from './worker.api';
import { AxiosError } from 'axios';
import { ErrorRESP } from '@/types';

export const WORKER_QUERY_KEYS = {
  LIST: 'WORKER_LIST',
  MOBILE_LIST: 'WORKER_MOBILE_LIST',
  DETAIL: 'WORKER_DETAIL',
};

export const useWorkerListQuery = (params?: WorkerListREQ, enabled = true) =>
  useQuery({
    queryKey: [WORKER_QUERY_KEYS.LIST, params],
    queryFn: () => WorkerApi.list({ ...params, search_type: params?.search_type === 'all' ? undefined : params?.search_type }),
    select: (resp) => ({
      list: resp.data.workers,
      pagination: resp.pagination,
    }),
    enabled,
  });

export const useWorkerMobileListQuery = (params?: WorkerListREQ) =>
  useInfiniteQuery({
    queryKey: [WORKER_QUERY_KEYS.MOBILE_LIST, params],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      WorkerApi.list({
        ...params,
        search_type: params?.search_type === 'all' ? undefined : params?.search_type,
        page: pageParam,
      }),
    getNextPageParam: (resp) => {
      const pagination = resp.pagination;

      const currentPage = pagination.current_page || 1;
      const totalPage = pagination.total_page || 1;

      return currentPage < totalPage ? currentPage + 1 : undefined;
    },
  });

export const useWorkerDetailQuery = (id?: number) =>
  useQuery({
    queryKey: [WORKER_QUERY_KEYS.DETAIL, id],
    queryFn: () => WorkerApi.detail(id as number),
    select: (resp) => resp.data.worker,
    enabled: !!id,
  });

export const useWorkerCreateMutation = (options?: UseMutationOptions<unknown, AxiosError<ErrorRESP>, WorkerCreateREQ>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: WorkerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORKER_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [WORKER_QUERY_KEYS.MOBILE_LIST] });
    },
    ...options,
  });
};

export const useWorkerUpdateMutation = (options?: UseMutationOptions<unknown, AxiosError<ErrorRESP>, WorkerUpdateREQ>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: WorkerApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORKER_QUERY_KEYS.DETAIL] });
    },
    ...options,
  });
};

export const useWorkerDeleteMutation = (options?: UseMutationOptions<unknown, AxiosError<ErrorRESP>, number[]>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: WorkerApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORKER_QUERY_KEYS.LIST] });
      queryClient.invalidateQueries({ queryKey: [WORKER_QUERY_KEYS.MOBILE_LIST] });
    },
    ...options,
  });
};

export const useWorkerSendCodeMutation = (options?: UseMutationOptions<unknown, AxiosError<ErrorRESP>, WorkerSendCodeREQ>) => {
  return useMutation({
    mutationFn: WorkerApi.sendCode,
    ...options,
  });
};

export const useWorkerVerifyCodeMutation = (options?: UseMutationOptions<unknown, AxiosError<ErrorRESP>, WorkerVerifyCode>) => {
  return useMutation({
    mutationFn: WorkerApi.verifyCode,
    ...options,
  });
};
