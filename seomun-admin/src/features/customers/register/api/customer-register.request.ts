export type CustomerMemberType = 'business' | 'individual';

export interface CustomerRegisterREQ {
  member_type: CustomerMemberType;
  name: string;
  username: string;
  password: string;
  password_confirmation: string;
  mobile: string;
  email: string;
  postcode: string;
  address: string;
  detail_address: string;
  note?: string;
  // Business-only — omitted when member_type is 'individual'.
  company_name?: string;
  business_registration_number?: string;
  representative_name?: string;
  industry_type?: string;
  business_type?: string;
  business_postcode?: string;
  business_address?: string;
  tax_invoice_email?: string;
  business_registration_file?: string;
}
