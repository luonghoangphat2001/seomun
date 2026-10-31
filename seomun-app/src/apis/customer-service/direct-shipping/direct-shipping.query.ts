import { useMutation, useQuery, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { BaseResponse, ErrorRESP } from '@/types';
import { DATE_FORMAT } from '@/constants/common';
import { DirectDeliveryStatus } from '@/enums/inquiry';
import { formatDate } from '@/lib/utils';
import { SelectOption } from '@/components/common/select';
import { DirectDeliveryRequest } from '@/types/inquiry';
import { DirectShippingCreateREQ, DirectShippingListREQ } from './direct-shipping.request';
import { DirectShippingCreateRESP, DirectShippingRequestRESP } from './direct-shipping.response';
import { DirectShippingApi } from './direct-shipping.api';

export const DIRECT_SHIPPING_QUERY_KEYS = {
  LIST: 'DIRECT_SHIPPING_LIST',
  SEARCH_FILTERS: 'DIRECT_SHIPPING_SEARCH_FILTERS',
  DETAIL: 'DIRECT_SHIPPING_DETAIL',
};

export const transformDirectShippingRESPToListItem = (resp: DirectShippingRequestRESP): DirectDeliveryRequest => ({
  id: resp.id,
  createdAt: formatDate(resp.created_at, DATE_FORMAT.DEFAULT),
  type: resp.shipping_name,
  name: resp.recipient_name,
  phone: resp.phone,
  address: [resp.postcode ? `[${resp.postcode}]` : '', resp.address, resp.detailed_address].filter(Boolean).join(' '),
  postcode: resp.postcode,
  baseAddress: resp.address,
  detailedAddress: resp.detailed_address,
  detailRequest: resp.detail_request,
  storageLocation: resp.storage_location,
  fileUrl: resp.file_url,
  fileName: resp.file_name,
  status: resp.status === 'pending' ? DirectDeliveryStatus.UNDERREVIEW : (resp.status as DirectDeliveryStatus),
});

export const useDirectShippingListQuery = (params?: DirectShippingListREQ) =>
  useQuery({
    queryKey: [DIRECT_SHIPPING_QUERY_KEYS.LIST, params],
    queryFn: () => DirectShippingApi.list(params),
    select: (resp) => ({
      list: resp.data.items.map(transformDirectShippingRESPToListItem),
      pagination: resp.data.pagination,
    }),
    refetchOnWindowFocus: true,
  });

export const useDirectShippingDetailQuery = (id?: number) =>
  useQuery({
    queryKey: [DIRECT_SHIPPING_QUERY_KEYS.DETAIL, id],
    queryFn: () => DirectShippingApi.detail(id as number),
    select: (resp) => transformDirectShippingRESPToListItem(resp.data),
    enabled: !!id,
  });

export const useDirectShippingSearchFiltersQuery = () =>
  useQuery({
    queryKey: [DIRECT_SHIPPING_QUERY_KEYS.SEARCH_FILTERS],
    queryFn: () => DirectShippingApi.searchFilters(),
    select: (
      resp,
    ): {
      searchByOptions: SelectOption[];
      statusOptions: SelectOption[];
    } => ({
      searchByOptions: resp.data.filters.search_by_options,
      statusOptions: resp.data.filters.status_options,
    }),
  });

export const useDirectShippingCreateMutation = (
  options?: UseMutationOptions<BaseResponse<DirectShippingCreateRESP>, AxiosError<ErrorRESP>, DirectShippingCreateREQ>,
) =>
  useMutation({
    mutationFn: DirectShippingApi.create,
    ...options,
  });
