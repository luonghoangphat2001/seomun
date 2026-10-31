import type { PaginatedResponse } from '@/types/api';

import type { PriceHistoryActionType, PriceHistoryTargetSection } from './price-history.request';

export type PriceHistoryLog = {
  id: string;
  action_type: PriceHistoryActionType;
  target_section: PriceHistoryTargetSection;
  target_id: string;
  target_name: string;
  changed_field: string;
  before_value: string;
  after_value: string;
  changed_at: string;
  changed_by: string;
  summary_text: string;
  before_payload: Record<string, string>;
  after_payload: Record<string, string>;
};

export type PriceHistoryListRESP = PaginatedResponse<PriceHistoryLog>;
