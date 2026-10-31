import { VerifyCodePurpose, VerifyCodeType } from '@/enums/auth';
import { UserMemberType } from '@/enums/user';

export interface LoginREQ {
  username: string;
  password: string;
  remember: boolean;
}

export interface RegisterREQ {
  member_type: UserMemberType;
  name: string;
  username: string;
  password: string;
  password_confirmation: string;
  email: string;
  mobile: string;
  phone?: string;
  postcode?: string;
  address?: string;
  detail_address?: string;
  agree_privacy?: boolean;
  agree_terms?: boolean;
  agree_sms?: boolean;
  agree_email?: boolean;
  company_name?: string;
  business_registration_number?: string;
  representative_name?: string;
  industry_type?: string;
  business_type?: string;
  business_postcode?: string;
  business_address?: string;
  business_address_detail?: string;
  tax_invoice_email?: string;
  homepage_url?: string;
  business_registration_file?: File;
}

export interface SendVerifyCodeREQ {
  type: VerifyCodeType;
  purpose: VerifyCodePurpose;
  name?: string;
  username?: string;
  mobile?: string;
  email?: string;
}

export interface VerifyCodeREQ extends SendVerifyCodeREQ {
  code: string;
}

export interface FindIdREQ {
  name?: string;
  username?: string;
  type: VerifyCodeType;
  email?: string;
  mobile?: string;
  verification_code?: string;
  company_name?: string;
  business_registration_number?: string;
  representative_name?: string;
}

export interface ResetPasswordWithCodeREQ {
  username: string;
  name: string;
  type: VerifyCodeType;
  email?: string;
  mobile?: string;
  verification_code?: string;
  password: string;
  password_confirmation: string;
}

export type LoginSocialREQ = {
  provider: string;
  code: string;
};
