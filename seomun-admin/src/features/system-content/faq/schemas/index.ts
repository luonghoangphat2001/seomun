import type { TFunction } from 'i18next';
import { z } from 'zod';

import { SortOrder, ExposureStatus } from '@/enums';

import type { FaqRESP } from '../api/faq.response';
import { FaqCategory, FaqSortField } from '../enums';

export function createFaqFormSchema(t: TFunction<'validation'>) {
  return z.object({
    category: z.enum(FaqCategory, { message: t('faq.category_required') }),
    question: z.string().trim().min(1, t('faq.question_required')),
    answer: z.string().trim().min(1, t('faq.answer_required')),
    sort_order: z
      .string()
      .optional()
      .refine((v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 0), t('min_number', { min: 0 })),
    posting_status: z.enum(ExposureStatus, { message: t('faq.posting_status_required') }),
  });
}

export type FaqFormValues = z.infer<ReturnType<typeof createFaqFormSchema>>;

export function getFaqFormDefaultValues(faq?: FaqRESP): FaqFormValues {
  return {
    category: faq?.category ?? FaqCategory.MEMBERSHIP,
    question: faq?.question ?? '',
    answer: faq?.answer ?? '',
    sort_order: faq?.sort_order != null ? String(faq.sort_order) : undefined,
    posting_status: faq?.posting_status?.value ?? ExposureStatus.EXPOSED,
  };
}

export const faqListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z.enum(FaqSortField).optional().catch(undefined),
  sort_order: z.enum(SortOrder).optional().catch(undefined),
  faq_category: z.enum(FaqCategory).optional().catch(undefined),
  title: z.string().optional().catch(undefined),
  author_id: z.coerce.number().int().optional().catch(undefined),
  posting_status: z.enum(ExposureStatus).optional().catch(undefined),
  registration_date_from: z.string().optional().catch(undefined),
  registration_date_to: z.string().optional().catch(undefined),
});

export type FaqListSearch = z.infer<typeof faqListSearchSchema>;

export type FaqSearchFilterValues = Omit<FaqListSearch, 'page' | 'per_page' | 'sort_by' | 'sort_order'>;

export const EMPTY_FAQ_SEARCH_FILTER_VALUES: FaqSearchFilterValues = {
  title: undefined,
  faq_category: undefined,
  author_id: undefined,
  posting_status: undefined,
  registration_date_from: undefined,
  registration_date_to: undefined,
};
