import type { TFunction } from 'i18next';
import { z } from 'zod';

import { SortOrder } from '@/enums';
import { FormMode } from '@/enums/form.enum';
import { formatPhoneNumber } from '@/utils/format-phone';

import { AdministratorRole, AdministratorSortField, AdministratorStatus } from '../enums';
import type { AdministratorRESP } from '../api/administrator.response';

export const administratorListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z.enum(AdministratorSortField).optional().catch(undefined),
  sort_order: z.enum(SortOrder).optional().catch(undefined),
  search_term: z.coerce.string().optional().catch(undefined),
});

export type AdministratorListSearch = z.infer<typeof administratorListSearchSchema>;
export type AdministratorSearchFilterValues = {
  search_term: string;
};

export const EMPTY_ADMINISTRATOR_SEARCH_FILTER_VALUES: AdministratorSearchFilterValues = {
  search_term: '',
};

const createBaseAdministratorFormSchema = (tValidation: TFunction<'validation'>, tForm: TFunction<'form'>) =>
  z.object({
    username: z
      .string()
      .trim()
      .min(1, tValidation('required', { field: tForm('administrators.fields.username.label') })),
    name: z
      .string()
      .trim()
      .min(1, tValidation('required', { field: tForm('administrators.fields.name.label') })),
    role: z.enum(AdministratorRole),
    status: z.enum(AdministratorStatus),
    email: z.string().trim(),
    mobile: z
      .string()
      .trim()
      .refine((value) => /^[0-9+\-()\s]+$/.test(value) && value.replace(/\D/g, '').length >= 10, tValidation('administrators.mobile')),
    password: z.string().trim(),
    password_confirmation: z.string().trim(),
    // Single-select in the UI; wrapped into an array payload in the service.
    admin_permission_id: z.string(),
    hire_date: z.date().nullable().optional(),
    resignation_date: z.date().nullable().optional(),
    department: z.string().trim().optional(),
    position: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    bank_name: z.string().trim().optional(),
    account_number: z.string().trim().optional(),
    note: z.string().trim().optional(),
  });

export type AdministratorFormValues = z.infer<ReturnType<typeof createBaseAdministratorFormSchema>>;

export const createAdministratorFormSchema = (mode: FormMode, tValidation: TFunction<'validation'>, tForm: TFunction<'form'>) =>
  createBaseAdministratorFormSchema(tValidation, tForm)
    .extend({
      password:
        mode === FormMode.CREATE
          ? z
              .string()
              .trim()
              .min(1, tValidation('required', { field: tForm('administrators.fields.password.label') }))
          : z.string().trim(),
      admin_permission_id: z.string().min(1, tValidation('required', { field: tForm('administrators.fields.permissions.label') })),
    })
    .superRefine((values, ctx) => {
      if (mode !== 'create') {
        return;
      }

      if (!z.email().safeParse(values.email).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['email'],
          message: tValidation('email'),
        });
      }

      if (values.password_confirmation !== values.password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['password_confirmation'],
          message: tValidation('not_match', { field: tForm('administrators.fields.password_confirmation.label') }),
        });
      }
    });

const toFormDate = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getAdministratorFormDefaultValues = (_mode: FormMode, administrator?: AdministratorRESP): AdministratorFormValues => ({
  username: administrator?.username ?? '',
  name: administrator?.name ?? '',
  role: administrator?.authority ?? administrator?.role ?? AdministratorRole.SUPER_ADMIN,
  status: administrator?.status ?? AdministratorStatus.ACTIVE,
  email: administrator?.email ?? '',
  mobile: formatPhoneNumber(administrator?.mobile),
  password: '',
  password_confirmation: '',
  admin_permission_id: administrator?.admin_permissions?.[0]?.admin_permission_id
    ? String(administrator.admin_permissions[0].admin_permission_id)
    : '',
  hire_date: toFormDate(administrator?.hire_date),
  resignation_date: toFormDate(administrator?.resignation_date),
  department: administrator?.department ?? '',
  position: administrator?.position ?? '',
  phone: formatPhoneNumber(administrator?.phone),
  bank_name: administrator?.bank_name ?? '',
  account_number: administrator?.account_number ?? '',
  note: administrator?.note ?? '',
});

export const createAdministratorUpdatePasswordFormSchema = (tValidation: TFunction<'validation'>, tForm: TFunction<'form'>) =>
  z
    .object({
      password: z
        .string()
        .trim()
        .min(1, tValidation('required', { field: tForm('administrators.fields.password.label') })),
      password_confirmation: z.string().trim(),
    })
    .superRefine((values, ctx) => {
      if (values.password_confirmation !== values.password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['password_confirmation'],
          message: tValidation('not_match', { field: tForm('administrators.fields.password_confirmation.label') }),
        });
      }
    });

export type AdministratorUpdatePasswordFormValues = z.infer<ReturnType<typeof createAdministratorUpdatePasswordFormSchema>>;

export const EMPTY_ADMINISTRATOR_UPDATE_PASSWORD_FORM_VALUES: AdministratorUpdatePasswordFormValues = {
  password: '',
  password_confirmation: '',
};
