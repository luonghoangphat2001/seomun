import { queryOptions, useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { permissionKeys } from '@/features/permissions';
import type { IBaseError } from '@/types/api';

import { AdministratorBulkAction, type AdministratorStatus } from '../enums';
import type { AdministratorFormValues, AdministratorListSearch, AdministratorUpdatePasswordFormValues } from '../schemas';
import { buildAdministratorListParams } from '../utils/administrator-list-params';
import type { AdministratorListREQ } from './administrator.request';
import type {
  AdministratorBulkRESP,
  AdministratorDeleteRESP,
  AdministratorDetailRESP,
  AdministratorListRESP,
  AdministratorRESP,
  AdministratorUpdatePasswordRESP,
} from './administrator.response';
import {
  bulkDeleteAdministratorsAPI,
  bulkUpdateAdministratorPermissionsAPI,
  bulkUpdateAdministratorStatusAPI,
  createAdministratorAPI,
  deleteAdministratorAPI,
  getAdministratorDetailAPI,
  getAdministratorListAPI,
  updateAdministratorAPI,
  updateAdministratorPasswordAPI,
} from './administrator.api';
import { mapAdministratorFormToCreateREQ, mapAdministratorFormToUpdateREQ } from './administrator.service';

export const administratorKeys = {
  all: ['administrators'] as const,
  lists: () => [...administratorKeys.all, 'list'] as const,
  list: (params: AdministratorListREQ) => [...administratorKeys.lists(), params] as const,
  detail: (administratorId: string) => [...administratorKeys.all, 'detail', administratorId] as const,
};

type AdministratorListQueryKey = ReturnType<typeof administratorKeys.list>;
type AdministratorDetailQueryKey = ReturnType<typeof administratorKeys.detail>;

export function administratorListQueryOptions(params: AdministratorListREQ) {
  return queryOptions<AdministratorListRESP, AxiosError<IBaseError>, AdministratorListRESP, AdministratorListQueryKey>({
    queryKey: administratorKeys.list(params),
    queryFn: () => getAdministratorListAPI(params),
    staleTime: 30_000,
  });
}

export function administratorListQueryOptionsBySearch(search: AdministratorListSearch) {
  return administratorListQueryOptions(buildAdministratorListParams(search));
}

export function useAdministratorsQuery(
  params: AdministratorListREQ,
  options?: Omit<
    UseQueryOptions<AdministratorListRESP, AxiosError<IBaseError>, AdministratorListRESP, AdministratorListQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<AdministratorListRESP, AxiosError<IBaseError>, AdministratorListRESP, AdministratorListQueryKey>({
    ...administratorListQueryOptions(params),
    ...options,
    // placeholderData: keepPreviousData,
  });
}

export function administratorDetailQueryOptions(administratorId: string) {
  return queryOptions<AdministratorRESP | null, AxiosError<IBaseError>, AdministratorRESP | null, AdministratorDetailQueryKey>({
    queryKey: administratorKeys.detail(administratorId),
    queryFn: async () => {
      const response = await getAdministratorDetailAPI(administratorId);
      return response.data.user;
    },
    staleTime: 30_000,
  });
}

export function useAdministratorDetailQuery(
  administratorId: string,
  options?: Omit<
    UseQueryOptions<AdministratorRESP | null, AxiosError<IBaseError>, AdministratorRESP | null, AdministratorDetailQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<AdministratorRESP | null, AxiosError<IBaseError>, AdministratorRESP | null, AdministratorDetailQueryKey>({
    ...administratorDetailQueryOptions(administratorId),
    ...options,
  });
}

export function useCreateAdministratorMutation(
  options?: UseMutationOptions<AdministratorDetailRESP, AxiosError<IBaseError>, AdministratorFormValues>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (values) => createAdministratorAPI(mapAdministratorFormToCreateREQ(values)),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({
        queryKey: administratorKeys.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: permissionKeys.lists(),
      });

      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateAdministratorMutation(
  administratorId: string,
  options?: UseMutationOptions<AdministratorDetailRESP, AxiosError<IBaseError>, AdministratorFormValues>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (values) => updateAdministratorAPI(administratorId, mapAdministratorFormToUpdateREQ(values)),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({
        queryKey: administratorKeys.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: administratorKeys.detail(administratorId),
      });
      await queryClient.invalidateQueries({
        queryKey: permissionKeys.lists(),
      });

      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteAdministratorMutation(options?: UseMutationOptions<AdministratorDeleteRESP, AxiosError<IBaseError>, number>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteAdministratorAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({
        queryKey: administratorKeys.lists(),
      });
      queryClient.removeQueries({
        queryKey: administratorKeys.detail(String(variables)),
      });
      await queryClient.invalidateQueries({
        queryKey: permissionKeys.lists(),
      });

      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export type AdministratorBulkActionVariables = {
  action: AdministratorBulkAction;
  user_ids: number[];
  // status value or permission group id; unused for delete
  value?: string;
};

export function useAdministratorBulkActionMutation(
  options?: UseMutationOptions<AdministratorBulkRESP, AxiosError<IBaseError>, AdministratorBulkActionVariables>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ action, user_ids, value }) => {
      if (action === AdministratorBulkAction.STATUS) {
        return bulkUpdateAdministratorStatusAPI({ user_ids, status: value as AdministratorStatus });
      }

      if (action === AdministratorBulkAction.PERMISSION) {
        return bulkUpdateAdministratorPermissionsAPI({ user_ids, admin_permission_ids: [Number(value)] });
      }

      return bulkDeleteAdministratorsAPI({ user_ids });
    },
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({
        queryKey: administratorKeys.all,
      });
      await queryClient.invalidateQueries({
        queryKey: permissionKeys.lists(),
      });

      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateAdministratorPasswordMutation(
  administratorId: string,
  options?: UseMutationOptions<AdministratorUpdatePasswordRESP, AxiosError<IBaseError>, AdministratorUpdatePasswordFormValues>,
) {
  return useMutation({
    ...options,
    mutationFn: (values) => updateAdministratorPasswordAPI(administratorId, values),
  });
}
