import { PaginationREQ } from '@/types';

export type ShippingAddressListREQ = PaginationREQ & {
  search_type?: string;
  search?: string;
};

export type ShippingAddressCreateREQ = {
  recipient: string;
  phone: string;
  postcode: string;
  address: string;
  detailed_address?: string;
  delivery_message_preset?: string;
  delivery_message_custom?: string;
  is_default: boolean;
};

export type ShippingAddressUpdateREQ = ShippingAddressCreateREQ & {
  id: number;
};
