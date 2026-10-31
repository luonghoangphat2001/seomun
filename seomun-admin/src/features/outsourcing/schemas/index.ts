import type { TFunction } from 'i18next';
import { z } from 'zod';

import { FormMode } from '@/enums/form.enum';
import type { OutsourcingRESP } from '@/features/outsourcing/api';

const booleanSearchParamSchema = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((value) => (typeof value === 'boolean' ? value : value === 'true'))
  .optional()
  .catch(undefined);

export const outsourcingListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  search_type: z.enum(['name', 'work_details', 'representative_name', 'email', 'contact', 'address']).optional().catch(undefined),
  keyword: z.string().optional().catch(undefined),
  is_active: booleanSearchParamSchema,
});

export type OutsourcingListSearch = z.infer<typeof outsourcingListSearchSchema>;

export type OutsourcingFormValues = {
  name: string;
  work_details: string;
  representative_name: string;
  email: string;
  contact: string;
  address: string;
  registration_number: string;
  registration_certificate: File | string | null;
  memo: string;
  is_active: boolean;
};

export const createOutsourcingFormSchema = (mode: FormMode, tValidation: TFunction<'validation'>, tForm: TFunction<'form'>) =>
  z
    .object({
      name: z
        .string()
        .trim()
        .min(1, tValidation('required', { field: tForm('outsourcing.fields.company_name.label') })),
      work_details: z
        .string()
        .trim()
        .min(1, tValidation('required', { field: tForm('outsourcing.fields.work_details.label') })),
      representative_name: z
        .string()
        .trim()
        .min(1, tValidation('required', { field: tForm('outsourcing.fields.representative_name.label') })),
      email: z.string().trim().email(tValidation('email')),
      contact: z
        .string()
        .trim()
        .min(1, tValidation('required', { field: tForm('outsourcing.fields.contact.label') }))
        .regex(/^\d*$/, tValidation('numeric_only')),
      address: z
        .string()
        .trim()
        .min(1, tValidation('required', { field: tForm('outsourcing.fields.address.label') })),
      registration_number: z
        .string()
        .trim()
        .min(1, tValidation('required', { field: tForm('outsourcing.fields.registration_number.label') }))
        .regex(/^\d*$/, tValidation('numeric_only')),
      registration_certificate: z.union([z.instanceof(File), z.string(), z.null()]),
      memo: z
        .string()
        .trim()
        .max(500, tValidation('max_length', { max: 500 })),
      is_active: z.boolean(),
    })
    .superRefine((values, ctx) => {
      if (mode === FormMode.CREATE && values.contact.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: tValidation('outsourcing.contact'),
          path: ['contact'],
        });
      }
    });

export const getOutsourcingFormDefaultValues = (mode: FormMode, outsourcing?: OutsourcingRESP): OutsourcingFormValues => ({
  name: outsourcing?.name ?? '',
  work_details: outsourcing?.work_details ?? '',
  representative_name: outsourcing?.representative_name ?? '',
  email: outsourcing?.email ?? '',
  contact: outsourcing?.contact ?? '',
  address: outsourcing?.address ?? '',
  registration_number: outsourcing?.registration_number ?? '',
  registration_certificate: mode === FormMode.CREATE ? null : (outsourcing?.registration_certificate ?? null),
  memo: mode === FormMode.CREATE ? '' : (outsourcing?.memo ?? ''),
  is_active: mode === FormMode.CREATE ? true : (outsourcing?.is_active ?? true),
});
