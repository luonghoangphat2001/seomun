import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { BaseResponse, IBaseError } from '@/types/api';

import {
  deleteCompanyStampAPI,
  getCompanySettingsAPI,
  getCompanyStampAPI,
  updateCompanySettingsAPI,
  uploadCompanyStampAPI,
} from './company-settings.api';
import type { UpdateCompanySettingsREQ } from './company-settings.request';
import type { CompanySettingsRESP, CompanyStamp } from './company-settings.response';

export const companySettingsKeys = {
  all: ['settings', 'company'] as const,
  detail: () => [...companySettingsKeys.all, 'detail'] as const,
  stamp: () => [...companySettingsKeys.all, 'stamp'] as const,
};

export function useCompanySettingsQuery() {
  return useQuery<CompanySettingsRESP, AxiosError<IBaseError>>({
    queryKey: companySettingsKeys.detail(),
    queryFn: getCompanySettingsAPI,
    staleTime: 30_000,
  });
}

export function useCompanyStampQuery(stamp: CompanyStamp | undefined) {
  return useQuery<Blob, AxiosError<IBaseError>>({
    queryKey: companySettingsKeys.stamp(),
    queryFn: getCompanyStampAPI,
    enabled: Boolean(stamp?.is_configured),
    staleTime: 30_000,
  });
}

export function useUpdateCompanySettingsMutation(
  options?: UseMutationOptions<CompanySettingsRESP, AxiosError<IBaseError>, UpdateCompanySettingsREQ>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateCompanySettingsAPI,
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: companySettingsKeys.detail() });
      await options?.onSuccess?.(...args);
    },
  });
}

// A stamp upload/delete changes both the settings (stamp info) and the image, so refresh everything (shared key prefix).
function useInvalidateCompanySettings() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: companySettingsKeys.all });
}

export function useUploadCompanyStampMutation(options?: UseMutationOptions<BaseResponse<unknown>, AxiosError<IBaseError>, File>) {
  const invalidate = useInvalidateCompanySettings();

  return useMutation({
    ...options,
    mutationFn: uploadCompanyStampAPI,
    onSuccess: async (...args) => {
      await invalidate();
      await options?.onSuccess?.(...args);
    },
  });
}

export function useDeleteCompanyStampMutation(options?: UseMutationOptions<BaseResponse<unknown>, AxiosError<IBaseError>, void>) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteCompanyStampAPI,
    onSuccess: async (...args) => {
      // Mark the stamp as gone right away so the image query turns off instead of refetching a deleted image (404).
      queryClient.setQueryData<CompanySettingsRESP>(companySettingsKeys.detail(), (old) =>
        old ? { ...old, data: { ...old.data, stamp: { is_configured: false, original_name: null, preview_url: null } } } : old,
      );
      await queryClient.invalidateQueries({ queryKey: companySettingsKeys.detail() });
      await options?.onSuccess?.(...args);
    },
  });
}
