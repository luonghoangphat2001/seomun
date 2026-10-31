import type { FaqCreateREQ } from './faq.request';
import type { FaqFormValues } from '../schemas';

export function toFaqPayload(values: FaqFormValues): FaqCreateREQ {
  return {
    category: values.category,
    question: values.question,
    answer: values.answer,
    sort_order: values.sort_order ? Number(values.sort_order) : null,
    posting_status: values.posting_status,
  };
}
