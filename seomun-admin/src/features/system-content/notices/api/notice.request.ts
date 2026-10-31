import type { PaginationRequest, SortRequest } from '@/types/api';
import type { ExposureStatus } from '@/enums';

import type { NoticeSortField, NoticeExposureLocation, NoticeType } from '../enums';
import type { NoticeAttachment } from './notice.response';

export type { NoticeSortField, NoticeExposureLocation, NoticeType };

export interface NoticeListParams extends PaginationRequest, SortRequest<NoticeSortField> {
  search_term?: string;
  author_id?: string;
  type?: NoticeType;
  exposure_status?: ExposureStatus;
  exposure_location?: NoticeExposureLocation;
}

export interface NoticePayload {
  title: string;
  content: string;
  type?: NoticeType;
  attachments?: NoticeAttachment[];
  is_pinned: boolean;
  exposure_status: ExposureStatus;
  exposure_target?: number[];
  exposure_location: string;
  exposure_start_date?: string;
  exposure_end_date?: string;
}
