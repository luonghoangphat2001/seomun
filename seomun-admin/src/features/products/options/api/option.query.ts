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

import type {
  ErpOptionCreateREQ,
  ErpOptionGroupListREQ,
  ErpOptionListREQ,
  ErpOptionUpdateREQ,
  PaperCreateREQ,
  PaperListREQ,
  PaperUpdateREQ,
  SizeOptionCreateREQ,
  SizeOptionListREQ,
  SizeOptionUpdateREQ,
} from './option.request';
import type {
  ErpOptionActionRESP,
  ErpOptionDetailRESP,
  ErpOptionGroupActionRESP,
  ErpOptionGroupDetailRESP,
  ErpOptionGroupListRESP,
  ErpOptionListRESP,
  PaperDetailRESP,
  PaperListRESP,
  SizeOptionDetailRESP,
  SizeOptionListRESP,
} from './option.response';
import {
  createErpOptionAPI,
  createPaperAPI,
  createSizeOptionAPI,
  deleteErpOptionAPI,
  deleteErpOptionGroupAPI,
  deletePaperAPI,
  getAdminErpOptionDetailAPI,
  getAdminErpOptionGroupDetailAPI,
  getAdminErpOptionGroupsAPI,
  getAdminErpOptionsAPI,
  getPapersAPI,
  getSizeOptionDetailAPI,
  getSizeOptionsAPI,
  updateErpOptionAPI,
  updatePaperAPI,
  updateSizeOptionAPI,
} from './option.api';

export const optionKeys = {
  all: ['options'] as const,
  groupLists: () => [...optionKeys.all, 'erp-option-groups'] as const,
  groupList: (params: ErpOptionGroupListREQ) => [...optionKeys.groupLists(), params] as const,
  groupDetail: (id: number) => [...optionKeys.all, 'erp-option-group', id] as const,
  optionLists: () => [...optionKeys.all, 'erp-options'] as const,
  optionList: (params: ErpOptionListREQ) => [...optionKeys.optionLists(), params] as const,
  optionDetail: (id: number) => [...optionKeys.all, 'erp-option', id] as const,
  sizeLists: () => [...optionKeys.all, 'size-options'] as const,
  sizeList: (params: SizeOptionListREQ) => [...optionKeys.sizeLists(), params] as const,
  sizeDetail: (id: number) => [...optionKeys.all, 'size-option', id] as const,
  paperLists: () => [...optionKeys.all, 'papers'] as const,
  paperList: (params: PaperListREQ) => [...optionKeys.paperLists(), params] as const,
};

type ErpOptionGroupListQueryKey = ReturnType<typeof optionKeys.groupList>;
type ErpOptionGroupDetailQueryKey = ReturnType<typeof optionKeys.groupDetail>;
type ErpOptionListQueryKey = ReturnType<typeof optionKeys.optionList>;
type ErpOptionDetailQueryKey = ReturnType<typeof optionKeys.optionDetail>;
type SizeOptionListQueryKey = ReturnType<typeof optionKeys.sizeList>;
type SizeOptionDetailQueryKey = ReturnType<typeof optionKeys.sizeDetail>;
type PaperListQueryKey = ReturnType<typeof optionKeys.paperList>;

export function erpOptionGroupListQueryOptions(params: ErpOptionGroupListREQ) {
  return queryOptions<ErpOptionGroupListRESP, AxiosError<IBaseError>, ErpOptionGroupListRESP, ErpOptionGroupListQueryKey>({
    queryKey: optionKeys.groupList(params),
    queryFn: () => getAdminErpOptionGroupsAPI(params),
    staleTime: 30_000,
  });
}

export function erpOptionListQueryOptions(params: ErpOptionListREQ) {
  return queryOptions<ErpOptionListRESP, AxiosError<IBaseError>, ErpOptionListRESP, ErpOptionListQueryKey>({
    queryKey: optionKeys.optionList(params),
    queryFn: () => getAdminErpOptionsAPI(params),
    staleTime: 30_000,
  });
}

export function erpOptionGroupDetailQueryOptions(id: number) {
  return queryOptions<ErpOptionGroupDetailRESP, AxiosError<IBaseError>, ErpOptionGroupDetailRESP, ErpOptionGroupDetailQueryKey>({
    queryKey: optionKeys.groupDetail(id),
    queryFn: () => getAdminErpOptionGroupDetailAPI(id),
    staleTime: 30_000,
    enabled: id > 0,
  });
}

export function useErpOptionGroupDetailQuery(
  id: number,
  options?: Omit<
    UseQueryOptions<ErpOptionGroupDetailRESP, AxiosError<IBaseError>, ErpOptionGroupDetailRESP, ErpOptionGroupDetailQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({ ...erpOptionGroupDetailQueryOptions(id), ...options });
}

export function erpOptionDetailQueryOptions(id: number) {
  return queryOptions<ErpOptionDetailRESP, AxiosError<IBaseError>, ErpOptionDetailRESP, ErpOptionDetailQueryKey>({
    queryKey: optionKeys.optionDetail(id),
    queryFn: () => getAdminErpOptionDetailAPI(id),
    staleTime: 30_000,
    enabled: id > 0,
  });
}

export function useErpOptionDetailQuery(
  id: number,
  options?: Omit<UseQueryOptions<ErpOptionDetailRESP, AxiosError<IBaseError>, ErpOptionDetailRESP, ErpOptionDetailQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({ ...erpOptionDetailQueryOptions(id), ...options });
}

