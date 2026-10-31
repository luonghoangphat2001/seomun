import { ShippingAddressFilterOptions } from '@/enums/shipping-address';

export const SHIPPING_ADDRESS_FILTER_OPTIONS = [
  { label: 'my.by_delivery_address', value: ShippingAddressFilterOptions.SHIPPING_ADDRESS },
  { label: 'common.recipient', value: ShippingAddressFilterOptions.RECIPIENT },
  { label: 'auth.phone_number', value: ShippingAddressFilterOptions.PHONE_NUMBER },
];
