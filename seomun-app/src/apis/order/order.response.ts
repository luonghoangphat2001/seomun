export type OrderTotals = {
  subtotal: string;
  discount: string;
  tax: string;
  shipping_fee: string;
  total: string;
  point_used: number;
};

export type OrderProduct = {
  id: number;
  name: string;
  design_mode: {
    id: number;
    name: string;
  };
};

export type OrderUser = {
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

export type ContactInfo = {
  name: string;
  postcode: string;
  address: string;
  address_detail: string;
  phone: string;
  phone2: string;
  tel: string;
  email: string;
  company_name: string;
};

export type ShippingInfo = {
  name: string;
  phone: string;
  cellphone_number: string;
  phone2: string;
  postcode: string;
  address: string;
  address_detail: string;
  method: string;
  email: string;
};

export type SenderInfo = {
  sender_name: string;
  sender_phone: string;
  sender_zipcode: string;
  sender_address: string;
  sender_address2: string;
};

export type OrderMetadata = {
  selected_options: SelectedOption[];
  estimated_production_days: number;
  requested_delivery_date: string | null;
  placed_at: string;
  customer_note: string | null;
  estimated_points_earned: number | null;
};

export type SelectedOption = {
  group_id: number;
  option_id: number;
};

export type OrderItem = {
  id: number;
  product_id: number;
  product_quantity_price_id: number;

  title: string;
  quantity: number;
  number_of_cases: number;
  multiplier: number;
  total_quantity: number;

  unit: string;
  production_days: number;

  unit_price: string;
  total_price: string;

  design_id: number | null;

  design_ids: {
    front: number | null;
    back: number | null;
  };

  options: OrderItemOption[];

  configuration: OrderItemConfiguration;

  product_snapshot: ProductSnapshot;

  notes: string | null;
};

export type OrderItemOption = {
  id: number;
  name: string;
  value: string;
};

export type OrderItemConfiguration = {
  jobs: string;
  size: string;
  paper: string;
  sheets: number;
  coating: string;
  finishing: string;
  attachment: string;
  product_name: string;
  print_surface: string;
  design_preview: string;
  product_category: string;
};

export type ProductSnapshot = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  category: string;

  specification: {
    size: string;
    paper: string;
    print_surface: string;
    coating: string;
    finishing: string;
  };
};

export type OrderCreateRESP = {
  id: number;
  order_number: string;
  order_external_number: string;
  payment_method: string;
  status: string;
  payment_status: string;
  shipping_fee_type: string;
  shipping_branch_name: string;
  shipping_time: string | null;
  amount_shipping: string;
  currency: string;

  totals: OrderTotals;
  product: OrderProduct;
  user: OrderUser;

  contact: ContactInfo;
  shipping: ShippingInfo;
  sender: SenderInfo;

  metadata: OrderMetadata;
  items: OrderItem[];

  created_at: string;
  updated_at: string;
};

export type OrderCreateResponse = {
  order: OrderCreateRESP;
};

export type OrderDesignReviewItem = {
  order_item_id: number;
  item_title: string;
  version_id: number;
  version: number;
  file_name: string;
  file_url: string;
  designer_note: string;
  customer_response: string;
  customer_note: string | null;
};

export type OrderDesignReviewRESP = {
  order_number: number;
  expires_at: string;
  total_items: number;
  remaining_items: number;
  items: OrderDesignReviewItem[];
};
