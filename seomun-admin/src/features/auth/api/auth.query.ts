import type { IBaseError } from '@/types/api';
import { useMutation, type UseMutationOptions, type UseMutationResult } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { loginAPI } from './auth.api';
import type { LoginREQ } from './auth.request';
import type { LoginRESP } from './auth.response';

export const useLoginMutation = (
  options?: UseMutationOptions<LoginRESP, AxiosError<IBaseError>, LoginREQ>,
): UseMutationResult<LoginRESP, AxiosError<IBaseError>, LoginREQ> => {
  return useMutation({
    ...options,
    mutationFn: loginAPI,
  });
};
