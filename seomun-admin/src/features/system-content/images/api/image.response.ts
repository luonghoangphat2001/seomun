import type { BaseResponse, NumberOptions, PaginationResponse, StringOptions } from '@/types/api';

export interface FileRESP {
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
}

export interface ImageRESP {
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
}

export interface ImageFilterFields {
  type_options: StringOptions[];
  author_options: NumberOptions[];
}

export type FileUploadRESP = BaseResponse<{ file: FileRESP }>;
export type ImageListRESP = PaginationResponse<{ files: ImageRESP[] }>;
export type ImageDetailRESP = BaseResponse<{ file: ImageRESP }>;
export type ImageFiltersRESP = BaseResponse<{ filters: ImageFilterFields }>;
