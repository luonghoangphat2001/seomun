export type ShippingAddressRESP = {
  id: number;
  recipient: string;
  postcode: string;
  zip_code?: string | null;
  address: string;
  detailed_address: string | null;
  phone: string;
  shipping_name?: string | null;
  delivery_address?: string | null;
  deliveryAddress?: string | null;
  delivery_message_custom: string | null;
  delivery_message_preset: string | null;
  is_default: boolean;
  isDefault?: boolean;
};
