import { ENDPOINTS } from '@/config/endpoints';
import { api } from '@/lib/api/api-client';

import type {
  AssignManagerREQ,
  CreateInternalMemoREQ,
  CreateReplyREQ,
  ExportInquiryREQ,
  InquiryFilterREQ,
  UpdateInquiryStatusREQ,
  UpdateReplyREQ,
} from './inquiry.request';
import type {
  ExportInquiryRESP,
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

export function getInquirySearchFiltersAPI(): Promise<InquiryFilterSearchRESP> {
  return api.get(ENDPOINTS.INQUIRIES.SEARCH_FILTERS);
}

export function getInquiryListAPI(params?: InquiryFilterREQ): Promise<InquiryListRESP> {
  return api.get(ENDPOINTS.INQUIRIES.LIST, { params });
}

export function getInquiryDetailAPI(id: string): Promise<InquiryDetailRESP> {
  return api.get(ENDPOINTS.INQUIRIES.DETAIL(id));
}

export function getRelatedInquiriesAPI(id: string): Promise<RelatedInquiriesRESP> {
  return api.get(ENDPOINTS.INQUIRIES.RELATED(id));
}

export function getInquiryTimelineAPI(id: string): Promise<InquiryTimelineRESP> {
  return api.get(ENDPOINTS.INQUIRIES.TIMELINE(id));
}

export function getInquiryRepliesAPI(id: string): Promise<RepliesRESP> {
  return api.get(ENDPOINTS.INQUIRIES.REPLIES(id));
}

export function getInquiryMemosAPI(id: string): Promise<InternalMemosRESP> {
  return api.get(ENDPOINTS.INQUIRIES.MEMOS(id));
}

export function getInquiryAuditLogsAPI(id: string): Promise<InquiryAuditLogsRESP> {
  return api.get(ENDPOINTS.INQUIRIES.AUDIT_LOGS(id));
}

export function assignManagerAPI(id: string, data: AssignManagerREQ): Promise<InquiryDetailRESP> {
  return api.patch(ENDPOINTS.INQUIRIES.ASSIGN_MANAGER(id), data);
}

export function updateInquiryStatusAPI(id: string, data: UpdateInquiryStatusREQ): Promise<InquiryDetailRESP> {
  return api.post(ENDPOINTS.INQUIRIES.UPDATE_STATUS(id), data);
}

export function createInternalMemoAPI(id: string, data: CreateInternalMemoREQ): Promise<InternalMemoRESP> {
  return api.post(ENDPOINTS.INQUIRIES.MEMOS(id), data);
}

export function createReplyAPI(id: string, data: CreateReplyREQ): Promise<ReplyRESP> {
  return api.post(ENDPOINTS.INQUIRIES.REPLIES(id), data);
}

export function updateReplyAPI(inquiryId: string, replyId: string, data: UpdateReplyREQ): Promise<ReplyRESP> {
  return api.put(ENDPOINTS.INQUIRIES.REPLY_DETAIL(inquiryId, replyId), data);
}

export function deleteReplyAPI(inquiryId: string, replyId: string): Promise<void> {
  return api.delete(ENDPOINTS.INQUIRIES.REPLY_DETAIL(inquiryId, replyId));
}

export function exportInquiriesAPI(payload: ExportInquiryREQ): Promise<ExportInquiryRESP> {
  return api.post(ENDPOINTS.INQUIRIES.EXPORT_EXCEL, payload);
}

export function checkInquiryExportStatusAPI(historyId: string | number): Promise<ExportInquiryRESP> {
  return api.get(ENDPOINTS.INQUIRIES.CHECK_EXPORT_STATUS(historyId));
}
