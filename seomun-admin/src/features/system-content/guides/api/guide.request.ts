import type { ExposureStatus } from '@/enums';
import type { PaginationRequest, SortRequest } from '@/types/api';

import type { GuideSortField, GuideType } from '../enums';
import type { GuideAttachment } from './guide.response';

export interface GuideListParams extends PaginationRequest, SortRequest<GuideSortField> {
  search_term?: string;
  author_id?: number;
  exposure_status?: ExposureStatus;
}

export interface GuidePayload {
  title: string;
  type: GuideType;
  content: string;
  attachments: GuideAttachment[] | null;
  exposure_status: ExposureStatus;
  exposure_target: string | null;
  exposure_start_date: string | null;
  exposure_end_date: string | null;
}
