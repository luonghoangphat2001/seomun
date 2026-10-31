import { VerifyCodeType } from '@/enums/auth';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

type TFunction = ReturnType<typeof useTranslations>;

export const createLoginSchema = (tAuth: TFunction, tValidation: TFunction) =>
  z.object({
    username: z.string().min(1, tValidation('required', { field: tAuth('id') })),
    password: z.string().min(6, tValidation('min_length', { field: tAuth('password'), length: 6 })),
    remember: z.boolean(),
  });

export const createFindIdSchema = (tAuth: TFunction, tValidation: TFunction) =>
  z
    .object({
      findType: z.enum(VerifyCodeType),
      name: z.string().optional(),
      emailId: z.string().optional(),
      emailDomain: z.string().optional(),
      emailDomainSelect: z.string().optional(),
      cellphone1: z.string().optional(),
      cellphone2: z.string().optional(),
      cellphone3: z.string().optional(),
      company_name: z.string().optional(),
      representative_name: z.string().optional(),
      business_registration_number: z.string().optional(),
    })
    .superRefine((val, ctx) => {
      if (val.findType === VerifyCodeType.EMAIL) {
        if (!val.name || val.name.trim() === '') {
          ctx.addIssue({
            path: ['name'],
            code: 'custom',
            message: tValidation('required', { field: tAuth('name') }),
          });
        }
        if (!val.emailId) {
          ctx.addIssue({
            path: ['emailId'],
            code: 'custom',
            message: tValidation('required', { field: tAuth('email') }),
          });
        }
        if (!val.emailDomain) {
          ctx.addIssue({
            path: ['emailDomain'],
            code: 'custom',
            message: tValidation('required', { field: tAuth('email') }),
          });
        }
      } else if (val.findType === VerifyCodeType.MOBILE) {
        if (!val.name || val.name.trim() === '') {
          ctx.addIssue({
            path: ['name'],
            code: 'custom',
            message: tValidation('required', { field: tAuth('name') }),
          });
        }
        if (!val.cellphone1) {
          ctx.addIssue({
            path: ['cellphone1'],
            code: 'custom',
            message: tValidation('required', { field: tAuth('phone_number') }),
          });
        }
        if (!val.cellphone2) {
          ctx.addIssue({
            path: ['cellphone2'],
            code: 'custom',
            message: tValidation('required', { field: tAuth('phone_number') }),
          });
        }
        if (!val.cellphone3) {
          ctx.addIssue({
            path: ['cellphone3'],
            code: 'custom',
            message: tValidation('required', { field: tAuth('phone_number') }),
          });
        }
      } else if (val.findType === VerifyCodeType.BUSINESS) {
        if (!val.company_name || val.company_name.trim() === '') {
          ctx.addIssue({
            path: ['company_name'],
            code: 'custom',
            message: tValidation('required', { field: tAuth('company_name') }),
          });
        }
        if (!val.representative_name || val.representative_name.trim() === '') {
          ctx.addIssue({
            path: ['representative_name'],
            code: 'custom',
            message: tValidation('required', { field: tAuth('representative_name') }),
          });
        }
        if (!val.business_registration_number || val.business_registration_number.trim() === '') {
          ctx.addIssue({
            path: ['business_registration_number'],
            code: 'custom',
            message: tValidation('required', { field: tAuth('business_registration_number') }),
          });
        }
      }
    });

export const createFindPasswordSchema = (tAuth: TFunction, tValidation: TFunction) =>
  z
    .object({
      findType: z.enum(['email', 'phone']),
      name: z.string().min(1, tValidation('required', { field: tAuth('name') })),
      id: z.string().min(1, tValidation('required', { field: tAuth('id') })),
      emailId: z.string().optional(),
      emailDomain: z.string().optional(),
      emailDomainSelect: z.string().optional(),
      cellphone1: z.string().optional(),
      cellphone2: z.string().optional(),
      cellphone3: z.string().optional(),
    })
    .superRefine((val, ctx) => {
      if (val.findType === 'email') {
        if (!val.emailId) {
          ctx.addIssue({
            path: ['emailId'],
            code: 'custom',
            message: tValidation('required', { field: tAuth('email') }),
          });
        }
        if (!val.emailDomain) {
          ctx.addIssue({
            path: ['emailDomain'],
            code: 'custom',
            message: tValidation('required', { field: tAuth('email') }),
          });
        }
      } else {
        if (!val.cellphone1) {
          ctx.addIssue({
            path: ['cellphone1'],
            code: 'custom',
            message: tValidation('required', { field: tAuth('phone_number') }),
          });
        }
        if (!val.cellphone2) {
          ctx.addIssue({
            path: ['cellphone2'],
            code: 'custom',
            message: tValidation('required', { field: tAuth('phone_number') }),
          });
        }
        if (!val.cellphone3) {
          ctx.addIssue({
            path: ['cellphone3'],
            code: 'custom',
            message: tValidation('required', { field: tAuth('phone_number') }),
          });
        }
      }
    });

export const createChangePasswordSchema = (tAuth: TFunction, tValidation: TFunction) =>
  z
    .object({
      password: z
        .string()
        .min(6, tValidation('min_length', { field: tAuth('password'), length: 6 }))
        .max(20, tValidation('max_length', { field: tAuth('password'), length: 20 }))
        .regex(/^(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*_]{6,20}$/, tAuth('password_rule_message')),
      confirmPassword: z.string().min(1, tValidation('required', { field: tAuth('verify_password') })),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: tValidation('password_not_match'),
      path: ['confirmPassword'],
    });

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
export type FindIdFormValues = z.infer<ReturnType<typeof createFindIdSchema>>;
export type FindPasswordFormValues = z.infer<ReturnType<typeof createFindPasswordSchema>>;
export type ChangePasswordFormValues = z.infer<ReturnType<typeof createChangePasswordSchema>>;
