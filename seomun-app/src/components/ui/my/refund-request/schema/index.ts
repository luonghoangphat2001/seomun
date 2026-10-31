import { TFunction } from '@/types';
import { z } from 'zod';

export const refundRequestSchema = (t: TFunction) =>
  z.object({
    order: z.string().min(1, t('validation.select_required', { field: t('inquiry.order_number') })),
    title: z.string().min(1, t('validation.required', { field: t('inquiry.title') })),
    detail: z.string().min(1, t('validation.required', { field: t('inquiry.detail') })),
    manager: z.string().optional(),
    phone: z.string().optional(),
    files: z.array(z.any()).optional(),
  });

export type refundRequestFormValues = z.infer<ReturnType<typeof refundRequestSchema>>;

export const refundRequestDefault: refundRequestFormValues = {
  order: '',
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
