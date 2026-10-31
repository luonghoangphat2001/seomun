import { PaginationRESP } from '@/types';
import { DirectDeliveryStatus } from '@/enums/inquiry';

export type DirectShippingSearchFilterOptionRESP = {
  value: string;
  label: string;
};

export type DirectShippingSearchFiltersDataRESP = {
  filters: {
    search_by_options: DirectShippingSearchFilterOptionRESP[];
    status_options: DirectShippingSearchFilterOptionRESP[];
  };
};

export type DirectShippingSearchFiltersRESP = DirectShippingSearchFiltersDataRESP;

export type DirectShippingRequestRESP = {
  id: number;
  shipping_name: string;
  recipient_name: string;
  phone: string;
  postcode: string;
  address: string;
  detailed_address: string;
  storage_location: string;
  file_url: string;
  file_name: string;
  detail_request: string;
  amount: number;
  status: DirectDeliveryStatus | 'pending';
  created_at: string;
};

export type DirectShippingCreateRESP = DirectShippingRequestRESP;

export type DirectShippingDetailRESP = DirectShippingRequestRESP;

export type DirectShippingListRESP = {
  items: DirectShippingRequestRESP[];
  pagination: PaginationRESP;
};
