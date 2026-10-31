import type { PaginationRequest, SortRequest } from '@/types/api';

import type { ProductExportType, ProductSortField, ProductStatus } from '../enums';

export interface ProductListREQ extends PaginationRequest, SortRequest<ProductSortField> {
  product_name?: string;
  product_code?: string;
  status?: ProductStatus;
  is_promotional?: boolean;
  category_id?: number;
  product_type?: string;
  search_term?: string;
  branch?: string;
  customer?: string;
  type?: string;
  is_public?: boolean;
  has_quotation?: boolean;
  customer_usage?: string;
}

export type ProductSpecificationREQ = {
  production_time_days: number;
  notes: string;
};

export type ProductInfoREQ = {
  size: string | null;
  paper: string | null;
  printed_color: string | null;
  quantity: string | null;
  post_processing: string | null;
  design: string | null;
};

export type ProductOptionREQ = {
  label: string;
  value: string;
  erp_option_id: number;
  additional_price: number;
  metadata: unknown[];
  sort_order: number;
  is_active: boolean;
};

export type ProductOptionGroupREQ = {
  code: string;
  erp_option_group_id: number;
  name: string;
  display_type: string;
  is_required: boolean;
  sort_order: number;
  options: ProductOptionREQ[];
};

export type ProductQuantityPriceREQ = {
  quantity: number;
  price: number;
};

export type ProductSetsREQ = {
  quantity: number;
  set_type: string;
  min_set: number;
  max_set: number;
  step_set: number;
};

export type ProductCreateREQ = {
  category_id: number;
  pricing_profile_id: number;
  web_editor_id: number | null;
  allow_file_upload: boolean;
  allow_web_editor: boolean;
  is_blank_canvas: boolean;
  requires_separate_shipping: boolean;
  separate_shipping_fee: number;
  name: string;
  name_en: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  sku: string;
  images: string[];
  is_active: boolean;
  is_popular: boolean;
  specification: ProductSpecificationREQ;
  info_icon: ProductInfoREQ;
  option_groups: ProductOptionGroupREQ[];
  quantity_prices: ProductQuantityPriceREQ[];
  product_sets: ProductSetsREQ;
  shopping_setting_item_ids: number[];
};

export type ProductUpdateREQ = Partial<ProductCreateREQ>;

export type ExportProductListREQ = Omit<ProductListREQ, 'page' | 'per_page'> & {
  export_type: ProductExportType;
  current_page?: number;
  per_page?: number;
  selected_ids?: string[];
};
