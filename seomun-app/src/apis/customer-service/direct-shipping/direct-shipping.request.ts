import { PaginationREQ } from '@/types';

export type DirectShippingSearchBy = 'entire' | 'shipping_name' | 'recipient_name' | 'phone' | 'address' | 'status';

export type DirectShippingListREQ = PaginationREQ & {
  search?: string;
  search_by?: DirectShippingSearchBy;
  status?: 'pending' | 'cancelled' | 'confirmed';
};

export type DirectShippingSearchFiltersREQ = void;

export type DirectShippingCreateREQ = {
  shipping_name: string;
  recipient_name: string;
  phone?: string;
  postcode?: string;
  address: string;
  detailed_address?: string;
  storage_location?: string;
  file?: File | Blob;
  detail_request: string;
  amount?: number;
};
