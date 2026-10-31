import { SortOrder } from '@/enums';
import type { TFunction } from 'i18next';
import { z } from 'zod';

import { CustomerApprovalStatus, CustomerStatus } from '../../enums';
import { CustomerListSortField, CustomerListWireApprovalStatus, CustomerListWireStatus } from '../api/customer-list.request';

const phoneField = (tValidation: TFunction<'validation'>) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || [10, 11].includes(value.replace(/\D/g, '').length), tValidation('customers.phone'));

export const createCustomerBasicInfoFormSchema = (tForm: TFunction, tValidation: TFunction<'validation'>) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, tValidation('required', { field: tForm('form.customers.detail.basic_info.fields.name.label') })),
    email: z.union([z.literal(''), z.string().trim().email(tValidation('email'))]),
    phone: phoneField(tValidation),
    mobile: phoneField(tValidation),
    postcode: z.string().trim(),
    address: z.string().trim(),
    detailed_address: z.string().trim(),
    note: z.string().trim(),
    status: z.enum(CustomerListWireStatus),
  });

export type CustomerBasicInfoFormValues = z.infer<ReturnType<typeof createCustomerBasicInfoFormSchema>>;

export const createCustomerCompanyInfoFormSchema = (tValidation: TFunction<'validation'>) =>
  z.object({
    company_name: z.string().trim(),
    business_registration_number: z.string().trim(),
    representative_name: z.string().trim(),
    industry_type: z.string().trim(),
    business_type: z.string().trim(),
    business_postcode: z.string().trim(),
    business_address: z.string().trim(),
    business_detailed_address: z.string().trim(),
    tax_invoice_email: z.union([z.literal(''), z.string().trim().email(tValidation('email'))]),
    business_registration_file: z.union([z.instanceof(File), z.string(), z.null()]),
  });

export type CustomerCompanyInfoFormValues = z.infer<ReturnType<typeof createCustomerCompanyInfoFormSchema>>;

export type CustomerCompanyInfoSubmitValues = Omit<CustomerCompanyInfoFormValues, 'business_registration_file'> & {
  business_registration_file: string | null;
};

export const createCustomerChangePasswordFormSchema = (tForm: TFunction, tValidation: TFunction<'validation'>) =>
  z
    .object({
      new_password: z
        .string()
        .trim()
        .min(1, tValidation('required', { field: tForm('form.customers.detail.change_password.fields.new_password.label') }))
        .min(6, tValidation('min_length', { min: 6 }))
        .max(20, tValidation('max_length', { max: 20 }))
        .refine((value) => /^(?=.*[a-zA-Z])[A-Za-z\d!@#$%^&*_]+$/.test(value), tValidation('customers.password_format')),
      new_password_confirmation: z.string().trim(),
    })
    .refine((values) => values.new_password === values.new_password_confirmation, {
      path: ['new_password_confirmation'],
      message: tValidation('not_match', { field: tForm('form.customers.detail.change_password.fields.new_password_confirmation.label') }),
    });

export type CustomerChangePasswordFormValues = z.infer<ReturnType<typeof createCustomerChangePasswordFormSchema>>;

export const customerListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z.enum(CustomerListSortField).optional().catch(undefined),
  sort_order: z.enum(SortOrder).optional().catch(undefined),
  search_term: z.string().optional().catch(undefined),
  approval_status: z
    .union([z.enum(CustomerListWireApprovalStatus), z.nativeEnum(CustomerApprovalStatus)])
    .optional()
    .catch(undefined),
  status: z
    .union([z.enum(CustomerListWireStatus), z.nativeEnum(CustomerStatus)])
    .optional()
    .catch(undefined),
});

export type CustomerListSearch = z.infer<typeof customerListSearchSchema>;

export const customerDetailSearchSchema = z.object({});

export type CustomerDetailSearch = z.infer<typeof customerDetailSearchSchema>;
