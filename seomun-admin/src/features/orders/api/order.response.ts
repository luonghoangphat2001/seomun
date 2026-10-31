import type { BaseResponse, PaginationResponse } from '@/types/api';

import type { AssignedDesignStatus, CustomerReviewStatus, OrderProofStatus, OrderStatus } from '../enums';
import type { SOURCE_TYPE } from '@/enums';

export interface OrderListItemRESP {
  id: number;
  user: OrderUser;
  order_number: string;
  order_external_number: string | null;

  payment_method: string;
  payment_transaction: PaymentTransaction | null;

  status: string;
  status_label_ko: string | null;
  status_label_en: string | null;

  payment_status: string;
  order_status_stage: string;

  estimated_production_days: number;

  shipping_fee_type: string;
  shipping_fee: string;
  shipping_branch_name: string | null;
  shipping_time: string | null;

  amount_shipping: string;
  shipping_method: string;
  currency: string;

  totals: OrderTotal;
  product: OrderProduct;

  design_mode_code: string;

  contact: OrderContact;

  customer_manager: Manager | null;
  assigned_person: Manager | null;
  reception_manager: Manager;
  production_manager: Manager;

  shipping: OrderShipping;
  sender: OrderSender;
  payment_details: PaymentDetails;

  order_history_storage_until: string | null;
  order_history_storage_days_remaining: number | null;

  proof: Proof;
  metadata: OrderMetadata;

  items: OrderItem[];

  created_at: string;
  updated_at: string;

  company_name: string | null;
  quantity: number;
  item_count: number;
  has_design: boolean;

  production_site: string | null;
  requested_delivery_date: string | null;

  waybill: Waybill;

  order_source: string | null;
  order_linkage: string | null;
  reception_point: string | null;
  deleted_at: string | null;

  product_information: ProductInformation;
  assigned_designers: {
    id: number;
    username: string;
    name: string;
  }[];
}

export interface OrderUser {
  id: number;
  username: string;
  name: string;
  email: string;
}

export interface PaymentTransaction {
  id: number;
  order_id: number;

  transaction_id: string;
  pg_transaction_id: string | null;
  pg_name: string;

  payment_method: string;
  status: string;
  amount: string;
  currency: string;

  card_name: string | null;
  card_number: string | null;

  virtual_account_number: string | null;
  virtual_account_bank: string | null;
  virtual_account_expires_at: string | null;
  bank_account_holder: string | null;

  pg_request: unknown;
  pg_response: unknown;
  refund_reason: string | null;

  paid_at: string | null;
  failed_at: string | null;
  refunded_at: string | null;

  metadata: unknown;

  tax_invoice_status: string | null;
  tax_invoice_issued_at: string | null;
  cash_receipt_status: string | null;
  cash_receipt_issued_at: string | null;
  receipt_notes: string | null;

  created_at: string;
  updated_at: string;
}

/** All money fields arrive as decimal strings, e.g. "48746.00". */
export interface OrderTotal {
  subtotal: string;
  shipping_fee: string;
  discount: string;
  tax: string;
  total: string;
}

export interface OrderProduct {
  id: number;
  name: string;
  description: string | null;
  short_description: string | null;
  images: string | null;
}

export interface OrderContact {
  name: string;
  postcode: string;
  address: string;
  address_detail: string;
  phone: string;
  phone2: string;
  tel: string;
  email: string;
  company_name: string | null;
}

export interface Manager {
  id: number | null;
  name: string | null;
}

export interface OrderShipping {
  name: string;
  phone: string;
  cellphone_number: string;

  phone2: string | null;

  postcode: string;
  address: string;
  address_detail: string;

  method: string;
  email: string;

  shipping_carrier: string | null;
  shipped_date: string | null;
  shipping_memo: string | null;
  shipping_status: string | null;
  shipping_status_label_ko: string | null;
  shipping_status_label_en: string | null;

  invoice_number: string | null;

  message_preset: string | null;
  message_custom: string | null;
}

export interface OrderSender {
  sender_name: string | null;
  sender_phone: string | null;
  sender_zipcode: string | null;
  sender_address: string | null;
  sender_address2: string | null;
}

