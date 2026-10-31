import type { PaginationRequest, SortRequest } from '@/types/api';
import type { CustomerApprovalStatus, CustomerStatus } from '../../enums';

export enum CustomerListSortField {
  CREATED_AT = 'created_at',
  NAME = 'name',
  STATUS = 'status',
}

export enum CustomerListWireApprovalStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum CustomerListWireStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  WITHDRAWN = 'withdrawn',
}

export enum CustomerListWireAuthority {
  SUPER_ADMIN = 'super_admin',
  STORE_ADMIN = 'store_admin',
  NORMAL_USER = 'normal_user',
}

export interface CustomerListREQ extends PaginationRequest, SortRequest<CustomerListSortField> {
  search_term?: string;
  approval_status?: CustomerListWireApprovalStatus | CustomerApprovalStatus;
  status?: CustomerListWireStatus | CustomerStatus;
  authority?: CustomerListWireAuthority;
}

export interface CustomerBasicInfoUpdateREQ {
  member_id: number;
  name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  postcode?: string;
  address?: string;
  detailed_address?: string;
  status?: CustomerListWireStatus;
  company_name?: string;
  business_registration_number?: string;
  representative_name?: string;
  industry_type?: string;
  business_type?: string;
  business_postcode?: string;
  business_address?: string;
  business_detailed_address?: string;
  tax_invoice_email?: string;
  business_registration_file?: string;
  note?: string;
}

export interface CustomerChangePasswordREQ {
  member_id: number;
  new_password: string;
}

export type ExportCustomerListREQ =
  | {
      export_type: 'ALL';
      selected_ids?: never;
      current_page?: never;
      per_page?: never;
      locale: string;
      authority?: CustomerListWireAuthority;
      search_term?: string;
      approval_status?: CustomerListWireApprovalStatus;
      status?: CustomerListWireStatus;
      sort_by?: CustomerListSortField;
      sort_order?: CustomerListREQ['sort_order'];
    }
  | {
      export_type: 'CURRENT_PAGE';
      selected_ids?: never;
      current_page: number;
      per_page: number;
      locale: string;
      authority?: CustomerListWireAuthority;
      search_term?: string;
      approval_status?: CustomerListWireApprovalStatus;
      status?: CustomerListWireStatus;
      sort_by?: CustomerListSortField;
      sort_order?: CustomerListREQ['sort_order'];
    }
  | {
      export_type: 'SELECTED';
      selected_ids: number[];
      locale: string;
      authority?: CustomerListWireAuthority;
    };
