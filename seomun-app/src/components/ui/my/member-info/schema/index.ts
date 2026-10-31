import { UserMemberType } from '@/enums/user';
import { TFunction } from '@/types';
import { z } from 'zod';

export const confirmPasswordSchema = (t: TFunction) =>
  z.object({
    username: z.string().min(1, t('validation.required', { field: t('auth.id') })),
    password: z
      .string()
      .min(6, t('validation.min_length', { field: t('auth.password'), length: 6 }))
      .max(20, t('validation.max_length', { field: t('auth.password'), length: 20 }))
      .regex(/^(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*_]{6,20}$/, t('auth.password_rule_message')),
  });

export type ConfrimPasswordFormValues = z.infer<ReturnType<typeof confirmPasswordSchema>>;

export const confirmPasswordDefault: ConfrimPasswordFormValues = {
  username: '',
  password: '',
};

export const switchToBusinessSchema = (t: TFunction) =>
  z.object({
    bizRegNumber: z.string().min(1, t('validation.required', { field: t('auth.business_registration_number') })),
    companyName: z.string().min(1, t('validation.required', { field: t('auth.company_name') })),
    ceoName: z.string().min(1, t('validation.required', { field: t('auth.representative_name') })),
    industry: z.string().min(1, t('validation.required', { field: t('auth.industry') })),
    bizType: z.string().min(1, t('validation.required', { field: t('auth.business_type') })),
    bizZipCode: z.string().min(1, t('validation.required', { field: t('auth.address') })),
    bizAddress: z.string().min(1, t('validation.required', { field: t('auth.address') })),
    bizDetailedAddress: z.string().optional(),
    taxEmail: z
      .string()
      .min(1, t('validation.required', { field: t('auth.email') }))
      .email(t('validation.invalid_email')),
    homepage: z.url(t('validation.invalid_url')).or(z.literal('')).optional(),
    bizCertificate: z
      .array(z.any())
      .min(1, t('validation.select_required', { field: t('auth.business_registration_certificate') })),
  });

export type SwitchToBusinessFormValues = z.infer<ReturnType<typeof switchToBusinessSchema>>;

export const switchToBusinessDefault: SwitchToBusinessFormValues = {
  bizRegNumber: '',
  companyName: '',
  ceoName: '',
  industry: '',
  bizType: '',
  bizZipCode: '',
  bizAddress: '',
  bizDetailedAddress: '',
  taxEmail: '',
  homepage: '',
  bizCertificate: [],
};

export const editMemberInfoSchema = (t: TFunction) =>
  z
    .object({
      memberType: z.enum(UserMemberType),
      username: z.string().optional(),
      password: z.string().optional(),
      verifyPassword: z.string().optional(),
      name: z.string().min(1, t('validation.required', { field: t('common.orderer') })),
      cellphonePrefix: z.string().min(1, t('validation.select_required', { field: t('auth.cellphone') })),
      cellphone1: z
        .string()
        .min(3, t('validation.min_length', { field: t('auth.cellphone'), length: 3 }))
        .max(4, t('validation.max_length', { field: t('auth.cellphone'), length: 4 })),
      cellphone2: z
        .string()
        .min(4, t('validation.min_length', { field: t('auth.cellphone'), length: 4 }))
        .max(4, t('validation.max_length', { field: t('auth.cellphone'), length: 4 })),
      landlinePrefix: z.string().optional(),
      landline1: z.string().optional(),
      landline2: z.string().optional(),
      zipCode: z.string().min(1, t('validation.required', { field: t('auth.address') })),
      address: z.string().min(1, t('validation.required', { field: t('auth.address') })),
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
      homepage: z.string().optional(),
      bizCertificate: z.array(z.any()).optional(),
    })
    .refine((data) => data.password === data.verifyPassword, {
      message: t('validation.password_not_match'),
      path: ['verifyPassword'],
    })
    .superRefine((data, ctx) => {
      if (data.memberType === UserMemberType.BUSINESS) {
        if (!data.bizRegNumber) {
          ctx.addIssue({
            code: 'custom',
            message: t('validation.required', { field: t('auth.business_registration_number') }),
            path: ['bizRegNumber'],
          });
        }
        if (!data.companyName) {
          ctx.addIssue({
            code: 'custom',
            message: t('validation.required', { field: t('auth.company_name') }),
            path: ['companyName'],
          });
        }
        if (!data.ceoName) {
          ctx.addIssue({
            code: 'custom',
            message: t('validation.required', { field: t('auth.representative_name') }),
            path: ['ceoName'],
          });
        }
        if (!data.industry) {
          ctx.addIssue({
            code: 'custom',
            message: t('validation.required', { field: t('auth.industry') }),
            path: ['industry'],
          });
        }
        if (!data.bizType) {
          ctx.addIssue({
            code: 'custom',
            message: t('validation.required', { field: t('auth.business_type') }),
            path: ['bizType'],
          });
        }
        if (!data.bizZipCode) {
          ctx.addIssue({
            code: 'custom',
            message: t('validation.required', { field: t('auth.address') }),
            path: ['bizZipCode'],
          });
        }
        if (!data.bizAddress) {
          ctx.addIssue({
            code: 'custom',
            message: t('validation.required', { field: t('auth.address') }),
            path: ['bizAddress'],
          });
        }
        if (!data.taxEmail) {
          ctx.addIssue({
            code: 'custom',
            message: t('validation.required', { field: t('auth.email') }),
            path: ['taxEmail'],
          });
        } else if (!z.email().safeParse(data.taxEmail).success) {
          ctx.addIssue({
            code: 'custom',
            message: t('validation.invalid_email'),
            path: ['taxEmail'],
          });
        }
      }
    });

export type EditMemberInfoFormValues = z.infer<ReturnType<typeof editMemberInfoSchema>>;

export const editMemberInfoDefault: EditMemberInfoFormValues = {
  memberType: UserMemberType.BUSINESS,
  username: '',
  password: '',
  verifyPassword: '',

  name: '',
  cellphonePrefix: '',
  cellphone1: '',
  cellphone2: '',
  zipCode: '',
  address: '',
  detailedAddress: '',
  emailId: '',
  emailDomain: '',
  emailDomainSelect: 'direct',

  bizRegNumber: '',
  companyName: '',
  ceoName: '',
  industry: '',
  bizType: '',
  bizZipCode: '',
  bizAddress: '',
  bizDetailedAddress: '',
  taxEmail: '',
  homepage: '',
  bizCertificate: [],
};
