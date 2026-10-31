import { OrderHistoryStatus, OrderProofStatus, OrderShippingMethod } from '@/enums/order';

export type OrderProductRESP = {
  id: number;
  name: string;
  description?: string | null;
  images?: string | null;
};
export type Group = {
  id: number;
  code: string;
  name: string;
};

export type Option = {
  id: number;
  label: string;
  value: string;
  additional_price: number;
};
export type OrderOptionItem = {
  group: Group;
  option: Option;
};
export type OrderRESP = {
  id: number;
  order_number: string;
  status?: string;
  status_label_ko?: string;
  created_at?: string;
  updated_at?: string;
  product?: OrderProductRESP | null;
  items?: {
    options: OrderOptionItem[];
    configuration: OrderHistoryItemConfigurationRESP;
    product_snapshot?: OrderHistoryItemProductSnapshotRESP;
  }[];
};

export type OrderListRESP = {
  orders: OrderRESP[];
};

//----------------------------------

export type OrderHistoryDesignFileRESP = {
  id: number;
  url: string;
  mime: string;
  name: string;
  size: number | string;
  metadata: unknown | null;
  created_at: string;
  updated_at: string;
  print_as_is: boolean;
  design_group_id: number;
  print_without_proof: boolean;
};

export type OrderHistoryConfirmedFileRESP = {
  name: string;
  url: string;
  confirmed_at: string;
};

export type OrderHistoryDesignRESP = {
  file_design: OrderHistoryDesignFileRESP | null;
  editor_design: {
    back: unknown | null;
    front: unknown | null;
  };
};

export type OrderHistoryOptionRESP = {
  group?: {
    id: number;
    code: string;
    name: string;
  } | null;
  option?: {
    id: number;
    label: string;
    value: string;
    additional_price: number | string;
  } | null;
};

export type OrderHistoryProductSpecRESP = {
  jobs: string;
  design: OrderHistoryDesignRESP;
  sheets: string | number;
  options: (OrderHistoryOptionRESP | null)[];
  attachment: string;
  product_id: number;
  product_sku: string;
  cart_item_id: number;
  product_name: string;
  product_slug: string;
  input_options: {
    width: number;
    height: number;
  };
  design_preview: string;
  product_name_en: string;
  product_name_ja: string;
  product_category: string;
  product_category_en: string;
  product_category_ja: string;
  production_time_days: number;
};

export type OrderHistoryRESP = {
  order_number: string;
  ordered_at: string;
  thumbnail_url: string | null;
  product_name: string;
  product_spec: OrderHistoryProductSpecRESP;
  quantity: number;
  amount: number | string;
  status: OrderHistoryStatus;
  status_label: string;
  proof_status: string | null;
  invoice_number: string | null;
  can_track_delivery: boolean;
  review: {
    has_review: boolean;
    review_id: number | null;
  };
  items: OrderHistoryOrderItemRESP[];
};

export type OrderHistoryListRESP = {
  orders: OrderHistoryRESP[];
};

