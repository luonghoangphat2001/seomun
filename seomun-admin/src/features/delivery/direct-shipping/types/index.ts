import type { DirectShippingName, DirectShippingStatus } from '../enums';

export type DirectShippingUser = {
  id: number;
  username: string;
  name: string;
  email: string;
  customer: { id: number; company_name: string | null } | null;
};

export type DirectShipping = {
  id: number;
  user_id: number;
  user: DirectShippingUser | null;
  shipping_name: DirectShippingName;
  recipient_name: string;
  phone: string;
  postcode: string;
  address: string;
  detailed_address: string | null;
  storage_location: string | null;
  file_url: string | null;
  file_name: string | null;
  detail_request: string | null;
  amount: number;
  status: DirectShippingStatus;
  status_label: string | null;
  created_at: string;
  updated_at: string;
};
