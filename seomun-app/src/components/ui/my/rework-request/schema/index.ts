import { TFunction } from '@/types';
import { z } from 'zod';

export const reworkRequestSchema = (t: TFunction) =>
  z.object({
    order: z.string().min(1, t('validation.select_required', { field: t('inquiry.order_number') })),
    title: z.string().min(1, t('validation.required', { field: t('inquiry.title') })),
    detail: z.string().min(1, t('validation.required', { field: t('inquiry.detail') })),
    manager: z.string().optional(),
    phone: z.string().optional(),
    files: z.array(z.any()).optional(),
  });

export type reworkRequestFormValues = z.infer<ReturnType<typeof reworkRequestSchema>>;

export const reworkRequestDefault: reworkRequestFormValues = {
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
