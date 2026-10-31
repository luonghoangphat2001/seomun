import { api } from '@/config';
import { BaseResponse } from '@/types';
import { DirectShippingCreateREQ, DirectShippingListREQ } from './direct-shipping.request';
import {
  DirectShippingCreateRESP,
  DirectShippingDetailRESP,
  DirectShippingListRESP,
  DirectShippingSearchFiltersRESP,
} from './direct-shipping.response';

const ENDPOINT = {
  LIST: '/customer-service/direct-shipping',
  SEARCH_FILTERS: '/customer-service/direct-shipping/search-filters',
  DETAIL: (id: number) => `/customer-service/direct-shipping/${id}`,
};

export const DirectShippingApi = {
  list: (params?: DirectShippingListREQ) => api.get<BaseResponse<DirectShippingListRESP>>(ENDPOINT.LIST, { params }),
  searchFilters: () => api.get<BaseResponse<DirectShippingSearchFiltersRESP>>(ENDPOINT.SEARCH_FILTERS),
  detail: (id: number) => api.get<BaseResponse<DirectShippingDetailRESP>>(ENDPOINT.DETAIL(id)),
  create: (body: DirectShippingCreateREQ) => {
    const formData = new FormData();

    formData.append('shipping_name', body.shipping_name);
    formData.append('recipient_name', body.recipient_name);

    if (body.phone) {
      formData.append('phone', body.phone);
    }

    if (body.postcode) {
      formData.append('postcode', body.postcode);
    }

    formData.append('address', body.address);

    if (body.detailed_address) {
      formData.append('detailed_address', body.detailed_address);
    }

    if (body.storage_location) {
      formData.append('storage_location', body.storage_location);
    }

    if (body.file) {
      formData.append('file', body.file);
    }

    formData.append('detail_request', body.detail_request);

    if (typeof body.amount === 'number') {
      formData.append('amount', String(body.amount));
    }

    return api.post<BaseResponse<DirectShippingCreateRESP>>(ENDPOINT.LIST, formData);
  },
};
