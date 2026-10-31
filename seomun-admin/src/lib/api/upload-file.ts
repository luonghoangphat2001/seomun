import { ENDPOINTS } from '@/config/endpoints';
import type { FileType } from '@/enums';
import type { PaginationResponse } from '@/types/api';

import { api } from './api-client';

export type UploadedFile = {
  id: number;
  name: string;
  path: string;
  url: string;
  type: string;
  mime_type: string;
  size: number;
  created_by: { id: number; name: string } | null;
  created_at: string;
  updated_at: string;
};

type UploadFileResponse = {
  data: {
    file: UploadedFile;
  };
};

type UploadFileParams = {
  file: File;
  type: FileType;
};

export async function uploadFile({ file, type }: UploadFileParams): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await api.post<UploadFileResponse>(ENDPOINTS.FILES.UPLOAD, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.file;
}

export type ListFilesParams = {
  page?: number;
  per_page?: number;
  type?: FileType;
  name?: string;
};

export type ListFilesResponse = PaginationResponse<{ files: UploadedFile[] }>;

export function listFiles(params: ListFilesParams): Promise<ListFilesResponse> {
  return api.get<ListFilesResponse>(ENDPOINTS.FILES.LIST, { params });
}
