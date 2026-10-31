import { PaginationRESP } from '@/types';

export type ReviewCategoryRESP = {
  id: number;
  name: {
    ko: string;
    en: string;
  };
  slug: string;
};

export type ReviewProductRESP = {
  id: number;
  name: string;
  name_en: string;
  slug: string;
  sku: string;
  images: string[];
  first_image: string;
  category: ReviewCategoryRESP;
};

export type ReviewUserRESP = {
  id: number;
  name: string;
  email: string;
};

export type ReviewOrderRESP = {
  id: number;
  order_number: string;
};

export type ReviewItemRESP = {
  id: number;
  user_id: number;
  product_id: number;
  order_id: number;
  rating: number;
  title: string;
  content: string;
  images: string[];
  hashtags: string[];
  is_approved: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  product: ReviewProductRESP;
  user: ReviewUserRESP;
  order: ReviewOrderRESP;
};

export type ReviewListRESP = {
  reviews: ReviewItemRESP[];
};

export type ReviewCreateRESP = {
  review: ReviewItemRESP;
};

export type ReviewUnreviewedProductSnapshotRESP = {
  id: number;
  name: string;
  name_en: string;
  slug: string;
  category: string;
};

export type ReviewUnreviewedProductRESP = {
  id: number;
  name: string;
  name_en: string;
  slug: string;
  images?: string[];
  sku?: string;
  first_image?: string;
  short_description?: string;
  category?:
    | string
    | ReviewUnreviewedProductSnapshotRESP
    | {
        id: number;
        name: {
          ko: string;
          en: string;
        };
        slug: string;
      };
};

export type ReviewUnreviewedConfigurationOptionRESP = {
  group?: {
    id?: number;
    code?: string;
    name?: string;
  };
  option?: {
    id?: number;
    label?: string;
    value?: string;
    additional_price?: number;
  };
};

export type ReviewUnreviewedConfigurationRESP = {
  unit_label?: string;
  input_options?: {
    width?: number;
    height?: number;
  };
  options?: ReviewUnreviewedConfigurationOptionRESP[];
  [key: string]: unknown;
};

export type ReviewUnreviewedOrderItemRESP = {
  id: number;
  order_id?: number;
  order_number?: string;
  product_id: number;
  title: string;
  quantity: number;
  multiplier?: number;
  number_of_cases: number;
  production_days?: number;
  total_quantity: number;
  unit: string;
  unit_price: string;
  total_price: string;
  configuration?: ReviewUnreviewedConfigurationRESP;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  product?: ReviewUnreviewedProductRESP;
  product_snapshot?: ReviewUnreviewedProductSnapshotRESP;
};

export type ReviewUnreviewedListRESP = {
  order_items: ReviewUnreviewedOrderItemRESP[];
  pagination: PaginationRESP;
};

export type ReviewUnreviewedProductAPIRESP = {
  id: number;
  category_id?: number;
  sku?: string;
  slug?: string;
  name: string;
  name_en?: string | null;
  name_ja?: string | null;
  price?: string;
  compare_price?: string;
  stock_quantity?: number;
  min_quantity?: number;
  max_quantity?: number;
  short_description?: string | null;
  description?: string | null;
  images?: string[];
  is_active?: boolean;
  allow_file_upload?: boolean;
  allow_web_editor?: boolean;
  is_blank_canvas?: boolean;
  is_popular?: boolean;
  is_featured?: boolean;
  sort_order?: number;
  view_count?: number;
  exposure_count?: number;
  average_rating?: string;
  total_reviews?: number;
  total_rating?: number;
  branch_name?: string | null;
  client_name?: string | null;
  requires_separate_shipping?: boolean;
  separate_shipping_fee?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  web_editor_id?: number | null;
  info_icon?: string | null;
  category?:
    | {
        id: number;
        name: {
          ko: string;
          en: string;
        };
        slug: string;
      }
    | string
    | null;
};

export type ReviewUnreviewedOrderItemAPIRESP = {
  id: number;
  order_id?: number;
  order_number?: string;
  order?: {
    order_number: string;
  };
  product_id: number;
  title: string;
  quantity: number;
  multiplier?: number;
  number_of_cases?: number;
  production_days?: number;
  total_quantity: number;
  unit: string;
  unit_price: number | string;
  total_price: number | string;
  configuration?: ReviewUnreviewedConfigurationRESP;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  product?: ReviewUnreviewedProductAPIRESP;
};

export type ReviewUnreviewedListAPIRESP = {
  order_items: ReviewUnreviewedOrderItemAPIRESP[];
};
