import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { BaseResponse, IBaseError } from '@/types/api';

import {
  createUserLimitAPI,
  deleteUserLimitAPI,
  getUserLimitDetailAPI,
  getUserLimitsAPI,
  getUserListAPI,
  updateUserLimitAPI,
} from './post-payment-limit.api';
import type { UserLimitCreateREQ, UserLimitListREQ, UserLimitUpdateREQ, UserListREQ } from './post-payment-limit.request';
import type { UserLimitDetailWrapRESP, UserLimitListRESP, UserLimitRESP, UserListRESP } from './post-payment-limit.response';

export const userLimitKeys = {
  all: ['user-limits'] as const,
  lists: () => [...userLimitKeys.all, 'list'] as const,
  list: (params: UserLimitListREQ) => [...userLimitKeys.lists(), params] as const,
  detail: (id: number) => [...userLimitKeys.all, 'detail', id] as const,
};

type UserLimitListQueryKey = ReturnType<typeof userLimitKeys.list>;
type UserLimitDetailQueryKey = ReturnType<typeof userLimitKeys.detail>;

// ─── Query Options ──────────────────────────────────────────────────────────

export function userLimitListQueryOptions(params: UserLimitListREQ) {
  return queryOptions<UserLimitListRESP, AxiosError<IBaseError>, UserLimitListRESP, UserLimitListQueryKey>({
    queryKey: userLimitKeys.list(params),
    queryFn: () => getUserLimitsAPI(params),
    staleTime: 30_000,
  });
}

export function userLimitDetailQueryOptions(id: number) {
  return queryOptions<UserLimitDetailWrapRESP, AxiosError<IBaseError>, UserLimitDetailWrapRESP, UserLimitDetailQueryKey>({
    queryKey: userLimitKeys.detail(id),
    queryFn: () => getUserLimitDetailAPI(id),
    staleTime: 30_000,
    enabled: id > 0,
  });
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useUserLimitListQuery(
  params: UserLimitListREQ,
  options?: Omit<UseQueryOptions<UserLimitListRESP, AxiosError<IBaseError>, UserLimitListRESP, UserLimitListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<UserLimitListRESP, AxiosError<IBaseError>, UserLimitListRESP, UserLimitListQueryKey>({
    ...userLimitListQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}

export function useUserLimitDetailQuery(
  id: number,
  options?: Omit<
    UseQueryOptions<UserLimitDetailWrapRESP, AxiosError<IBaseError>, UserLimitDetailWrapRESP, UserLimitDetailQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<UserLimitDetailWrapRESP, AxiosError<IBaseError>, UserLimitDetailWrapRESP, UserLimitDetailQueryKey>({
    ...userLimitDetailQueryOptions(id),
    ...options,
  });
}

export function useCreateUserLimitMutation(options?: UseMutationOptions<BaseResponse<UserLimitRESP>, AxiosError<IBaseError>, UserLimitCreateREQ>) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: createUserLimitAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: userLimitKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateUserLimitMutation(
  id: number,
  options?: UseMutationOptions<BaseResponse<UserLimitRESP>, AxiosError<IBaseError>, UserLimitUpdateREQ>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (payload) => updateUserLimitAPI(id, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: userLimitKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: userLimitKeys.detail(id) });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteUserLimitMutation(options?: UseMutationOptions<BaseResponse<string>, AxiosError<IBaseError>, number>) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (id) => deleteUserLimitAPI(id),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: userLimitKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

// ─── User List ────────────────────────────────────────────────────────────────

export const userListKeys = {
  all: ['user-list'] as const,
  lists: () => [...userListKeys.all, 'list'] as const,
  list: (params: UserListREQ) => [...userListKeys.lists(), params] as const,
};

type UserListQueryKey = ReturnType<typeof userListKeys.list>;

export function userListQueryOptions(params: UserListREQ) {
  return queryOptions<UserListRESP, AxiosError<IBaseError>, UserListRESP, UserListQueryKey>({
    queryKey: userListKeys.list(params),
    queryFn: () => getUserListAPI(params),
    staleTime: 30_000,
  });
}

export function useUserListQuery(
  params: UserListREQ,
  options?: Omit<UseQueryOptions<UserListRESP, AxiosError<IBaseError>, UserListRESP, UserListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<UserListRESP, AxiosError<IBaseError>, UserListRESP, UserListQueryKey>({
    ...userListQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}
