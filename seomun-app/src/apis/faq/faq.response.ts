import { FaqCategory } from '@/enums/faq';

export type FaqRESP = {
  id: number;
  category: string;
  question: string;
  answer: string;
  sort_order: string;
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type FaqResponse = {
  faqs: FaqRESP[];
};

export type FaqCountRESP = {
  category_counts: Record<FaqCategory, number>;
};
