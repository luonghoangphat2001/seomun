export interface UpdateProfileREQ {
  name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  postcode?: string;
  address?: string;
  detailed_address?: string;
  headquarters?: string;
  business_office?: string;
  team?: string;
  position?: string;
  agree_sms?: boolean;
  agree_email?: boolean;
  company_name?: string;
  business_registration_number?: string;
  representative_name?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  business_type?: string;
  business_items?: string;
  industry_type?: string;
  business_postcode?: string;
  business_address?: string;
  business_detailed_address?: string;
  tax_invoice_email?: string;
  homepage_url?: string;
  business_registration_file?: string;
}

export interface UpdatePasswordREQ {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface UploadBusinessRegistrationFileREQ {
  file: File;
}

export type SwitchToBusinessREQ = {
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
};
