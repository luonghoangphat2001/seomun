import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { UserMemberType } from '@/enums/user';

type TFunction = ReturnType<typeof useTranslations>;

export const createRegisterSchema = (tAuth: TFunction, tValidation: TFunction) =>
  z
    .object({
      memberType: z.enum(UserMemberType),
      termOfService: z.boolean(),
      privacyPolicy: z.boolean(),
      smsReception: z.boolean(),
      emailReception: z.boolean(),

      id: z.string().min(1, tValidation('required', { field: tAuth('id') })),
      password: z
        .string()
        .min(6, tValidation('min_length', { field: tAuth('password'), length: 6 }))
        .max(20, tValidation('max_length', { field: tAuth('password'), length: 20 }))
        .regex(/^(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*_]{6,20}$/, tAuth('password_rule_message')),
      verifyPassword: z.string().min(1, tValidation('required', { field: tAuth('verify_password') })),
      name: z.string().min(1, tValidation('required', { field: tAuth('name') })),
      cellphonePrefix: z.string().min(1, tValidation('select_required', { field: tAuth('cellphone') })),
      cellphone1: z
        .string()
        .min(3, tValidation('min_length', { field: tAuth('cellphone'), length: 3 }))
        .max(4, tValidation('max_length', { field: tAuth('cellphone'), length: 4 })),
      cellphone2: z
        .string()
        .min(4, tValidation('min_length', { field: tAuth('cellphone'), length: 4 }))
        .max(4, tValidation('max_length', { field: tAuth('cellphone'), length: 4 })),
      landlinePrefix: z.string().optional(),
      landline1: z.string().optional(),
      landline2: z.string().optional(),
      zipCode: z.string().min(1, tValidation('required', { field: tAuth('address') })),
      address: z.string().min(1, tValidation('required', { field: tAuth('address') })),
      detailedAddress: z.string().optional(),
      emailId: z.string().optional(),
      emailDomain: z.string().optional(),
      emailDomainSelect: z.string().optional(),

      // Corporate fields
      bizRegNumber: z.string().optional(),
      companyName: z.string().optional(),
      ceoName: z.string().optional(),
      industry: z.string().optional(),
      bizType: z.string().optional(),
      bizZipCode: z.string().optional(),
      bizAddress: z.string().optional(),
      bizDetailedAddress: z.string().optional(),
      taxEmail: z.string().optional(),
      homepage: z.url(tValidation('invalid_url')).or(z.literal('')).optional(),
      bizCertificate: z.array(z.any()),
      recaptchaToken: z.string().min(1, tValidation('recaptcha_required')),
    })
    .refine((data) => data.password === data.verifyPassword, {
      message: tValidation('password_not_match'),
      path: ['verifyPassword'],
    })
    .superRefine((data, ctx) => {
      if (data.memberType === UserMemberType.BUSINESS) {
        if (!data.bizRegNumber) {
          ctx.addIssue({
            code: 'custom',
            message: tValidation('required', { field: tAuth('business_registration_number') }),
            path: ['bizRegNumber'],
          });
        }
        if (!data.companyName) {
          ctx.addIssue({
            code: 'custom',
            message: tValidation('required', { field: tAuth('company_name') }),
            path: ['companyName'],
          });
        }
        if (!data.ceoName) {
          ctx.addIssue({
            code: 'custom',
            message: tValidation('required', { field: tAuth('representative_name') }),
            path: ['ceoName'],
          });
        }
        if (!data.industry) {
          ctx.addIssue({
            code: 'custom',
            message: tValidation('required', { field: tAuth('industry') }),
            path: ['industry'],
          });
        }
        if (!data.bizType) {
          ctx.addIssue({
            code: 'custom',
            message: tValidation('required', { field: tAuth('business_type') }),
            path: ['bizType'],
          });
        }
        if (!data.bizZipCode) {
          ctx.addIssue({
            code: 'custom',
            message: tValidation('required', { field: tAuth('address') }),
            path: ['bizZipCode'],
          });
        }
        if (!data.bizAddress) {
          ctx.addIssue({
            code: 'custom',
            message: tValidation('required', { field: tAuth('address') }),
            path: ['bizAddress'],
          });
        }
        if (!data.taxEmail) {
          ctx.addIssue({
            code: 'custom',
            message: tValidation('required', { field: tAuth('email') }),
            path: ['taxEmail'],
          });
        } else if (!z.email().safeParse(data.taxEmail).success) {
          ctx.addIssue({
            code: 'custom',
            message: tValidation('invalid_email'),
            path: ['taxEmail'],
          });
        }
        if (data.bizCertificate.length === 0) {
          ctx.addIssue({
            code: 'custom',
            message: tValidation('select_required', { field: tAuth('business_registration_certificate') }),
            path: ['bizCertificate'],
          });
        }
      }
    });

export type RegisterSchema = z.infer<ReturnType<typeof createRegisterSchema>>;
