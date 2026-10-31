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

import { FileType } from '@/enums';
import { uploadFile } from '@/lib/api/upload-file';
import type { IBaseError } from '@/types/api';
import { formatDateOnly } from '@/utils/format-date';

import { buildEquipmentListParams } from '../utils/equipment-list-params';
import type { EquipmentFormValues } from '../schemas/equipment-form.schema';
import type { EquipmentLogFormValues } from '../schemas/equipment-log-form.schema';
import type { EquipmentListSearch } from '../schemas/equipment-list-search.schema';
import type { EquipmentListREQ, EquipmentLogCreateREQ, EquipmentUpdateREQ } from './equipment.request';
import type { EquipmentCreateRESP, EquipmentListRESP, EquipmentLogRESP, EquipmentRESP, EquipmentUpdateRESP } from './equipment.response';
import {
  createEquipment,
  createEquipmentLog,
  deleteEquipment,
  deleteEquipmentLog,
  getEquipmentDetail,
  getEquipmentList,
  getEquipmentLogs,
  updateEquipment,
  updateEquipmentLog,
} from './equipment.service';

export const equipmentKeys = {
  all: ['orders', 'equipment'] as const,
  lists: () => [...equipmentKeys.all, 'list'] as const,
  list: (params: EquipmentListREQ) => [...equipmentKeys.lists(), params] as const,
  detail: (id: string) => [...equipmentKeys.all, 'detail', id] as const,
  logs: (id: string) => [...equipmentKeys.all, 'logs', id] as const,
};

type EquipmentListQueryKey = ReturnType<typeof equipmentKeys.list>;
type EquipmentDetailQueryKey = ReturnType<typeof equipmentKeys.detail>;
type EquipmentLogsQueryKey = ReturnType<typeof equipmentKeys.logs>;

// Uploads a freshly picked File via /admin/files (type EQUIPMENT); keeps an existing URL string as-is.
async function mapFormValuesToPayload(values: EquipmentFormValues): Promise<EquipmentUpdateREQ> {
  let image: string | null = null;
  if (values.image instanceof File) {
    image = (await uploadFile({ file: values.image, type: FileType.EQUIPMENTS })).url;
  } else if (typeof values.image === 'string') {
    image = values.image || null;
  }

  return {
    company_name: values.company_name.trim(),
    name: values.name.trim(),
    image,
    machine_type: values.machine_type ?? null,
    maintenance_company: values.maintenance_company?.trim() || null,
    manager_name: values.manager_name?.trim() || null,
    manager_phone: values.manager_phone?.trim() || null,
    introduced_at: values.introduced_at ? (formatDateOnly(values.introduced_at) ?? null) : null,
    work_process: values.work_process,
    status: values.status,
    notes: values.notes?.trim() || null,
  };
}

function mapLogFormValuesToPayload(values: EquipmentLogFormValues): EquipmentLogCreateREQ {
  return {
    log_date: formatDateOnly(values.log_date) ?? '',
    maintenance_details: values.maintenance_details.trim(),
    special_notes: values.special_notes?.trim() || null,
    cost_type: values.cost_type,
    manager: values.manager.trim(),
  };
}

export function equipmentListQueryOptions(params: EquipmentListREQ) {
  return queryOptions<EquipmentListRESP, AxiosError<IBaseError>, EquipmentListRESP, EquipmentListQueryKey>({
    queryKey: equipmentKeys.list(params),
    queryFn: () => getEquipmentList(params),
    staleTime: 30_000,
  });
}

export function equipmentListQueryOptionsBySearch(search: EquipmentListSearch) {
  return equipmentListQueryOptions(buildEquipmentListParams(search));
}

export function equipmentDetailQueryOptions(id: string) {
  return queryOptions<EquipmentRESP | null, AxiosError<IBaseError>, EquipmentRESP | null, EquipmentDetailQueryKey>({
    queryKey: equipmentKeys.detail(id),
    queryFn: () => getEquipmentDetail(id),
    staleTime: 30_000,
  });
}

export function equipmentLogsQueryOptions(id: string) {
  return queryOptions<EquipmentLogRESP[], AxiosError<IBaseError>, EquipmentLogRESP[], EquipmentLogsQueryKey>({
    queryKey: equipmentKeys.logs(id),
    queryFn: () => getEquipmentLogs(id),
    staleTime: 30_000,
  });
}

export function useEquipmentsQuery(
  params: EquipmentListREQ,
  options?: Omit<UseQueryOptions<EquipmentListRESP, AxiosError<IBaseError>, EquipmentListRESP, EquipmentListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<EquipmentListRESP, AxiosError<IBaseError>, EquipmentListRESP, EquipmentListQueryKey>({
    ...equipmentListQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}

export function useEquipmentDetailQuery(
  id: string,
  options?: Omit<
    UseQueryOptions<EquipmentRESP | null, AxiosError<IBaseError>, EquipmentRESP | null, EquipmentDetailQueryKey>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<EquipmentRESP | null, AxiosError<IBaseError>, EquipmentRESP | null, EquipmentDetailQueryKey>({
    ...equipmentDetailQueryOptions(id),
    ...options,
  });
}

export function useEquipmentLogsQuery(
  id: string,
  options?: Omit<UseQueryOptions<EquipmentLogRESP[], AxiosError<IBaseError>, EquipmentLogRESP[], EquipmentLogsQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<EquipmentLogRESP[], AxiosError<IBaseError>, EquipmentLogRESP[], EquipmentLogsQueryKey>({
    ...equipmentLogsQueryOptions(id),
    ...options,
  });
}

export function useCreateEquipmentMutation(options?: UseMutationOptions<EquipmentCreateRESP, AxiosError<IBaseError>, EquipmentFormValues>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: async (values) => createEquipment(await mapFormValuesToPayload(values)),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: equipmentKeys.lists() });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateEquipmentMutation(
  id: string,
  options?: UseMutationOptions<EquipmentUpdateRESP, AxiosError<IBaseError>, EquipmentFormValues>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: async (values) => updateEquipment(id, await mapFormValuesToPayload(values)),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: equipmentKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: equipmentKeys.lists() }),
      ]);
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useCreateEquipmentLogMutation(
  id: string,
  options?: UseMutationOptions<EquipmentLogRESP, AxiosError<IBaseError>, EquipmentLogFormValues>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (values) => createEquipmentLog(id, mapLogFormValuesToPayload(values)),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: equipmentKeys.logs(id) });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteEquipmentMutation(options?: UseMutationOptions<void, AxiosError<IBaseError>, string>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (id) => deleteEquipment(id),
    onSuccess: async (data, id, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: equipmentKeys.lists() });
      queryClient.removeQueries({ queryKey: equipmentKeys.detail(id) });
      await options?.onSuccess?.(data, id, onMutateResult, context);
    },
  });
}

export function useDeleteEquipmentLogMutation(id: string, options?: UseMutationOptions<void, AxiosError<IBaseError>, number>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: (logId) => deleteEquipmentLog(id, logId),
    onSuccess: async (data, logId, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: equipmentKeys.logs(id) });
      await options?.onSuccess?.(data, logId, onMutateResult, context);
    },
  });
}

export function useUpdateEquipmentLogMutation(
  id: string,
  options?: UseMutationOptions<EquipmentLogRESP, AxiosError<IBaseError>, { logId: number; values: EquipmentLogFormValues }>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: ({ logId, values }) => updateEquipmentLog(id, logId, mapLogFormValuesToPayload(values)),
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: equipmentKeys.logs(id) });
      await options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