export function useDeleteErpOptionGroupMutation(options?: UseMutationOptions<ErpOptionGroupActionRESP, AxiosError<IBaseError>, number>) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (id) => deleteErpOptionGroupAPI(id),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: optionKeys.groupLists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useCreateErpOptionMutation(
  options?: UseMutationOptions<ErpOptionActionRESP, AxiosError<IBaseError>, ErpOptionCreateREQ & { erp_option_group_id: number }>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: createErpOptionAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: optionKeys.optionLists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateErpOptionMutation(
  id: number,
  options?: UseMutationOptions<ErpOptionActionRESP, AxiosError<IBaseError>, ErpOptionUpdateREQ>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (payload) => updateErpOptionAPI(id, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: optionKeys.optionLists() });
      await queryClient.invalidateQueries({ queryKey: optionKeys.optionDetail(id) });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteErpOptionMutation(options?: UseMutationOptions<ErpOptionActionRESP, AxiosError<IBaseError>, number>) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (id) => deleteErpOptionAPI(id),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: optionKeys.optionLists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useAdminErpOptionGroupsQuery(
  params: ErpOptionGroupListREQ,
  options?: Omit<
    UseQueryOptions<ErpOptionGroupListRESP, AxiosError<IBaseError>, ErpOptionGroupListRESP, ErpOptionGroupListQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<ErpOptionGroupListRESP, AxiosError<IBaseError>, ErpOptionGroupListRESP, ErpOptionGroupListQueryKey>({
    ...erpOptionGroupListQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}

export function useAdminErpOptionsQuery(
  params: ErpOptionListREQ,
  options?: Omit<UseQueryOptions<ErpOptionListRESP, AxiosError<IBaseError>, ErpOptionListRESP, ErpOptionListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<ErpOptionListRESP, AxiosError<IBaseError>, ErpOptionListRESP, ErpOptionListQueryKey>({
    ...erpOptionListQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}

export function useSizeOptionsQuery(
  params: SizeOptionListREQ,
  options?: Omit<UseQueryOptions<SizeOptionListRESP, AxiosError<IBaseError>, SizeOptionListRESP, SizeOptionListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<SizeOptionListRESP, AxiosError<IBaseError>, SizeOptionListRESP, SizeOptionListQueryKey>({
    queryKey: optionKeys.sizeList(params),
    queryFn: () => getSizeOptionsAPI(params),
    staleTime: 30_000,
    ...options,
    placeholderData: keepPreviousData,
  });
}

export function sizeOptionsQueryOptions(params: SizeOptionListREQ) {
  return queryOptions<SizeOptionListRESP, AxiosError<IBaseError>, SizeOptionListRESP, SizeOptionListQueryKey>({
    queryKey: optionKeys.sizeList(params),
    queryFn: () => getSizeOptionsAPI(params),
    staleTime: 30_000,
  });
}

export function sizeOptionDetailQueryOptions(id: number) {
  return queryOptions<SizeOptionDetailRESP, AxiosError<IBaseError>, SizeOptionDetailRESP, SizeOptionDetailQueryKey>({
    queryKey: optionKeys.sizeDetail(id),
    queryFn: () => getSizeOptionDetailAPI(id),
    staleTime: 30_000,
  });
}

export function useSizeOptionDetailQuery(
  id: number | null,
  options?: Omit<
    UseQueryOptions<SizeOptionDetailRESP, AxiosError<IBaseError>, SizeOptionDetailRESP, SizeOptionDetailQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<SizeOptionDetailRESP, AxiosError<IBaseError>, SizeOptionDetailRESP, SizeOptionDetailQueryKey>({
    ...sizeOptionDetailQueryOptions(id ?? 0),
    enabled: id !== null && id > 0,
    ...options,
  });
}

export function useCreateSizeOptionMutation(options?: UseMutationOptions<SizeOptionDetailRESP, AxiosError<IBaseError>, SizeOptionCreateREQ>) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: createSizeOptionAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: optionKeys.sizeLists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateSizeOptionMutation(
  id: number,
  options?: UseMutationOptions<SizeOptionDetailRESP, AxiosError<IBaseError>, SizeOptionUpdateREQ>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (payload) => updateSizeOptionAPI(id, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: optionKeys.sizeLists() });
      await queryClient.invalidateQueries({ queryKey: optionKeys.sizeDetail(id) });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function usePapersQuery(
  params: PaperListREQ,
  options?: Omit<UseQueryOptions<PaperListRESP, AxiosError<IBaseError>, PaperListRESP, PaperListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<PaperListRESP, AxiosError<IBaseError>, PaperListRESP, PaperListQueryKey>({
    queryKey: optionKeys.paperList(params),
    queryFn: () => getPapersAPI(params),
    // staleTime: 30_000,
    ...options,
    // placeholderData: keepPreviousData,
  });
}

export function useCreatePaperMutation(options?: UseMutationOptions<PaperDetailRESP, AxiosError<IBaseError>, PaperCreateREQ>) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: createPaperAPI,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: optionKeys.paperLists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdatePaperMutation(id: number, options?: UseMutationOptions<PaperDetailRESP, AxiosError<IBaseError>, PaperUpdateREQ>) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (payload) => updatePaperAPI(id, payload),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: optionKeys.paperLists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeletePaperMutation(options?: UseMutationOptions<PaperDetailRESP, AxiosError<IBaseError>, number>) {
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: (id) => deletePaperAPI(id),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: optionKeys.paperLists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useErpOptionValuesByGroupCodeQuery(groupCode: string) {
  const query = useAdminErpOptionsQuery({ group_code: groupCode, page: 1, per_page: 100 }, { enabled: !!groupCode });

  return {
    data: query.data?.data.erp_options ?? [],
    isLoading: query.isLoading,
  };
}
