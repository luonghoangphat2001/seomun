import type { PaginationRequest, SortRequest } from '@/types/api';
import type { ExposureStatus } from '@/enums';
import type { PopupSortField } from '../enums';

export type { PopupSortField };

export interface PopupListParams extends PaginationRequest, SortRequest<PopupSortField> {
  popup_name?: string;
  exposure_location?: string;
  status?: ExposureStatus;
  period_from?: string;
  period_to?: string;
  registrant_id?: number;
  exposure_period_from?: string;
  exposure_period_to?: string;
}

export interface PopupPayload {
  name: string;
  content: string | null;
  image_path: string | null;
  exposure_target: 'all' | number[] | null;
  exposure_location: string | null;
  width: number;
  height: number;
  status: ExposureStatus;
  exposure_start_date: string | null;
  exposure_end_date: string | null;
}
