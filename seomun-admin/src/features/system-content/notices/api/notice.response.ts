import type { BaseResponse, PaginationResponse, NumberOptions, StringOptions } from '@/types/api';
import type { ExposureStatus } from '@/enums';

export interface NoticeFilterFields {
  exposure_status_options: StringOptions[];
  exposure_location_options: StringOptions[];
  author_options: NumberOptions[];
  exposure_target_options: NumberOptions[];
}

export interface NoticeAttachment {
  key: string;
  name: string;
  url: string;
  size: number;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  type: string | null;
  attachments: NoticeAttachment[] | null;
  is_pinned: boolean;
  view_count: number;
  exposure_status: ExposureStatusRESP;
  exposure_target: 'all' | number[];
  exposure_location: string;
  exposure_start_date: string | null;
  exposure_end_date: string | null;
  author: NoticeAuthor | null;
  created_at: string;
  updated_at: string;
}

export interface NoticeAuthor {
  id: number;
  username: string;
  name: string;
}

export type ExposureStatusRESP = {
  value: ExposureStatus;
  label: string;
};

export type NoticeFiltersRESP = BaseResponse<{ filters: NoticeFilterFields }>;
export type NoticeListRESP = PaginationResponse<{ notices: Notice[] }>;
export type NoticeDetailRESP = BaseResponse<{ notice: Notice }>;
export type NoticeWriteRESP = BaseResponse<Notice>;
