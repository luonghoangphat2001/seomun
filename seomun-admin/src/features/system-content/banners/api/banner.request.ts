import type { PaginationRequest, SortRequest } from '@/types/api';
import type { ExposureStatus } from '@/enums';
import type { BannerSortField } from '../enums';
export interface BannerListParams extends PaginationRequest, SortRequest<BannerSortField> {
  banner_name?: string;
  status?: ExposureStatus;
  registrant_id?: number;
  exposure_period_from?: string;
  exposure_period_to?: string;
}

export interface BannerPayload {
  name: string;
  image_path: string;
  image_path_mobile: string;
  link_url: string;
  exposure_target: 'all' | string;
  exposure_location: string;
  status: ExposureStatus;
  sort_order: number;
  exposure_start_date: string;
  exposure_end_date: string;
}