export interface PaymentDetails {
  order_amount: string;
  shipping_fee: string;
  payment_amount: string;
  paid_amount: string;
}

export interface Proof {
  status: string | null;
  confirmed_at: string | null;
  corrections: unknown[];
  file_resubmissions: unknown[];
}

export interface OrderMetadata {
  selected_options: unknown[];
  estimated_production_days: number;
  requested_delivery_date: string | null;
  placed_at: string;
  customer_note: string | null;
}

export interface OrderItem {
  id: number;
  product_id: number | null;
  title: string;
  quantity: number;
  number_of_cases: number;
  multiplier: number;
  total_quantity: number;
  unit: string;
  production_days: number;
  unit_price: string;
  total_price: string;
  design: OrderItemDesign;
  options: OrderItemOption[];
  input_options: OrderItemInputOptions;
  product_snapshot: ProductSnapshot;
  configuration: ItemConfiguration;
  notes: string | null;
  metadata: {
    proof_status: OrderProofStatus;
    file_resubmissions: {
      note: string;
      file_url: string;
      file_name: string;
      submitted_at: string;
    }[];
    proof_confirmed_at: string | null;
  } | null;
}

export interface OrderItemDesign {
  front: OrderItemArtwork | null;
  back: OrderItemArtwork | null;
  file: DesignFile | null;
  confirmed_file: {
    name: string;
    url: string;
    confirmed_at: string; //"2026-09-29T07:37:55+00:00"
  } | null;
}

export interface OrderItemArtwork {
  id: number;
  side: string;

  layout_data: DesignLayoutData;
  layout_s3_path: string | null;

  logo_path: string | null;
  preview_image_path: string | null;
  cutline_image_url: string | null;

  design_group_id: number;

  created_at: string;
  updated_at: string;
}

/** `objects` holds the editor's canvas nodes — the admin never reads into them. */
export interface DesignLayoutData {
  objects: unknown[];
  background: { color: string };
}

export interface DesignFile {
  id: number;
  design_group_id: number;

  url: string;
  name: string;
  size: string;
  mime: string;

  metadata: unknown;

  print_as_is: boolean;
  print_without_proof: boolean;

  created_at: string;
  updated_at: string;
}

export interface OrderItemOption {
  group: {
    id: number;
    code: string;
    name: string;
  };
  option: {
    id: number;
    label: string;
    value: string;
    additional_price: number;
  };
}

export interface OrderItemInputOptions {
  width: number;
  height: number;
}

export interface ProductSnapshot {
  id: number | null;
  name: string;
  name_en: string;
  name_ja: string;

  category: string;
  category_en: string;
  category_ja: string;

  slug: string | null;
  sku: string | null;
  first_image?: string | null;

  specification: unknown[];
}

export interface ItemConfiguration {
  jobs: string;
  size: string;
  paper: string;
  sheets: string;
  attachment: string;
  product_name: string;
  design_preview: string;
  product_category: string;
}

export interface Waybill {
  number: string | null;
  courier: string | null;
  registered_at: string | null;
}

export interface ProductInformation {
  items: ProductInformationItem[];
}

export interface ProductInformationItem {
  id: number;
  /** Present in order-detail responses so product information can be paired with the order item metadata. */
  order_item_id?: number;
  title: string;

  quantity: number;
  multiplier: number;

  unit: string;
  production_days: number;

  unit_price: string;
  total_price: string;

  /** `options` and `configuration` carry the same payload. */
  options: ProductInformationConfiguration | null;
  configuration: ProductInformationConfiguration | null;

  notes: string | null;
  post_processing: string | null;

  designs: unknown[];
}

export interface ProductInformationConfiguration {
  jobs: string;
  sheets: string;
  attachment: string;

  design: ProductInformationDesign;
  design_preview: string;

  options: OrderItemOption[];
  input_options: OrderItemInputOptions;

  cart_item_id: number;

  product_id: number;
  product_sku: string;
  product_slug: string;

  product_name: string;
  product_name_en: string;
  product_name_ja: string;

  product_category: string;
  product_category_en: string;
  product_category_ja: string;

  production_time_days: number;
}

