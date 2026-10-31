import { UserMemberType } from '@/enums/user';

export interface User {
  id: number;
  username: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  mobile: string;
  postcode: string;
  address: string;
  detailed_address: string;
  headquarters: string;
  business_office: string;
  team: string;
  position: string;
  member_type: UserMemberType;
  customer_id?: number;
  customer?: {
    id: number;
    company_name: string;
    business_registration_number: string;
    representative_name: string;
    industry_type: string;
    business_type: string;
    postcode: string;
    address: string;
    detailed_address: string;
    tax_invoice_email: string;
    homepage_url: string;
  };
}

export interface Membership {
  id: number;
  name: string;
  threshold_amount: number;
  accumulation_rate: number;
  has_free_shipping: boolean;
  required_amount?: number;
}
