import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';
import { uploadFile } from '@/lib/api/upload-file';

import type { ImageListREQ, UploadFileREQ } from './image.request';
import type { FileRESP, ImageDetailRESP, ImageFilterFields, ImageFiltersRESP, ImageListRESP } from './image.response';

export const getImagesAPI = (params: ImageListREQ): Promise<ImageListRESP> => api.get<ImageListRESP>(ENDPOINTS.FILES.LIST, { params });

export const getImageByIdAPI = (id: string): Promise<ImageDetailRESP> => api.get<ImageDetailRESP>(ENDPOINTS.FILES.DETAIL(id));

export const getImageSearchFiltersAPI = async (): Promise<ImageFilterFields> => {
  const response = await api.get<ImageFiltersRESP>(ENDPOINTS.FILES.SEARCH_FILTERS);
  return response.data.filters;
};

export const uploadFileAPI = async ({ file, type }: UploadFileREQ): Promise<FileRESP> => uploadFile({ file, type });
