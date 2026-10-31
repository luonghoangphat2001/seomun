import type { PaginationRequest } from '@/types/api';

export type OutsourcingSearchType = 'name' | 'work_details' | 'representative_name' | 'email' | 'contact' | 'address';

export interface OutsourcingListREQ extends PaginationRequest {
  search_type?: OutsourcingSearchType;
  keyword?: string;
  is_active?: 0 | 1;
}

export interface OutsourcingCreateREQ {
  name: string;
  work_details: string;
  representative_name: string;
  email: string;
  contact: string;
  address: string;
  registration_number: string;
  registration_certificate?: string | null;
  memo?: string | null;
  is_active: boolean;
}

export type OutsourcingUpdateREQ = Partial<OutsourcingCreateREQ>;
