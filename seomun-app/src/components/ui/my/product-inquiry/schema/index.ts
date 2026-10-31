import { TFunction } from '@/types';
import { z } from 'zod';

export const productInquirySchema = (t: TFunction) =>
  z.object({
    product: z.string().min(1, t('validation.select_required', { field: t('inquiry.product') })),
    title: z.string().min(1, t('validation.required', { field: t('inquiry.title') })),
    detail: z.string().min(1, t('validation.required', { field: t('inquiry.detail') })),
    manager: z.string().optional(),
    phone: z.string().optional(),
    files: z.array(z.any()).optional(),
  });

export type productInquiryFormValues = z.infer<ReturnType<typeof productInquirySchema>>;

export const productInquiryDefault: productInquiryFormValues = {
  product: '',
  title: '',
  detail: '',
  manager: '',
  phone: '',
  files: [],
};

export const additionalInquirySchema = (t: TFunction) =>
  z.object({
    comment: z.string().min(1, t('validation.required', { field: t('inquiry.enter_comment') })),
    files: z.array(z.any()).optional(),
  });

export type AdditionalInquiryFormValues = z.infer<ReturnType<typeof additionalInquirySchema>>;

export const additionalInquiryDefault: AdditionalInquiryFormValues = {
  comment: '',
  files: [],
};
