import { ArtWork } from '../design/design.response';

export type CartItemOptionRESP = {
  group: {
    id: number;
    name: string;
    code: string;
  };
  option: {
    id: number;
    label: string;
    value: string;
  };
};

export type CartItemInputOptionsRESP = {
  width: number;
  height: number;
};

export type CartItemDesignFileRESP = {
  id: number;
  design_group_id: number;
  url: string;
  name: string;
  size: string;
  mime: string;
  metadata: Record<string, unknown> | null;
  print_as_is: boolean;
  print_without_proof: boolean;
  created_at: string;
  updated_at: string;
};

export type CartItemDesignRESP = {
  front:
    | (ArtWork & {
        design_group_id: number;
      })
    | null;
  back:
    | (ArtWork & {
        design_group_id: number;
      })
    | null;
  file: CartItemDesignFileRESP | null;
  preview_pdf_url?: string;
  title: string;
};

export type CartItemProductRESP = {
  id: number;
  name: string;
  name_en: string;
  slug: string;
  sku: string;
  price: number;
  compare_price: number | null;
  images: string[];
  first_image: string | null;
  is_active: boolean;
  stock_quantity: number;
  specification: {
    production_time_days: number;
  };
};

export type CartItemLineDisplayRESP = {
  thumbnail_url: string | null;
  specifications_line: string | null;
  post_processing: string | null;
  quantity_label: string;
  unit_price: number;
  line_total: number;
  attachments: string[];
};

export type CartItemRESP = {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  number_of_cases: number;
  multiplier: number;
  total_quantity: number;
  price: number;
  subtotal: number;
  options: CartItemOptionRESP[];
  input_options: CartItemInputOptionsRESP;
  notes: string | null;
  storage_date: string;
  created_at: string;
  updated_at: string;
  design: CartItemDesignRESP;
  product: CartItemProductRESP;
  line_display: CartItemLineDisplayRESP;
};

export type CartListRESP = {
  id: number;
  user_id: number;
  total_quantity: number;
  total_price: number;
  created_at: string;
  updated_at: string;
  items: CartItemRESP[];
};

export type CartListResponse = {
  cart: CartListRESP;
  meta: {
    search: string | null;
    displayed_line_count: number;
    total_lines_in_cart: number;
  };
};

export type CartQuoteOptionRESP = {
  group_id: number;
  option_id: number;
};

export type CartQuoteItemRESP = {
  cart_item_id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  quantity: number;
  number_of_cases: number;
  unit_price: number;
  subtotal: number;
  options: CartQuoteOptionRESP[];
  notes: string | null;
  production_days: number;
};

export type CartQuoteShippingBreakdownRESP = {
  total_shipping_fee: number;
  shipping_fee_type: string;
  combined_shipping_fee: number;
  separate_shipping_fee: number;
};

export type CartQuotePackageEstimateRESP = {
  box_count: number;
  shipping_weight: number;
};

export type CartQuoteCheckoutSummaryRESP = {
  amount_supply: number;
  amount_vat: number;
  amount_discount: number;
  point_discount: number;
  point_used: number;
  shipping_fee: number;
  total_payment: number;
  estimated_ship_date: string;
  estimated_production_days: number;
  package_estimate: CartQuotePackageEstimateRESP;
};

export type CartQuoteRESP = {
  items: CartQuoteItemRESP[];
  shipping_breakdown: CartQuoteShippingBreakdownRESP;
  checkout_summary: CartQuoteCheckoutSummaryRESP;
};