export interface ProductInformationDesign {
  file_design: DesignFile | null;
  design_group: DesignGroup | null;
  editor_design: {
    front: OrderItemArtwork | null;
    back: OrderItemArtwork | null;
  };
}

export interface DesignGroup {
  id: number;
  title: string;

  user_id: number;
  order_id: number | null;
  product_id: number | null;
  order_item_id: number | null;
  size_option_id: number | null;

  width_mm: number | null;
  height_mm: number | null;

  source_type: SOURCE_TYPE;
  metadata: unknown;

  order_artworks: OrderItemArtwork[];
  upload_artworks: DesignFile[];

  preview_pdf_url: string | null;
  preview_image_path: string | null;

  revised_file_name: string | null;
  revised_file_path: string | null;

  rejection_reason: string | null;
  rejected_at: string | null;
  confirmed_at: string | null;
  confirmation_requested_at: string | null;

  created_at: string;
  updated_at: string;
}

export interface OrderArtworkDesign {
  id: number;
  side: string;
  design_title: string | null;
  revised_file_name: string | null;
  revised_file_url: string | null;
  rejection_reason: string | null;
  confirmation_requested_at: string | null;
  confirmed_at: string | null;
  rejected_at: string | null;
}

export interface OrderFileResubmissionRESP {
  file_name: string;
  file_url: string;
  note?: string;
  submitted_at: string;
}

export type OrderDesignFilesRESP = BaseResponse<{
  order_number: string;
  status: string;
  artworks: OrderArtworkDesign[]; //???
  metadata: {
    quantity_sets: {
      quantity: number;
      multiplier: number;
    };
    quote_summary: {
      tax: number;
      total: number;
      currency: string;
      discount: number;
      subtotal: number;
      point_used: number;
      shipping_fee: number;
      options_total: number;
      point_discount: number;
      line_items_total: number;
      shipping_fee_type: string;
      estimated_production_days: number;
    };
    estimated_points_earned: number;
    file_resubmissions: OrderFileResubmissionRESP[];
  };
}>;

export interface OrderDesignFileRESP {
  id: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  uploaded_by: string;
  version: number;
}

export interface OrderStatusChangeHistoryUserRESP {
  id: number;
  name: string;
  email: string;
  username: string;
}

export interface OrderStatusChangeHistoryItemRESP {
  id: number;
  order_id: number;
  old_status: OrderStatus | null;
  new_status: OrderStatus;
  changed_by: OrderStatusChangeHistoryUserRESP | null;
  note: string | null;
  change_at: string;
  created_at: string;
}

export type OrderStatusChangeHistoryRESP = PaginationResponse<{ histories: OrderStatusChangeHistoryItemRESP[] }>;

export type OrderDetailRESP = BaseResponse<{ order: OrderListItemRESP }>;

export type OrderListRESP = PaginationResponse<{ orders: OrderListItemRESP[] }>;

export type WorkInstructionPrintRESP = BaseResponse<{ pdf_url: string }>;

export type BatchPrintWorkInstructionsRESP = BaseResponse<{ pdf_url: string }>;

export type OrderActionRESP = BaseResponse<{ order_number: string; status: string }>;

export type BulkOrderStatusChangeRESP = BaseResponse<{ updated_count: number }>;

export type AssignedDesignList = {
  id: number;
  order_number: string;
  order_status: OrderStatus;
  payment_status: string;
  product_name: string;
  product: {
    id: number;
    name: string;
    slug: string | null;
    images: string[];
  } | null;
  customer: {
    id: number;
    username: string;
    name: string;
    phone: string;
  };
  assigned_design_item_count: number;
  created_at: string;
  updated_at: string;
};

export type AssignedDesignListRESP = {
  orders: AssignedDesignList[];
};

export type AssignedDesignVersion = {
  id: number;
  version: number;
  file_name: string;
  file_url: string;
  designer_note: string;
  customer_response: CustomerReviewStatus;
  customer_note: string | null;
  submitted_at: string;
  responded_at: string;
};

export type AssignedDesignProductOption = {
  id: number;
  label: string;
  value: string;
  category: string | null;
  metadata: unknown[];
  is_active: boolean;
  created_at: string;
  deleted_at: string | null;
  deleted_by: number | null;
  field_name: string | null;
  sort_order: number;
  updated_at: string;
  option_code: string | null;
  erp_option_id: number | null;
  option_group_id: number;
  additional_price: number;
};

