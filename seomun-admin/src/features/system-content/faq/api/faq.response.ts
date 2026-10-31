import type { BaseResponse, PaginationResponse, NumberOptions, StringOptions } from '@/types/api';
import type { ExposureStatus } from '@/enums/common.enum';
import type { Author } from '@/features/system-content/guides';

import type { FaqCategory } from '../enums';

export interface FaqFiltersRESP {
  faq_category_options: StringOptions[];
  posting_status_options: StringOptions[];
  registrant_options: NumberOptions[];
}

export interface FaqRESP {
  id: number;
  category: FaqCategory;
  question: string;
  answer: string;
  sort_order: number;
  view_count: number;
  posting_status: PostingStatusRESP;
  author: Author | null;
  created_at: string;
  updated_at: string;
}

export type PostingStatusRESP = {
  value: ExposureStatus;
  label: string;
};

export type FaqListRESP = PaginationResponse<{ faqs: FaqRESP[] }>;
export type FaqDetailRESP = BaseResponse<{ faq: FaqRESP }>;
export type FaqWriteRESP = BaseResponse<{ faq: FaqRESP }>;
export type FaqSearchFiltersRESP = BaseResponse<{ filters: FaqFiltersRESP }>;
