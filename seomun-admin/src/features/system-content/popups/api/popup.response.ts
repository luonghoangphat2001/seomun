import type { BaseResponse, NumberOptions, PaginationResponse, StringOptions } from '@/types/api';
import type { ExposureStatus } from '@/enums';
import type { Registrant } from '@/features/system-content/banners';

export interface PopupFilterFields {
  exposure_location_options: StringOptions[];
  status_options: StringOptions[];
  exposure_target_options: NumberOptions[];
  registrant_options: NumberOptions[];
}

export interface PopupStatus {
  value: ExposureStatus;
  label: string;
}

export interface SizeSettings {
  width: number;
  height: number;
}

export interface Popup {
  id: number;
  name: string;
  content: string | null;
  image_path: string | null;
  exposure_location: string | null;
  exposure_target: 'all' | number[];
  size_settings: SizeSettings | null;
  status: PopupStatus;
  exposure_start_date: string;
  exposure_end_date: string;
  registrant: Registrant | null;
  created_at: string;
  updated_at: string;
}

export type PopupFiltersRESP = BaseResponse<{ filters: PopupFilterFields }>;
export type PopupListRESP = PaginationResponse<{ popups: Popup[] }>;
export type PopupDetailRESP = BaseResponse<{ popup: Popup }>;
export type PopupWriteRESP = BaseResponse<Popup>;
