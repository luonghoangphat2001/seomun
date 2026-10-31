import type { BaseResponse, NumberOptions, PaginationResponse } from '@/types/api';
import type { ExposureStatus } from '@/enums/common.enum';

export interface GuideFilterFields {
  types: string[];
  author_options?: NumberOptions[];
}
export interface GuideAttachment {
  key: string;
  name: string;
  url: string;
  size: number;
}

export interface Guide {
  id: number;
  title: string;
  content: string;
  type: string;
  attachments: GuideAttachment[];
  is_active: boolean;
  exposure_status: GuideStatus;
  exposure_target: string;
  exposure_start_date: string | null;
  exposure_end_date: string | null;
  author: Author | null;
  created_at: string;
  updated_at: string;
}

export interface GuideStatus {
  value: ExposureStatus;
  label: string;
}

export interface Author {
  id: number;
  username: string;
  name: string;
}

export type GuideFiltersRESP = BaseResponse<{ filters: GuideFilterFields }>;
export type GuideListRESP = PaginationResponse<{ guide_contents: Guide[] }>;
export type GuideDetailRESP = BaseResponse<{ guide_content: Guide }>;
export type GuideWriteRESP = BaseResponse<{ guide_content: Guide }>;
