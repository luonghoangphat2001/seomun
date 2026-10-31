import { keepPreviousData, useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';
import type { InquiryAuditLogDTO, InquiryDetailDTO, InternalMemoDTO, RelatedInquiryDTO, ReplyDTO, TimelineEventDTO } from '../types';
import {
  assignManager,
  createInternalMemo,
  createReply,
  deleteReply,
  getInquiryAuditLogs,
  getInquiryDetail,
  getInquiryList,
  getInquiryMemos,
  getInquiryReplies,
  getInquirySearchFilters,
  getInquiryTimeline,
  getRelatedInquiries,
  updateInquiryStatus,
  updateReply,
} from './inquiry.service';
import type {
  AssignManagerREQ,
  CreateInternalMemoREQ,
  CreateReplyREQ,
  InquiryFilterREQ,
  UpdateInquiryStatusREQ,
  UpdateReplyREQ,
} from './inquiry.request';
import type {
  InquiryAuditLogsRESP,
  InquiryDetailRESP,
  InquiryFilterSearchRESP,
  InquiryListRESP,
  InquiryTimelineRESP,
  InternalMemoRESP,
  InternalMemosRESP,
  RelatedInquiriesRESP,
  RepliesRESP,
  ReplyRESP,
} from './inquiry.response';

export const inquiryKeys = {
  all: ['inquiries'] as const,
  searchFilters: () => [...inquiryKeys.all, 'search-filters'] as const,
  list: (params?: InquiryFilterREQ) => [...inquiryKeys.all, 'list', params] as const,
  detail: (id: string) => [...inquiryKeys.all, 'detail', id] as const,
  related: (id: string) => [...inquiryKeys.all, 'related', id] as const,
  timeline: (id: string) => [...inquiryKeys.all, 'timeline', id] as const,
  replies: (id: string) => [...inquiryKeys.all, 'replies', id] as const,
  memos: (id: string) => [...inquiryKeys.all, 'memos', id] as const,
  auditLogs: (id: string) => [...inquiryKeys.all, 'audit-logs', id] as const,
};

export const inquiryDetailQueryOptions = (id: string) => ({
  queryKey: inquiryKeys.detail(id),
  queryFn: () => getInquiryDetail(id),
  select: (response: InquiryDetailRESP) => response.data.inquiry,
  staleTime: 30_000,
});

export const useInquirySearchFilters = (options?: Omit<UseQueryOptions<InquiryFilterSearchRESP, AxiosError<IBaseError>>, 'queryKey' | 'queryFn'>) =>
  useQuery<InquiryFilterSearchRESP, AxiosError<IBaseError>>({
    ...options,
    queryKey: inquiryKeys.searchFilters(),
    queryFn: getInquirySearchFilters,
    staleTime: 60_000,
  });

export const useInquiryList = (
  params?: InquiryFilterREQ,
  options?: Omit<UseQueryOptions<InquiryListRESP, AxiosError<IBaseError>>, 'queryKey' | 'queryFn'>,
) =>
  useQuery<InquiryListRESP, AxiosError<IBaseError>>({
    ...options,
    queryKey: inquiryKeys.list(params),
    queryFn: () => getInquiryList(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useInquiryDetail = (
  id: string,
  options?: Omit<UseQueryOptions<InquiryDetailRESP, AxiosError<IBaseError>, InquiryDetailDTO>, 'queryKey' | 'queryFn' | 'select'>,
) =>
  useQuery<InquiryDetailRESP, AxiosError<IBaseError>, InquiryDetailDTO>({
    ...options,
    queryKey: inquiryKeys.detail(id),
    queryFn: () => getInquiryDetail(id),
    select: (response) => response.data.inquiry,
    staleTime: 30_000,
    enabled: (options?.enabled ?? true) && Boolean(id),
  });

export const useRelatedInquiries = (
  id: string,
  options?: Omit<UseQueryOptions<RelatedInquiriesRESP, AxiosError<IBaseError>, RelatedInquiryDTO[]>, 'queryKey' | 'queryFn' | 'select'>,
) =>
  useQuery<RelatedInquiriesRESP, AxiosError<IBaseError>, RelatedInquiryDTO[]>({
    ...options,
    queryKey: inquiryKeys.related(id),
    queryFn: () => getRelatedInquiries(id),
    select: (response) => response.data.related_inquiries,
    enabled: (options?.enabled ?? true) && Boolean(id),
  });

export const useInquiryTimeline = (
  id: string,
  options?: Omit<UseQueryOptions<InquiryTimelineRESP, AxiosError<IBaseError>, TimelineEventDTO[]>, 'queryKey' | 'queryFn' | 'select'>,
) =>
  useQuery<InquiryTimelineRESP, AxiosError<IBaseError>, TimelineEventDTO[]>({
    ...options,
    queryKey: inquiryKeys.timeline(id),
    queryFn: () => getInquiryTimeline(id),
    select: (response) => response.data.timeline,
    enabled: (options?.enabled ?? true) && Boolean(id),
  });

export const useInquiryReplies = (
  id: string,
  options?: Omit<UseQueryOptions<RepliesRESP, AxiosError<IBaseError>, ReplyDTO[]>, 'queryKey' | 'queryFn' | 'select'>,
) =>
  useQuery<RepliesRESP, AxiosError<IBaseError>, ReplyDTO[]>({
    ...options,
    queryKey: inquiryKeys.replies(id),
    queryFn: () => getInquiryReplies(id),
    select: (response) => response.data.replies,
    enabled: (options?.enabled ?? true) && Boolean(id),
  });

export const useInquiryMemos = (
  id: string,
  options?: Omit<UseQueryOptions<InternalMemosRESP, AxiosError<IBaseError>, InternalMemoDTO[]>, 'queryKey' | 'queryFn' | 'select'>,
) =>
  useQuery<InternalMemosRESP, AxiosError<IBaseError>, InternalMemoDTO[]>({
    ...options,
    queryKey: inquiryKeys.memos(id),
    queryFn: () => getInquiryMemos(id),
    select: (response) => response.data.memos,
    enabled: (options?.enabled ?? true) && Boolean(id),
  });

export const useInquiryAuditLogs = (
  id: string,
  options?: Omit<UseQueryOptions<InquiryAuditLogsRESP, AxiosError<IBaseError>, InquiryAuditLogDTO[]>, 'queryKey' | 'queryFn' | 'select'>,
) =>
  useQuery<InquiryAuditLogsRESP, AxiosError<IBaseError>, InquiryAuditLogDTO[]>({
    ...options,
    queryKey: inquiryKeys.auditLogs(id),
    queryFn: () => getInquiryAuditLogs(id),
    select: (response) => response.data.audit_logs,
    enabled: (options?.enabled ?? true) && Boolean(id),
  });

export const useAssignManager = () => {
  const queryClient = useQueryClient();
  return useMutation<InquiryDetailRESP, AxiosError<IBaseError>, { id: string; data: AssignManagerREQ }>({
    mutationFn: ({ id, data }) => assignManager(id, data),
    onSuccess: (_, variables) => invalidateInquiry(queryClient, variables.id),
  });
};

export const useUpdateInquiryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<InquiryDetailRESP, AxiosError<IBaseError>, { id: string; data: UpdateInquiryStatusREQ }>({
    mutationFn: ({ id, data }) => updateInquiryStatus(id, data),
    onSuccess: (_, variables) => invalidateInquiry(queryClient, variables.id),
  });
};

export const useCreateInternalMemo = () => {
  const queryClient = useQueryClient();
  return useMutation<InternalMemoRESP, AxiosError<IBaseError>, { id: string; data: CreateInternalMemoREQ }>({
    mutationFn: ({ id, data }) => createInternalMemo(id, data),
    onSuccess: (_, variables) => invalidateInquiry(queryClient, variables.id),
  });
};

export const useCreateReply = () => {
  const queryClient = useQueryClient();
  return useMutation<ReplyRESP, AxiosError<IBaseError>, { id: string; data: CreateReplyREQ }>({
    mutationFn: ({ id, data }) => createReply(id, data),
    onSuccess: (_, variables) => invalidateInquiry(queryClient, variables.id),
  });
};

export const useUpdateReply = () => {
  const queryClient = useQueryClient();
  return useMutation<ReplyRESP, AxiosError<IBaseError>, { inquiryId: string; replyId: string; data: UpdateReplyREQ }>({
    mutationFn: ({ inquiryId, replyId, data }) => updateReply(inquiryId, replyId, data),
    onSuccess: (_, variables) => invalidateInquiry(queryClient, variables.inquiryId),
  });
};

export const useDeleteReply = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError<IBaseError>, { inquiryId: string; replyId: string }>({
    mutationFn: ({ inquiryId, replyId }) => deleteReply(inquiryId, replyId),
    onSuccess: (_, variables) => invalidateInquiry(queryClient, variables.inquiryId),
  });
};

function invalidateInquiry(queryClient: ReturnType<typeof useQueryClient>, id: string) {
  void queryClient.invalidateQueries({ queryKey: inquiryKeys.all });
  void queryClient.invalidateQueries({ queryKey: inquiryKeys.detail(id) });
  void queryClient.invalidateQueries({ queryKey: inquiryKeys.related(id) });
  void queryClient.invalidateQueries({ queryKey: inquiryKeys.timeline(id) });
  void queryClient.invalidateQueries({ queryKey: inquiryKeys.replies(id) });
  void queryClient.invalidateQueries({ queryKey: inquiryKeys.memos(id) });
  void queryClient.invalidateQueries({ queryKey: inquiryKeys.auditLogs(id) });
}
