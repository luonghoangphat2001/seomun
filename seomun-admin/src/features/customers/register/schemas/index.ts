import type { TFunction } from 'i18next';
import { z } from 'zod';

export const BUSINESS_REGISTRATION_FILE_MAX_SIZE = 10 * 1024 * 1024;
export const BUSINESS_REGISTRATION_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const BUSINESS_REGISTRATION_FILE_ACCEPT = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';

const requiredString = (tValidation: TFunction<'validation'>, field: string) => z.string().trim().min(1, tValidation('required', { field }));

// Required only when member_type is 'business'; enforced in superRefine below.
const BUSINESS_REQUIRED_FIELDS = [
  'company_name',
  'business_registration_number',
  'representative_name',
  'industry_type',
  'business_type',
  'business_postcode',
  'business_address',
] as const;

export const createCustomerRegisterFormSchema = (tForm: TFunction, tValidation: TFunction<'validation'>) =>
  z
    .object({
      member_type: z.enum(['business', 'individual']),
      name: requiredString(tValidation, tForm('form.customers.register.fields.name.label')),
      username: requiredString(tValidation, tForm('form.customers.register.fields.username.label')),
      password: requiredString(tValidation, tForm('form.customers.register.fields.password.label')).min(8, tValidation('min_length', { min: 8 })),
      password_confirmation: requiredString(tValidation, tForm('form.customers.register.fields.password_confirmation.label')),
      mobile: requiredString(tValidation, tForm('form.customers.register.fields.mobile.label')).refine(
        (value) => value.replace(/\D/g, '').length === 11,
        tValidation('customers.phone'),
      ),
      email: requiredString(tValidation, tForm('form.customers.register.fields.email.label')).email(tValidation('email')),
      postcode: requiredString(tValidation, tForm('form.customers.register.fields.postcode.label')),
      address: requiredString(tValidation, tForm('form.customers.register.fields.address.label')),
      detail_address: z.string().trim(),
      note: z.string().trim(),
      company_name: z.string().trim(),
      business_registration_number: z.string().trim(),
      representative_name: z.string().trim(),
      industry_type: z.string().trim(),
      business_type: z.string().trim(),
      business_postcode: z.string().trim(),
      business_address: z.string().trim(),
      tax_invoice_email: z.union([z.literal(''), z.string().trim().email(tValidation('email'))]),
      business_registration_file: z.union([z.instanceof(File), z.string(), z.null()]),
    })
    .refine((values) => values.password === values.password_confirmation, {
      path: ['password_confirmation'],
      message: tValidation('not_match', { field: tForm('form.customers.register.fields.password_confirmation.label') }),
    })
    .superRefine((values, ctx) => {
      if (values.member_type !== 'business') return;

      for (const field of BUSINESS_REQUIRED_FIELDS) {
        if (!values[field]?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: tValidation('required', { field: tForm(`form.customers.register.fields.${field}.label` as never) }),
          });
        }
      }

      if (!values.business_registration_file) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['business_registration_file'],
          message: tValidation('required', { field: tForm('form.customers.register.fields.business_registration_file.label') }),
        });
      }
    });

export type CustomerRegisterFormValues = z.infer<ReturnType<typeof createCustomerRegisterFormSchema>>;

/** Form values after submit uploaded the picked file — the request only ever carries a URL. */
export type CustomerRegisterSubmitValues = Omit<CustomerRegisterFormValues, 'business_registration_file'> & {
  business_registration_file: string | null;
};

export const customerRegisterFormDefaultValues: CustomerRegisterFormValues = {
  member_type: 'business',
  name: '',
  username: '',
  password: '',
  password_confirmation: '',
  mobile: '',
  email: '',
  postcode: '',
  address: '',
  detail_address: '',
  note: '',
  company_name: '',
  business_registration_number: '',
  representative_name: '',
  industry_type: '',
  business_type: '',
  business_postcode: '',
  business_address: '',
  tax_invoice_email: '',
  business_registration_file: null,
};
