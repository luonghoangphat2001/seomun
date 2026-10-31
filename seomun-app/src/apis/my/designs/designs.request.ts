import { DesignSourceType } from '@/enums/common';

export type DesignsListREQ = {
  side?: 'front' | 'back';
  size_id?: string;
  sort_by?: 'created_at' | 'updated_at' | 'design_title' | 'side';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
  source_type?: DesignSourceType;
  productId?: number;
};
