import { BaseResponse, ErrorRESP } from '@/types';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { FileApi } from './file.api';
import { UploadFileREQ } from './file.request';
import { FileRespsonse } from './file.response';

export const useUploadFileMutation = (
  options?: UseMutationOptions<BaseResponse<FileRespsonse>, AxiosError<ErrorRESP>, UploadFileREQ>,
) =>
  useMutation({
    mutationFn: FileApi.upload,
    ...options,
  });