export type AssignedDesignProductOptionGroup = {
  id: number;
  code: string;
  name: string;
  options: AssignedDesignProductOption[];
  created_at: string;
  product_id: number;
  sort_order: number;
  updated_at: string;
  is_required: boolean;
  display_type: string;
  info_content: string | null;
  info_icon_enabled: boolean;
  erp_option_group_id: number | null;
  product_option_group_tab: string | null;
};

export type AssignedDesignProductCategory = {
  id: number;
  code: string;
  icon: string | null;
  name: string;
  slug: string;
  image: string | null;
  is_best: boolean;
  name_en: string;
  name_ja: string | null;
  is_active: boolean;
  parent_id: number | null;
  created_at: string;
  created_by: number | null;
  deleted_at: string | null;
  sort_order: number;
  updated_at: string;
  description: string | null;
  banner_image: string | null;
  exposure_order: number | null;
  exposure_end_date: string | null;
  exposure_start_date: string | null;
};

export type AssignedDesignProductSnapshot = {
  id: number;
  sku: string;
  name: string;
  slug: string | null;
  price: number;
  images: string[];
  name_en: string;
  name_ja: string | null;
  category: AssignedDesignProductCategory;
  info_icon: {
    size: string | null;
    paper: string | null;
    design: string | null;
    quantity: string | null;
    printed_color: string | null;
    post_processing: string | null;
  };
  is_active: boolean;
  created_at: string;
  deleted_at: string | null;
  is_popular: boolean;
  sort_order: number;
  updated_at: string;
  view_count: number;
  branch_name: string | null;
  category_id: number;
  client_name: string | null;
  description: string | null;
  is_featured: boolean;
  max_quantity: number;
  min_quantity: number;
  total_rating: number;
  compare_price: number;
  option_groups: AssignedDesignProductOptionGroup[];
  specification: unknown;
  total_reviews: number;
  web_editor_id: number | null;
  average_rating: string;
  exposure_count: number;
  stock_quantity: number;
  is_blank_canvas: boolean;
  allow_web_editor: boolean;
  allow_file_upload: boolean;
  short_description: string | null;
  separate_shipping_fee: number;
  requires_separate_shipping: boolean;
};

export type AssignedDesignItemConfiguration = {
  jobs: string;
  design: ProductInformationDesign;
  sheets: number;
  options: OrderItemOption[];
  attachment: string;
  product_id: number;
  product_sku: string;
  product_name: string;
  product_slug: string | null;
  input_options: OrderItemInputOptions;
  design_preview: string;
  product_name_en: string;
  product_name_ja: string | null;
  production_days: number;
  product_category: string;
  product_snapshot: AssignedDesignProductSnapshot;
  product_category_en: string;
  product_category_ja: string | null;
};

export type AssignedDesignSelectedSpecification = {
  options: OrderItemOption[];
  input_options: OrderItemInputOptions;
  quantity: number;
  multiplier: number;
  unit: string;
};

export type AssignedDesignDetailItem = {
  order_item_id: number;
  item_title: string;
  quantity: number;
  multiplier: number;
  unit: string;
  configuration: AssignedDesignItemConfiguration;
  selected_specification: AssignedDesignSelectedSpecification;
  customer_note: string | null;
  product: {
    id: number;
    name: string;
    slug: string | null;
    sku: string;
    images: string[];
  };
  design: {
    title: string;
    source_type: SOURCE_TYPE;
    width_mm: number | null;
    height_mm: number | null;
    preview_image_url: string | null;
    preview_pdf_url: string | null;
    metadata: unknown;
  };
  design_mode_code: SOURCE_TYPE;
  status: AssignedDesignStatus;
  assigned_designer: { id: number; username: string; name: string };
  final_file: unknown;
  versions: AssignedDesignVersion[];
};

export type AssignedDesignDetail = {
  order_number: string;
  order_status: OrderStatus;
  requires_admin_approval: boolean;
  items: AssignedDesignDetailItem[];
};

export type sendDesignReviewRESP = {
  review_url: string;
  expires_at: string;
};
