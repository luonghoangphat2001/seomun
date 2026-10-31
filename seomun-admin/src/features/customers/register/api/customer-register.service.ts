import type { CustomerRegisterSubmitValues } from '../schemas';
import { registerCustomerAPI } from './customer-register.api';
import type { CustomerRegisterREQ } from './customer-register.request';
import type { CustomerRegisterRESP } from './customer-register.response';

export function mapCustomerRegisterFormToRequest(values: CustomerRegisterSubmitValues): CustomerRegisterREQ {
  const base: CustomerRegisterREQ = {
    member_type: values.member_type,
    name: values.name,
    username: values.username,
    password: values.password,
    password_confirmation: values.password_confirmation,
    mobile: values.mobile,
    email: values.email,
    postcode: values.postcode,
    address: values.address,
    detail_address: values.detail_address,
    note: values.note || undefined,
  };

  if (values.member_type !== 'business') {
    return base;
  }

  if (!values.business_registration_file) {
    throw new Error('Business registration file is required');
  }

  return {
    ...base,
    company_name: values.company_name,
    business_registration_number: values.business_registration_number,
    representative_name: values.representative_name,
    industry_type: values.industry_type,
    business_type: values.business_type,
    business_postcode: values.business_postcode,
    business_address: values.business_address,
    tax_invoice_email: values.tax_invoice_email,
    business_registration_file: values.business_registration_file ?? undefined,
  };
}

export async function registerCustomerService(request: CustomerRegisterREQ): Promise<CustomerRegisterRESP> {
  const response = await registerCustomerAPI(request);
  if (response.httpStatus !== 201) {
    throw new Error('Customer registration did not return 201');
  }

  return response;
}
