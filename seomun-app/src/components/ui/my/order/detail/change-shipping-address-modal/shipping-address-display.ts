import { ShippingAddressRESP } from '@/apis/my/shipping-address/shipping-address.response';

export const getShippingAddressName = (address: ShippingAddressRESP) =>
  address.shipping_name ?? address.delivery_address ?? address.deliveryAddress ?? address.recipient;

export const getShippingAddressPostcode = (address: ShippingAddressRESP) => address.postcode ?? address.zip_code ?? '';

export const getShippingAddressFullAddress = (address: ShippingAddressRESP) => {
  const postcode = getShippingAddressPostcode(address);

  return [postcode ? `[${postcode}]` : '', address.address, address.detailed_address].filter(Boolean).join(' ');
};

export const isDefaultShippingAddress = (address: ShippingAddressRESP) => Boolean(address.is_default || address.isDefault);
