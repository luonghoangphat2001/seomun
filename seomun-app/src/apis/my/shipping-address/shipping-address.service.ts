'use client';

import { ShippingAddressFormValues } from '@/components/ui/my/order/schema';
import { ShippingAddressCreateREQ, ShippingAddressListREQ, ShippingAddressUpdateREQ } from './shipping-address.request';
import { ShippingAddressRESP } from './shipping-address.response';
import { splitPhonePattern } from '@/lib/utils';
// import { ShippingAddressFilterOptions } from '@/enums/shipping-address';
import { DELIVERY_MESSAGE_MANUAL, PAGINATION } from '@/constants/common';

export const getInitFilterShippingAddress = (searchParams: URLSearchParams): ShippingAddressListREQ => {
  return {
    page: Number(searchParams.get('page')) || PAGINATION.DEFAULT_PAGE,
    per_page: Number(searchParams.get('per_page')) || PAGINATION.DEFAULT_PAGE_SIZE,
    search: searchParams.get('search') || undefined,
    // search_type: searchParams.get('search_type') || ShippingAddressFilterOptions.SHIPPING_ADDRESS,
  };
};

export const transformShippingAddressFormValuesToCreateREQ = (input: ShippingAddressFormValues): ShippingAddressCreateREQ => {
  return {
    recipient: input.ordererName,
    phone: `${input.phoneHead}${input.phoneBody}${input.phoneTail}`,
    postcode: input.postCode,
    address: input.address,
    detailed_address: input.addressDetail,
    delivery_message_preset: input.messageOption === DELIVERY_MESSAGE_MANUAL ? '' : input.messageOption,
    delivery_message_custom: input.messageNote,
    is_default: input.isDefault || false,
  };
};

export const transformShippingAddressRESPToFormValues = (resp: ShippingAddressRESP): ShippingAddressFormValues => {
  const phoneResult = splitPhonePattern(resp.phone);

  return {
    ordererName: resp.recipient,
    postCode: resp.postcode,
    address: resp.address,
    addressDetail: resp.detailed_address || '',
    phoneHead: phoneResult?.part1 || '',
    phoneBody: phoneResult?.part2 || '',
    phoneTail: phoneResult?.part3 || '',
    messageOption: resp.delivery_message_preset || '',
    messageNote: resp.delivery_message_custom || '',
    isDefault: resp.is_default,
  };
};

export const transformShippingAddressFormValuesToUpdateREQ = (
  input: ShippingAddressFormValues,
  id: number,
): ShippingAddressUpdateREQ => {
  return {
    id,
    recipient: input.ordererName,
    phone: `${input.phoneHead}${input.phoneBody}${input.phoneTail}`,
    postcode: input.postCode,
    address: input.address,
    detailed_address: input.addressDetail,
    delivery_message_preset: input.messageOption === DELIVERY_MESSAGE_MANUAL ? '' : input.messageOption,
    delivery_message_custom: input.messageNote,
    is_default: input.isDefault || false,
  };
};
