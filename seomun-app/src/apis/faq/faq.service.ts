import { FaqListREQ } from './faq.request';

export const getInitFilterFaq = (searchParams: URLSearchParams): FaqListREQ => {
  return {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
  };
};
