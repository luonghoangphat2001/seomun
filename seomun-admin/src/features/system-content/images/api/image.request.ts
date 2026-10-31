import type { PaginationRequest, SortRequest } from '@/types/api';
import type { FileType } from '@/enums';

import type { ImageSortField } from '../enums';

export interface ImageListREQ extends PaginationRequest, SortRequest<ImageSortField> {
  name?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  created_by?: number;
}

export interface UploadFileREQ {
  file: File;
  type: FileType;
}
