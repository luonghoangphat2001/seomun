import { BaseResponse, ErrorRESP } from '@/types';
import { useMutation, useQuery, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { QuoteInquiryApi } from './quote-inquiry.api';
import { QuoteInquiryCommentCreateREQ, QuoteInquiryCreateREQ, QuoteInquiryListREQ } from './quote-inquiry.request';
import { QuoteInquiryCommentCreateRESP, QuoteInquiryCreateRESP } from './quote-inquiry.response';
import {
  normalizeQuoteInquiryListREQ,
  transformQuoteInquiryRESPToDetailItem,
  transformQuoteInquiryRESPToListItem,
} from './quote-inquiry.service';

export const QUOTE_INQUIRY_QUERY_KEYS = {
  LIST: 'QUOTE_INQUIRY_LIST',
  DETAIL: 'QUOTE_INQUIRY_DETAIL',
};

export const useQuoteInquiryListQuery = (params?: QuoteInquiryListREQ) =>
  useQuery({
    queryKey: [QUOTE_INQUIRY_QUERY_KEYS.LIST, normalizeQuoteInquiryListREQ(params)],
    queryFn: () => QuoteInquiryApi.list(normalizeQuoteInquiryListREQ(params)),
    select: (resp) => ({
      list: resp.data.inquiries.map(transformQuoteInquiryRESPToListItem),
      pagination: resp.pagination,
    }),
  });

export const useQuoteInquiryDetailQuery = (id?: number) =>
  useQuery({
    queryKey: [QUOTE_INQUIRY_QUERY_KEYS.DETAIL, id],
    queryFn: () => QuoteInquiryApi.detail(id as number),
    select: (resp) => transformQuoteInquiryRESPToDetailItem(resp.data.inquiry),
    enabled: !!id,
  });

export const useQuoteInquiryCreateMutation = (
  options?: UseMutationOptions<BaseResponse<QuoteInquiryCreateRESP>, AxiosError<ErrorRESP>, QuoteInquiryCreateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: QuoteInquiryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTE_INQUIRY_QUERY_KEYS.LIST] });
    },
    ...options,
  });
};

export const useQuoteInquiryCreateCommentMutation = (
  options?: UseMutationOptions<BaseResponse<QuoteInquiryCommentCreateRESP>, AxiosError<ErrorRESP>, QuoteInquiryCommentCreateREQ>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: QuoteInquiryApi.createComment,
    onSuccess: (_resp, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUOTE_INQUIRY_QUERY_KEYS.DETAIL, variables.id] });
    },
    ...options,
  });
};
