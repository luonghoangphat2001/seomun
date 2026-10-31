import { useQuery } from '@tanstack/react-query';
import { FaqCountREQ, FaqListREQ } from './faq.request';
import { FaqApi } from './faq.api';
import { PAGINATION } from '@/constants/common';

export const FAQ_QUERY_KEYS = {
  LIST: 'FAQ_LIST',
  COUNT: 'FAQ_COUNT',
};

export const useFaqListQuery = (params?: FaqListREQ, isMyPage?: boolean) =>
  useQuery({
    queryKey: [FAQ_QUERY_KEYS.LIST, params, isMyPage],
    queryFn: () => FaqApi.list({ ...params, page: PAGINATION.DEFAULT_PAGE, per_page: PAGINATION.MAX_PAGE_SIZE }, isMyPage),
    select: (resp) => resp.data.faqs,
  });

export const useFaqCountQuery = (params?: FaqCountREQ, isMyPage?: boolean) =>
  useQuery({
    queryKey: [FAQ_QUERY_KEYS.LIST, params, isMyPage],
    queryFn: () => FaqApi.count(params, isMyPage),
    select: (resp) => resp.data.category_counts,
  });
