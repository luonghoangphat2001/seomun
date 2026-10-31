import type { BaseResponse, PaginationMeta } from '@/types/api';

import type { CustomerMember, LabelValue, PromotionalProduct } from '../../types/customer.type';

export interface ExposureMemberRawItem {
  id: number;
  name: string;
  username: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  status: LabelValue;
  approval_status: LabelValue;
  authority: { value: string | null; label: string };
  date_of_joining: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type ExposureCustomerListRESP = BaseResponse<{
  members: CustomerMember[];
  pagination: PaginationMeta;
}>;

export type ExposureCustomerListRawRESP = BaseResponse<{
  members: ExposureMemberRawItem[];
  pagination?: PaginationMeta;
}> & {
  pagination?: PaginationMeta;
};

export type PromotionalProductListRESP = BaseResponse<{
  products: PromotionalProduct[];
  promotional_product_ids: number[];
  pagination: PaginationMeta;
}>;

export type PromotionalProductListRawRESP = BaseResponse<{
  products: PromotionalProductRawItem[];
  promotional_product_ids?: number[];
  pagination?: PaginationMeta;
}> & {
  pagination?: PaginationMeta;
};

export interface PromotionalProductRawItem {
  id: number;
  name: string;
  sku: string;
  category?: {
    id: number;
    name: string;
  } | null;
  price: string | number;
  is_promoted: boolean;
  sort_order?: number | null;
}

export type UpdatePromotionalProductsRESP = BaseResponse<null>;
