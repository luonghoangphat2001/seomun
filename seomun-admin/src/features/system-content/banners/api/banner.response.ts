import type { BaseResponse, PaginationResponse, NumberOptions, StringOptions } from '@/types/api';
import type { ExposureStatus } from '@/enums';

export interface BannerFilterFields {
  exposure_location_options: StringOptions[];
  status_options: StringOptions[];
  exposure_target_options: NumberOptions[];
}

export interface Banner {
  id: number;
  name: string;
  image_path: string;
  image_path_mobile: string | null;
  link_url: string | null;
  exposure_location: string;
  exposure_target: 'all' | number[];
  status: BannerStatus;
  sort_order: number;
  exposure_start_date: string;
  exposure_end_date: string;
  registrant: Registrant | null;
  created_at: string;
  updated_at: string;
}

export interface BannerStatus {
  value: ExposureStatus;
  label: string;
}

export interface Registrant {
  id: number;
  username: string;
  name: string;
}

export type BannerFiltersRESP = BaseResponse<{ filters: BannerFilterFields }>;
export type BannerListRESP = PaginationResponse<{ banners: Banner[] }>;
export type BannerDetailRESP = BaseResponse<{ banner: Banner }>;
export type BannerWriteRESP = BaseResponse<Banner>;
