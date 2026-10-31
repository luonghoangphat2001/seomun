import { keepPreviousData, useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

import type { FaqFormValues } from '../schemas';
import type { FaqRESP, FaqFiltersRESP, FaqListRESP } from './faq.response';
import type { FaqListREQ } from './faq.request';
import { createFaqAPI, deleteFaqAPI, editFaqAPI, getFaqAPI, getFaqByIdAPI, getFaqSearchFilterAPI } from './faq.api';
import { toFaqPayload } from './faq.service';

export const faqKeys = {
  all: ['faqs'] as const,
  lists: () => [...faqKeys.all, 'list'] as const,
  list: (params: FaqListREQ) => [...faqKeys.lists(), params] as const,
  detail: (id: string) => [...faqKeys.all, 'detail', id] as const,
  filters: () => [...faqKeys.all, 'filters'] as const,
};

// ─── Query Options ─────────────────────────────────────────────────────────────

export const faqDetailQueryOptions = (id: string) => ({
  queryKey: faqKeys.detail(id),
  queryFn: () => getFaqByIdAPI(id),
  staleTime: 30_000,
});

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export const useFaqsQuery = (params: FaqListREQ, options?: Omit<UseQueryOptions<FaqListRESP, AxiosError<IBaseError>>, 'queryKey' | 'queryFn'>) => {
  return useQuery<FaqListRESP, AxiosError<IBaseError>>({
    ...options,
    queryKey: faqKeys.list(params),
    queryFn: () => getFaqAPI(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};

export const useFaqDetailQuery = (id: string, options?: Omit<UseQueryOptions<FaqRESP | null, AxiosError<IBaseError>>, 'queryKey' | 'queryFn'>) => {
  return useQuery<FaqRESP | null, AxiosError<IBaseError>>({
    ...faqDetailQueryOptions(id),
    ...options,
  });
};

export const useFaqsFilterQuery = (options?: Omit<UseQueryOptions<FaqFiltersRESP, AxiosError<IBaseError>>, 'queryKey' | 'queryFn'>) => {
  return useQuery<FaqFiltersRESP, AxiosError<IBaseError>>({
    ...options,
    queryKey: faqKeys.filters(),
    queryFn: () => getFaqSearchFilterAPI(),
    staleTime: 5 * 60_000,
  });
};

export const useCreateFaqMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<FaqRESP, AxiosError<IBaseError>, FaqFormValues>({
    mutationFn: (values) => createFaqAPI(toFaqPayload(values)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: faqKeys.all });
    },
  });
};

export const useUpdateFaqMutation = (faqId: string) => {
  const queryClient = useQueryClient();
  return useMutation<FaqRESP, AxiosError<IBaseError>, FaqFormValues>({
    mutationFn: (values) => editFaqAPI(faqId, toFaqPayload(values)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: faqKeys.all });
    },
  });
};

export const useDeleteFaqMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError<IBaseError>, string>({
    mutationFn: deleteFaqAPI,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: faqKeys.all });
    },
  });
};