export type OrderHistoryUserRESP = {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  mobile: string;
  status: string;
  authority: string;
  postcode: string;
  address: string;
  detailed_address: string;
  headquarters: string | null;
  business_office: string | null;
  team: string | null;
  position: string | null;
  agree_privacy: boolean;
  agree_terms: boolean;
  agreed_at: string;
  email_verified_at: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderHistoryPaymentTransactionRESP = {
  id: number;
  order_id: number;
  transaction_id: string;
  pg_transaction_id: string | null;
  pg_name: string | null;
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
  pg_request: Record<string, unknown> | null;
  pg_response: Record<string, unknown> | null;
  refund_reason: string | null;
  paid_at: string | null;
  failed_at: string | null;
  refunded_at: string | null;
  metadata: Record<string, unknown> | null;
  tax_invoice_status: string | null;
  tax_invoice_issued_at: string | null;
  cash_receipt_status: string | null;
  cash_receipt_issued_at: string | null;
  receipt_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderHistoryDetailProductRESP = {
  id: number;
  name: string;
  description: string | null;
  short_description: string | null;
  images: string | null;
};

export type OrderHistoryContactRESP = {
  name: string;
  postcode: string;
  address: string;
  address_detail: string;
  phone: string;
  phone2: string | null;
  tel: string | null;
  email: string;
  company_name: string | null;
};

export type OrderHistoryShippingRESP = {
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
};

export type OrderHistorySenderRESP = {
  sender_name: string;
  sender_phone: string;
  sender_zipcode: string;
  sender_address: string;
  sender_address2: string;
};

export type OrderHistoryItemDesignSideRESP = {
  id: number;
  side: string;
  layout_data: Record<string, unknown> | null;
  layout_s3_path: string | null;
  logo_path: string | null;
  preview_image_path: string | null;
  created_at: string;
  updated_at: string;
  design_group_id: number;
  cutline_image_url: string | null;
};

export type OrderHistoryItemDesignRESP = {
  front: OrderHistoryItemDesignSideRESP | null;
  back: OrderHistoryItemDesignSideRESP | null;
  file: OrderHistoryDesignFileRESP | null;
  confirmed_file: OrderHistoryConfirmedFileRESP | null;
};

export type OrderHistoryItemProductSnapshotRESP = {
  id: number;
  name: string;
  name_en: string | null;
  name_ja: string | null;
  slug: string;
  sku: string;
  category: string;
  category_en: string | null;
  category_ja: string | null;
  specification: unknown[] | Record<string, unknown>;
  first_image?: string;
};

export type OrderHistoryItemConfigurationDesignGroupRESP = {
  id: number;
  title: string;
  user_id: number;
  metadata: unknown | null;
  order_id: number | null;
  width_mm: number | null;
  height_mm: number | null;
  created_at: string;
  product_id: number;
  updated_at: string;
  rejected_at: string | null;
  source_type: string;
  confirmed_at: string | null;
  order_item_id: number | null;
  order_artworks: unknown[];
  size_option_id: number | null;
  preview_pdf_url: string | null;
  upload_artworks: OrderHistoryDesignFileRESP[];
  rejection_reason: string | null;
  revised_file_name: string | null;
  revised_file_path: string | null;
  preview_image_path: string | null;
  confirmation_requested_at: string | null;
};

export type OrderHistoryItemConfigurationDesignRESP = {
  file_design: OrderHistoryDesignFileRESP | null;
  design_group: OrderHistoryItemConfigurationDesignGroupRESP | null;
  editor_design: {
    back: OrderHistoryItemDesignSideRESP | null;
    front: OrderHistoryItemDesignSideRESP | null;
  };
};

export type OrderHistoryItemConfigurationRESP = {
  jobs: string;
  size: string;
  paper: string;
  sheets: string | number;
  attachment: string;
  product_name: string;
  design_preview: string;
  product_category: string;
  design: OrderHistoryItemConfigurationDesignRESP;
};

export type OrderHistoryOrderItemRESP = {
  id: number;
  product_id: number;
  title: string;
  quantity: number;
  number_of_cases: number;
  multiplier: number;
  total_quantity: number;
  unit: string;
  production_days: number;
  unit_price: string;
  total_price: string;
  design: OrderHistoryItemDesignRESP;
  options: (OrderHistoryOptionRESP | null)[];
  input_options: {
    width: number;
    height: number;
    additional_page_count?: number;
    colored_page_count_1?: number;
    colored_page_count_2?: number;
    cover_page_count?: number;
    flyleaf_count?: number;
    inner_page_count?: number;
  } | null;
  product_snapshot: OrderHistoryItemProductSnapshotRESP;
  configuration: OrderHistoryItemConfigurationRESP;
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
};

export type OrderHistoryShipmentItemRESP = {
  id: number;
  product_name: string;
  quantity: number;
};

export type OrderHistoryShipmentRESP = {
  id: number;
  type: string;
  type_label_ko: string;
  status: string;
  status_label_ko: string;
  tracking_number: string | null;
  carrier_code: string | null;
  carrier_name: string | null;
  shipping_method: string | null;
  memo: string | null;
  shipping_fee: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_postcode: string;
  shipping_address: string;
  shipping_address_detail: string;
  shipped_at: string | null;
  delivered_at: string | null;
  items: OrderHistoryShipmentItemRESP[];
};

export type OrderHistoryItemRESP = {
  id: number;
  user: OrderHistoryUserRESP;
  order_number: string;
  order_external_number: string | null;
  payment_method: string;
  payment_transaction: OrderHistoryPaymentTransactionRESP | null;
  status: OrderHistoryStatus;
  status_label_ko: string;
  status_label_en: string;
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
  totals: {
    subtotal: string;
    discount: string;
    tax: string;
    shipping_fee: string;
    total: string;
  };
  product: OrderHistoryDetailProductRESP | null;
  design_mode_code: string;
  contact: OrderHistoryContactRESP;
  customer_manager: unknown | null;
  assigned_person: unknown | null;
  shipping: OrderHistoryShippingRESP;
  sender: OrderHistorySenderRESP;
  payment_details: {
    order_amount: string;
    shipping_fee: string;
    payment_amount: string;
    paid_amount: string;
  };
  order_history_storage_until: string | null;
  order_history_storage_days_remaining: number;
  proof: {
    status: string | null;
    confirmed_at: string | null;
    corrections: unknown[];
    file_resubmissions: {
      note: string;
      file_url: string;
      file_name: string;
      submitted_at: string;
    }[];
  };
  metadata: {
    selected_options: unknown[];
    estimated_production_days: number;
    requested_delivery_date: string | null;
    placed_at: string;
    customer_note: string | null;
    box_count: number;
    shipping_weight: number;
  };
  items: OrderHistoryOrderItemRESP[];
  order_shipments: OrderHistoryShipmentRESP[];
  created_at: string;
  updated_at: string;
  reviews: {
    id: number;
    user_id: number;
    product_id: number;
    order_id: number;
    rating: number;
    title: string;
    content: string;
    images: string[];
    is_approved: boolean;
    is_published: boolean;
    created_at: string;
    updated_at: string;
  }[];
};

export type OrderHistoryDetailRESP = {
  order: OrderHistoryItemRESP;
};

export type OrderChangeAddressHistoryRESP = {
  order_number: number;
  versions: {
    revision: number;
    changed_at: string;
    address_book_id: number;
    snapshot: {
      metadata: {
        customer_note: string;
      };
      shipping: {
        name: string;
        email: string | null;
        phone: string;
        method: OrderShippingMethod;
        phone2: string | null;
        address: string;
        postcode: string;
        shipped_date: string | null;
        shipping_memo: string | null;
        address_detail: string | null;
        invoice_number: string | null;
        message_custom: string | null;
        message_preset: string | null;
        shipping_status: string | null;
        cellphone_number: string | null;
        shipping_carrier: string | null;
        shipping_status_label_en: string | null;
        shipping_status_label_ko: string | null;
      };
      shipping_fee: string;
      shipping_time: string;
      shipping_branch_name: string;
    };
  }[];
};

export type OrderHistoryDownloadRESP = {
  history: {
    id: number;
    user_id: number;
    module: string;
    file_name: string;
    file_path: string;
    status: string;
    filters: {
      filter_label: string;
      page: number;
      per_page: number;
      user_id: number;
    };
    created_at: string;
    updated_at: string;
  };
};

export type OrderTrackingDeliveryRESP = {
  tracking_number: number;
  latestStatus: {
    code: number;
    name: string;
    timestamp: string;
  };
  history: {
    status_code: string;
    status_name: string;
    status_date: string;
    agency_name: string;
    agency_tel: string;
    worker_name: string;
    worker_tel: string;
    reason_code: string;
    reason_message: string;
    description: string;
  }[];
};
