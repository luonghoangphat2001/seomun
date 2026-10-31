import { BaseResponse, ErrorRESP } from '@/types';
import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ProfileApi } from './profile.api';
import { ProfileRESP, UploadBusinessRegistrationFileRESP } from './profile.response';
import { SwitchToBusinessREQ, UpdatePasswordREQ, UpdateProfileREQ, UploadBusinessRegistrationFileREQ } from './profile.request';

export const PROFILE_QUERY_KEYS = {
  GET: 'MY_PROFILE',
};

export const useMyProfileQuery = (
  options?: Omit<UseQueryOptions<BaseResponse<ProfileRESP>, AxiosError<ErrorRESP>, ProfileRESP>, 'queryKey' | 'queryFn'>,
) =>
  useQuery({
    queryKey: [PROFILE_QUERY_KEYS.GET],
    queryFn: ProfileApi.get,
    select: (resp) => resp.data,
    ...options,
  });

export const useProfileUpdateMutation = (options?: UseMutationOptions<unknown, AxiosError<ErrorRESP>, UpdateProfileREQ>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ProfileApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEYS.GET] });
    },
    ...options,
  });
};

export const useProfilePasswordUpdateMutation = (
  options?: UseMutationOptions<unknown, AxiosError<ErrorRESP>, UpdatePasswordREQ>,
) => {
  return useMutation({
    mutationFn: ProfileApi.updatePassword,
    ...options,
  });
};

export const useUploadBusinessRegistrationFileMutation = (
  options?: UseMutationOptions<
    BaseResponse<UploadBusinessRegistrationFileRESP>,
    AxiosError<ErrorRESP>,
    UploadBusinessRegistrationFileREQ
  >,
) =>
  useMutation({
    mutationFn: ProfileApi.uploadBusinessRegistrationFile,
    ...options,
  });

export const useSwitchToAccountBusinessMutation = (
  options?: UseMutationOptions<unknown, AxiosError<ErrorRESP>, SwitchToBusinessREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ProfileApi.switchToAccountBusiness,
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEYS.GET] });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};
