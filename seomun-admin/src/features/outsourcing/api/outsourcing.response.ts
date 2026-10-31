import type { BaseResponse, PaginationMeta } from '@/types/api';

export interface OutsourcingRESP {
  id: number;
  name: string;
  work_details: string;
  representative_name: string;
  email: string;
  contact: string;
  address: string;
  registration_number: string | null;
  registration_certificate: string | null;
  memo: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type OutsourcingListRESP = BaseResponse<{
  outsourcing_companies: OutsourcingRESP[];
}> & {
  pagination: PaginationMeta;
};

export type OutsourcingDetailRESP = BaseResponse<{
  outsourcing_company: OutsourcingRESP;
}>;

export type CreateOutsourcingRESP = BaseResponse<OutsourcingRESP>;

export type UpdateOutsourcingRESP = BaseResponse<OutsourcingRESP>;

export type DeleteOutsourcingRESP = BaseResponse<{
  message: string;
}>;
