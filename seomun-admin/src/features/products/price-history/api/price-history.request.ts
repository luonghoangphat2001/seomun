export type PriceHistoryActionType = 'CREATE' | 'UPDATE' | 'DELETE';
export type PriceHistoryTargetSection = 'papers' | 'printing' | 'post_processing' | 'options';

export type PriceHistoryListREQ = {
  page?: number;
  per_page?: number;
  query?: string;
  action_type?: PriceHistoryActionType;
  target_section?: PriceHistoryTargetSection;
};
