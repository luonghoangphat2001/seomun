import { SortOrder } from '@/enums';
import { z } from 'zod';

import { AnswerChannel, InquiryStatus, InquiryType } from '../enums';

const inquiryTypeValues = [
  InquiryType.PRODUCT,
  InquiryType.QUOTE,
  InquiryType.SHIPPING,
  InquiryType.PAYMENT,
  InquiryType.REWORK,
  InquiryType.REFUND,
] as const;
const inquiryStatusValues = [InquiryStatus.PENDING, InquiryStatus.RESPONDED] as const;
const answerChannelValues = [AnswerChannel.EMAIL, AnswerChannel.KAKAO] as const;

export const inquiryListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z.enum(['inquiry_type', 'customer_name', 'inquirer_name', 'status', 'created_at', 'assigned_to']).optional().catch(undefined),
  sort_order: z.enum(SortOrder).optional().catch(undefined),
  inquiry_type: z.enum(inquiryTypeValues).optional().catch(undefined),
  customer_name: z.string().optional().catch(undefined),
  inquirer_name: z.string().optional().catch(undefined),
  status: z.enum(inquiryStatusValues).optional().catch(undefined),
  created_from: z.string().optional().catch(undefined),
  created_to: z.string().optional().catch(undefined),
  assigned_to: z.string().optional().catch(undefined),
});

export type InquiryListSearch = z.infer<typeof inquiryListSearchSchema>;

export const createAssignManagerSchema = (
  t: (key: string, options?: Record<string, unknown>) => string,
  tValidation: (key: string, options?: Record<string, unknown>) => string,
) =>
  z.object({
    assigned_to: z.string().min(1, tValidation('required', { field: t('form.inquiries.fields.person_in_charge.label') })),
    note: z
      .string()
      .trim()
      .max(500, tValidation('max_length', { max: 500 }))
      .optional()
      .or(z.literal('')),
  });

export type AssignManagerFormValues = z.infer<ReturnType<typeof createAssignManagerSchema>>;

export const createUpdateStatusSchema = (
  _t: (key: string, options?: Record<string, unknown>) => string,
  tValidation: (key: string, options?: Record<string, unknown>) => string,
) =>
  z.object({
    status: z.enum(inquiryStatusValues),
    note: z
      .string()
      .trim()
      .max(500, tValidation('max_length', { max: 500 }))
      .optional()
      .or(z.literal('')),
  });

export type UpdateStatusFormValues = z.infer<ReturnType<typeof createUpdateStatusSchema>>;

export const createInternalMemoSchema = (
  _t: (key: string, options?: Record<string, unknown>) => string,
  tValidation: (key: string, options?: Record<string, unknown>) => string,
) =>
  z.object({
    content: z
      .string()
      .trim()
      .min(1, tValidation('required'))
      .max(1000, tValidation('max_length', { max: 1000 })),
  });

export type InternalMemoFormValues = z.infer<ReturnType<typeof createInternalMemoSchema>>;

export const createReplySchema = (
  t: (key: string, options?: Record<string, unknown>) => string,
  tValidation: (key: string, options?: Record<string, unknown>) => string,
) =>
  z.object({
    reply_content: z
      .string()
      .trim()
      .min(1, tValidation('required', { field: t('form.inquiries.fields.reply_content.label') }))
      .max(2000, tValidation('max_length', { max: 2000 })),
    contact_phone: z
      .string()
      .trim()
      .max(12, tValidation('max_length', { max: 12 }))
      .regex(/^\d*$/, tValidation('numeric_only'))
      .optional()
      .or(z.literal('')),
    channels: z.array(z.enum(answerChannelValues)).min(1, tValidation('required', { field: t('form.inquiries.fields.channels.label') })),
    attachments: z.array(z.object({ url: z.string(), name: z.string(), size: z.number().optional() })).optional(),
  });

export type ReplyFormValues = z.infer<ReturnType<typeof createReplySchema>>;
export type ReplyAttachmentInput = NonNullable<ReplyFormValues['attachments']>[number];
