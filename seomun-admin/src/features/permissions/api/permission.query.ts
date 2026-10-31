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

import type { IBaseError } from '@/types/api';

import type { PermissionCopyREQ, PermissionListREQ, PermissionMenuSettingsREQ } from './permission.request';
import type {
  MyMenuPermissionsRESP,
  PermissionDeleteRESP,
  PermissionDetailRESP,
  PermissionListRESP,
  PermissionMenuSettingsRESP,
  PermissionMenuSettingsUpdateRESP,
  PermissionRESP,
} from './permission.response';
import type { PermissionFormValues } from '../schemas';
import { PermissionAction } from '../enums';
import {
  copyPermissionAPI,
  createPermissionAPI,
  deletePermissionAPI,
  getMyMenuPermissionsAPI,
  getPermissionAPI,
  getPermissionMenuSettingsAPI,
  getPermissionsAPI,
  updatePermissionAPI,
  updatePermissionMenuSettingsAPI,
} from './permission.api';
import { mapPermissionFormToCreateREQ, mapPermissionFormToUpdateREQ } from './permission.service';

export const permissionKeys = {
  all: ['permissions'] as const,
  me: () => [...permissionKeys.all, 'me'] as const,
  lists: () => [...permissionKeys.all, 'list'] as const,
  list: (params: PermissionListREQ) => [...permissionKeys.lists(), params] as const,
  detail: (permissionId: number) => [...permissionKeys.all, 'detail', permissionId] as const,
  menuSettings: (permissionId: number) => [...permissionKeys.all, 'menu-settings', permissionId] as const,
};

type MyMenuPermissionsQueryKey = ReturnType<typeof permissionKeys.me>;

export function myMenuPermissionsQueryOptions() {
  return queryOptions<MyMenuPermissionsRESP, AxiosError<IBaseError>, Set<string>, MyMenuPermissionsQueryKey>({
    queryKey: permissionKeys.me(),
    queryFn: getMyMenuPermissionsAPI,
    staleTime: 5 * 60_000,
    select: (response) =>
      new Set((response.data.permissions ?? []).filter((item) => item.actions.includes(PermissionAction.VIEW)).map((item) => String(item.menu))),
  });
}

/** Set of menu keys the current admin can access (has the `view` action), or `null` while loading. */
export function useAllowedMenuKeys() {
  const { data, isLoading } = useQuery(myMenuPermissionsQueryOptions());
  return { allowedKeys: data ?? null, isLoading };
}

type PermissionListQueryKey = ReturnType<typeof permissionKeys.list>;
type PermissionDetailQueryKey = ReturnType<typeof permissionKeys.detail>;
type PermissionMenuSettingsQueryKey = ReturnType<typeof permissionKeys.menuSettings>;

export function permissionListQueryOptions(params: PermissionListREQ) {
  return queryOptions<PermissionListRESP, AxiosError<IBaseError>, PermissionListRESP, PermissionListQueryKey>({
    queryKey: permissionKeys.list(params),
    queryFn: () => getPermissionsAPI(params),
    staleTime: 30_000,
  });
}

export function usePermissionsQuery(
  params: PermissionListREQ,
  options?: Omit<UseQueryOptions<PermissionListRESP, AxiosError<IBaseError>, PermissionListRESP, PermissionListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<PermissionListRESP, AxiosError<IBaseError>, PermissionListRESP, PermissionListQueryKey>({
    ...permissionListQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}

export function permissionDetailQueryOptions(permissionId: number) {
  return queryOptions<PermissionRESP | null, AxiosError<IBaseError>, PermissionRESP | null, PermissionDetailQueryKey>({
    queryKey: permissionKeys.detail(permissionId),
    queryFn: async () => {
      const response = await getPermissionAPI(permissionId);
      return response.data.permission;
    },
    staleTime: 30_000,
  });
}

export function usePermissionDetailQuery(
  permissionId: number,
  options?: Omit<
    UseQueryOptions<PermissionRESP | null, AxiosError<IBaseError>, PermissionRESP | null, PermissionDetailQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<PermissionRESP | null, AxiosError<IBaseError>, PermissionRESP | null, PermissionDetailQueryKey>({
    ...permissionDetailQueryOptions(permissionId),
    ...options,
  });
}

export function permissionMenuSettingsQueryOptions(permissionId: number) {
  return queryOptions<PermissionMenuSettingsRESP, AxiosError<IBaseError>, PermissionMenuSettingsRESP, PermissionMenuSettingsQueryKey>({
    queryKey: permissionKeys.menuSettings(permissionId),
    queryFn: () => getPermissionMenuSettingsAPI(permissionId),
    staleTime: 30_000,
  });
}

export function usePermissionMenuSettingsQuery(
  permissionId: number,
  options?: Omit<
    UseQueryOptions<PermissionMenuSettingsRESP, AxiosError<IBaseError>, PermissionMenuSettingsRESP, PermissionMenuSettingsQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<PermissionMenuSettingsRESP, AxiosError<IBaseError>, PermissionMenuSettingsRESP, PermissionMenuSettingsQueryKey>({
    ...permissionMenuSettingsQueryOptions(permissionId),
    ...options,
  });
}

export function useCreatePermissionMutation(options?: UseMutationOptions<PermissionDetailRESP, AxiosError<IBaseError>, PermissionFormValues>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (values) => createPermissionAPI(mapPermissionFormToCreateREQ(values)),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdatePermissionMutation(
  permissionId: number,
  options?: UseMutationOptions<PermissionDetailRESP, AxiosError<IBaseError>, PermissionFormValues>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (values) => updatePermissionAPI(permissionId, mapPermissionFormToUpdateREQ(values)),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: permissionKeys.detail(permissionId) });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeletePermissionMutation(options?: UseMutationOptions<PermissionDeleteRESP, AxiosError<IBaseError>, number>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deletePermissionAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
      queryClient.removeQueries({ queryKey: permissionKeys.detail(variables) });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useCopyPermissionMutation(
  options?: UseMutationOptions<PermissionDetailRESP, AxiosError<IBaseError>, { id: number; data: PermissionCopyREQ }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ id, data }) => copyPermissionAPI(id, data),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdatePermissionMenuSettingsMutation(
  permissionId: number,
  options?: UseMutationOptions<PermissionMenuSettingsUpdateRESP, AxiosError<IBaseError>, PermissionMenuSettingsREQ>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (data) => updatePermissionMenuSettingsAPI(permissionId, data),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: permissionKeys.all });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
