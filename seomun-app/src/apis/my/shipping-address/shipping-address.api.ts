import { api } from '@/config';
import { ShippingAddressCreateREQ, ShippingAddressListREQ, ShippingAddressUpdateREQ } from './shipping-address.request';
import { BaseResponse, PaginationResponse } from '@/types';
import { ShippingAddressRESP } from './shipping-address.response';

const ENDPOINT = {
  GET_LIST: '/mypage/shipping-addresses',
  GET_DETAIL: (id: number) => `${ENDPOINT.GET_LIST}/${id}`,
};

export const ShippingAddressApi = {
  list: (params?: ShippingAddressListREQ) =>
    api.get<PaginationResponse<{ addresses: ShippingAddressRESP[] }>>(ENDPOINT.GET_LIST, { params }),
  detail: (id: number) => api.get<BaseResponse<{ address: ShippingAddressRESP }>>(ENDPOINT.GET_DETAIL(id)),
  create: (body: ShippingAddressCreateREQ) => api.post(ENDPOINT.GET_LIST, body),
  update: (body: ShippingAddressUpdateREQ) => api.put(ENDPOINT.GET_DETAIL(body.id), body),
  delete: (ids: number[]) => api.delete(ENDPOINT.GET_LIST, { ids }),
};
