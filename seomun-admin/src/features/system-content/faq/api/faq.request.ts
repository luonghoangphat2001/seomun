import type { PaginationRequest, SortRequest } from '@/types/api';
import type { ExposureStatus } from '@/enums';

import type { FaqCategory, FaqSortField } from '../enums';

export interface FaqListREQ extends PaginationRequest, SortRequest<FaqSortField> {
  faq_category?: FaqCategory;
  title?: string;
  author_id?: number;
  posting_status?: ExposureStatus;
  registration_date_from?: string;
  registration_date_to?: string;
}

export interface FaqCreateREQ {
  category: FaqCategory;
  question: string;
  answer: string;
  sort_order: number | null;
  posting_status: ExposureStatus;
}

export type FaqUpdateREQ = Partial<FaqCreateREQ>;
