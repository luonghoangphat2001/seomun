import type { BaseResponse, PaginationResponse } from '@/types/api';

import type { ProductStatus } from '../enums';

export type ProductLocalizedText = {
  ko?: string | null;
  en?: string | null;
  ja?: string | null;
};

export type ProductListLocale = 'en' | 'ko';

export type AdminProductCategory = {
  id: number;
  name: ProductLocalizedText;
  slug: string | null;
  parent_id?: number | null;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  sort_order?: number | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type AdminProductSpecification = {
  production_time_days?: number | string | null;
  notes?: string | null;
  [key: string]: unknown;
};

export type AdminProductOption = {
  id?: number;
  label: string;
  value: string;
  erp_option_id?: number | null;
  erp_option: AdminProductERPOption;
  additional_price: string | number;
  metadata?: unknown[] | Record<string, unknown> | null;
  sort_order: number;
  is_active?: boolean;
};

export type AdminProductERPOption = {
  id: number;
  code: string;
  label: string;
};

export type AdminProductOptionGroup = {
  id?: number;
  code: string;
  erp_option_group_id?: number | null;
  name: string;
  display_type: string;
  is_required: boolean;
  sort_order: number;
  options: AdminProductOption[];
};

export type AdminProductSet = {
  id?: number;
  quantity?: number | string | null;
  set_type?: string | null;
  min_set?: number | string | null;
  max_set?: number | string | null;
  step_set?: number | string | null;
};

export type AdminProductQuantityPrice = {
  id?: number;
  quantity: number | string;
  price: number | string;
};

export type AdminProductInfoIcon = {
  size: string | null;
  paper: string | null;
  printed_color: string | null;
  quantity: string | null;
  post_processing: string | null;
  design: string | null;
};

export type AdminProductPricingProfile = {
  id: number;
  code: string;
  name: string;
  calculator_type: string;
  is_active: boolean;
};

export type AdminProductRESP = {
  id: number;
  category_id: number | null;
  pricing_profile_id?: number | null;
  pricing_profile?: AdminProductPricingProfile | null;
  web_editor_id?: number | null;
  allow_file_upload?: boolean;
  allow_web_editor?: boolean;
  is_blank_canvas?: boolean;
  info_icon?: AdminProductInfoIcon;
  requires_separate_shipping?: boolean;
  separate_shipping_fee?: number | string | null;
  name: ProductLocalizedText;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: string | number | null;
  compare_price: string | number | null;
  sku: string | null;
  images: string[];
  is_popular: boolean;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  category: AdminProductCategory | null;
  first_image: string | null;
  branch: string | null;
  customer: string | null;
  specification?: AdminProductSpecification | null;
  option_groups?: AdminProductOptionGroup[];
  product_sets?: AdminProductSet | null;
  quantity_prices?: AdminProductQuantityPrice[];
  has_quotation: boolean;
  is_public: boolean;
  customer_usage_status: string | null;
  registered_by?: string | null;
  registered_by_id?: number | null;
  product_type?: string | null;
  type?: string | null;
  status?: ProductStatus | null;
  shopping_setting_item_ids: number[];
};

export interface ProductListItemRESP {
  id: string;
  no: number;
  product_code: string;
  product_name: string;
  product_name_en: string | null;
  category_name: string;
  status: ProductStatus;
  is_promotional: boolean;
  is_public: boolean;
  has_quotation: boolean;
  branch: string;
  customer: string;
  manager_name: string;
  created_at: string;
  registration_date: string;
  thumbnail_url: string | null;
  is_active: boolean;
}

export type ProductListRESP = PaginationResponse<{
  products: ProductListItemRESP[];
}>;

export type RawProductListRESP = PaginationResponse<{
  products: AdminProductRESP[];
}>;

export type ProductCreateRESP = BaseResponse<{
  product: unknown;
}>;

export type ProductDetailRESP = BaseResponse<{
  product: AdminProductRESP;
}>;

export type ProductUpdateRESP = BaseResponse<{
  product: AdminProductRESP;
}>;

export type ErpOption = {
  id: number;
  erp_option_group_id: number;
  code: string;
  label: string;
  value: string;
  additional_price: string;
  sort_order: number;
  is_active: boolean;
  osrc_um: string | null;
  preview_image: string | null;
  size_option_id: number | null;
  paper_id: number | null;
  attributes: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ErpOptionGroup = {
  id: number;
  code: string;
  label: string;
  display_type: string;
  type: string;
  is_required: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  erp_options: ErpOption[];
};

export type ErpOptionGroupsRESP = BaseResponse<{
  erp_option_groups: ErpOptionGroup[];
}>;

export type ProductExportHistoryRESP = {
  id: number;
  status: string;
  file_path: string | null;
};

export type ProductExportRESP = BaseResponse<{ history: ProductExportHistoryRESP }>;
