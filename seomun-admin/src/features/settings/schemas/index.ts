import type { TFunction } from 'i18next';
import { z } from 'zod';

import type { CompanySettings } from '../api/company-settings.response';
import type { TransactionSettings } from '../api/transaction-settings.response';

// ============================================================================
// Company settings (supplier block of quotations / transaction statements)
// ============================================================================
type CompanyRequiredField = 'company_name' | 'business_registration_number' | 'representative_name' | 'phone' | 'website' | 'address';

// Protocol optional, so "www.example.com" is accepted as well as "https://example.com".
const WEBSITE_PATTERN = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i;

export const createCompanySettingsFormSchema = (tPage: TFunction<'page'>, tValidation: TFunction<'validation'>) => {
  const requiredText = (field: CompanyRequiredField) =>
    z
      .string()
      .trim()
      .min(1, tValidation('required', { field: tPage(`settings.company.fields.${field}`) }));

  return z.object({
    company_name: requiredText('company_name'),
    business_registration_number: requiredText('business_registration_number'),
    representative_name: requiredText('representative_name'),
    phone: requiredText('phone'),
    email: z.union([z.literal(''), z.email(tValidation('email'))]),
    website: requiredText('website').regex(WEBSITE_PATTERN, tValidation('url')),
    address: requiredText('address'),
    business_type: z.string().trim(),
    industry_type: z.string().trim(),
  });
};

export type CompanySettingsFormValues = z.infer<ReturnType<typeof createCompanySettingsFormSchema>>;

export function getCompanySettingsFormDefaultValues(settings?: CompanySettings): CompanySettingsFormValues {
  return {
    company_name: settings?.company_name ?? '',
    business_registration_number: settings?.business_registration_number ?? '',
    representative_name: settings?.representative_name ?? '',
    phone: settings?.phone ?? '',
    email: settings?.email ?? '',
    website: settings?.website ?? '',
    address: settings?.address ?? '',
    business_type: settings?.business_type ?? '',
    industry_type: settings?.industry_type ?? '',
  };
}

// ============================================================================
// Transaction settings (quotation / transaction statement). The logo has its own upload endpoint.
// ============================================================================
export const createTransactionSettingsFormSchema = (tValidation: TFunction<'validation'>) =>
  z.object({
    address: z.string().trim(),
    email: z.union([z.literal(''), z.email(tValidation('email'))]),
    phone_number: z.string().trim(),
  });

export type TransactionSettingsFormValues = z.infer<ReturnType<typeof createTransactionSettingsFormSchema>>;

export function getTransactionSettingsFormDefaultValues(settings?: TransactionSettings): TransactionSettingsFormValues {
  return {
    address: settings?.address ?? '',
    email: settings?.email ?? '',
    phone_number: settings?.phone_number ?? '',
  };
}
