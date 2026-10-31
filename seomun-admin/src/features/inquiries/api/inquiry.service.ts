import {
  assignManagerAPI,
  checkInquiryExportStatusAPI,
  createInternalMemoAPI,
  createReplyAPI,
  deleteReplyAPI,
  exportInquiriesAPI,
  getInquiryAuditLogsAPI,
  getInquiryDetailAPI,
  getInquiryListAPI,
  getInquiryMemosAPI,
  getInquiryRepliesAPI,
  getInquirySearchFiltersAPI,
  getInquiryTimelineAPI,
  getRelatedInquiriesAPI,
  updateInquiryStatusAPI,
  updateReplyAPI,
} from './inquiry.api';
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

export async function getInquirySearchFilters(): Promise<InquiryFilterSearchRESP> {
  const response = await getInquirySearchFiltersAPI();
  const { filters } = response.data;
  return {
    ...response,
    data: {
      filters: {
        ...filters,
        assigned_to_options: filters.assigned_to_options.map((option) => ({
          ...option,
          value: String(option.value),
        })),
      },
    },
  };
}

export function getInquiryList(params?: InquiryFilterREQ): Promise<InquiryListRESP> {
  return getInquiryListAPI(params);
}

export function getInquiryDetail(id: string): Promise<InquiryDetailRESP> {
  return getInquiryDetailAPI(id);
}

export function getRelatedInquiries(id: string): Promise<RelatedInquiriesRESP> {
  return getRelatedInquiriesAPI(id);
}

export function getInquiryTimeline(id: string): Promise<InquiryTimelineRESP> {
  return getInquiryTimelineAPI(id);
}

export function getInquiryReplies(id: string): Promise<RepliesRESP> {
  return getInquiryRepliesAPI(id);
}

export function getInquiryMemos(id: string): Promise<InternalMemosRESP> {
  return getInquiryMemosAPI(id);
}

export function getInquiryAuditLogs(id: string): Promise<InquiryAuditLogsRESP> {
  return getInquiryAuditLogsAPI(id);
}

export function assignManager(id: string, data: AssignManagerREQ): Promise<InquiryDetailRESP> {
  return assignManagerAPI(id, data);
}

export function updateInquiryStatus(id: string, data: UpdateInquiryStatusREQ): Promise<InquiryDetailRESP> {
  return updateInquiryStatusAPI(id, data);
}

export function createInternalMemo(id: string, data: CreateInternalMemoREQ): Promise<InternalMemoRESP> {
  return createInternalMemoAPI(id, data);
}

export function createReply(id: string, data: CreateReplyREQ): Promise<ReplyRESP> {
  return createReplyAPI(id, data);
}

export function updateReply(inquiryId: string, replyId: string, data: UpdateReplyREQ): Promise<ReplyRESP> {
  return updateReplyAPI(inquiryId, replyId, data);
}

export function deleteReply(inquiryId: string, replyId: string): Promise<void> {
  return deleteReplyAPI(inquiryId, replyId);
}

export function exportInquiries(payload: ExportInquiryREQ): Promise<ExportInquiryRESP> {
  return exportInquiriesAPI(payload);
}

export function checkInquiryExportStatus(historyId: string | number): Promise<ExportInquiryRESP> {
  return checkInquiryExportStatusAPI(historyId);
}
