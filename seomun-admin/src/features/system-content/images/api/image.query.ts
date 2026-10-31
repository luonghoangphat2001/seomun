import { keepPreviousData, useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';
import type { FileType } from '@/enums';

import type { ImageListREQ } from './image.request';
import type { FileRESP, ImageFilterFields, ImageListRESP, ImageRESP } from './image.response';
import { getImageByIdAPI, getImageSearchFiltersAPI, getImagesAPI, uploadFileAPI } from './image.api';

// === Query Keys ================================================================

export const imageKeys = {
  all: ['images'] as const,
  lists: () => [...imageKeys.all, 'list'] as const,
  list: (params: ImageListREQ) => [...imageKeys.lists(), params] as const,
  detail: (id: string) => [...imageKeys.all, 'detail', id] as const,
  filters: () => [...imageKeys.all, 'filters'] as const,
};

type ImageListQueryKey = ReturnType<typeof imageKeys.list>;
type ImageDetailQueryKey = ReturnType<typeof imageKeys.detail>;

// === Query Options =============================================================

export const imageListQueryOptions = (params: ImageListREQ) => ({
  queryKey: imageKeys.list(params),
  queryFn: () => getImagesAPI(params),
  staleTime: 30_000,
});

export const imageDetailQueryOptions = (id: string) => ({
  queryKey: imageKeys.detail(id),
  queryFn: async (): Promise<ImageRESP | null> => {
    const res = await getImageByIdAPI(id);
    return res.data.file ?? null;
  },
  staleTime: 30_000,
});

// === Hooks =====================================================================

export function useImagesQuery(
  params: ImageListREQ,
  options?: Omit<UseQueryOptions<ImageListRESP, AxiosError<IBaseError>, ImageListRESP, ImageListQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<ImageListRESP, AxiosError<IBaseError>, ImageListRESP, ImageListQueryKey>({
    ...imageListQueryOptions(params),
    ...options,
    placeholderData: keepPreviousData,
  });
}

export function useImageDetailQuery(
  id: string,
  options?: Omit<UseQueryOptions<ImageRESP | null, AxiosError<IBaseError>, ImageRESP | null, ImageDetailQueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<ImageRESP | null, AxiosError<IBaseError>, ImageRESP | null, ImageDetailQueryKey>({
    ...imageDetailQueryOptions(id),
    ...options,
  });
}

export function useImagesFilterQuery(options?: Omit<UseQueryOptions<ImageFilterFields, AxiosError<IBaseError>>, 'queryKey' | 'queryFn'>) {
  return useQuery<ImageFilterFields, AxiosError<IBaseError>>({
    ...options,
    queryKey: imageKeys.filters(),
    queryFn: () => getImageSearchFiltersAPI(),
    staleTime: 5 * 60_000,
  });
}

// === Mutations (mock-only — no real create/update/delete API) ==================

const MOCK_IMAGE: ImageRESP = {
  id: 0,
  name: '',
  path: '',
  url: '',
  type: '',
  mime_type: '',
  size: 0,
  created_by: null,
  created_at: '',
  updated_at: '',
};

export function useCreateImageMutation() {
  const queryClient = useQueryClient();
  return useMutation<ImageRESP, AxiosError<IBaseError>, unknown>({
    mutationFn: async () => ({ ...MOCK_IMAGE, id: Date.now() }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: imageKeys.lists() });
    },
  });
}

export function useUpdateImageMutation(imageId: string) {
  const queryClient = useQueryClient();
  return useMutation<ImageRESP, AxiosError<IBaseError>, unknown>({
    mutationFn: async () => ({ ...MOCK_IMAGE, id: Number(imageId) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: imageKeys.lists() });
    },
  });
}

export function useDeleteImageMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError<IBaseError>, string>({
    mutationFn: async () => {},
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: imageKeys.lists() });
    },
  });
}

export function useUploadImageFileMutation(options?: UseMutationOptions<{ url: string; path: string }, AxiosError<IBaseError>, File>) {
  return useMutation<{ url: string; path: string }, AxiosError<IBaseError>, File>({
    ...options,
    mutationFn: async (file: File) => ({
      url: URL.createObjectURL(file),
      path: `/uploads/images/${file.name}`,
    }),
  });
}

export function useUploadFileMutation(type: FileType, options?: UseMutationOptions<FileRESP, AxiosError<IBaseError>, File>) {
  return useMutation<FileRESP, AxiosError<IBaseError>, File>({
    ...options,
    mutationFn: (file) => uploadFileAPI({ file, type }),
  });
}
