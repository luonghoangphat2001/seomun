import type { BaseResponse, PaginationResponse } from '@/types/api';
import type {
  InquiryAuditLogDTO,
  InquiryDetailDTO,
  InquiryDTO,
  InquiryExportHistoryDTO,
  InquiryFiltersDTO,
  InternalMemoDTO,
  RelatedInquiryDTO,
  ReplyDTO,
  TimelineEventDTO,
} from '../types';

export type InquiryFilterSearchRESP = BaseResponse<{ filters: InquiryFiltersDTO }>;
export type InquiryListRESP = PaginationResponse<{ inquiries: InquiryDTO[] }>;
export type InquiryDetailRESP = BaseResponse<{ inquiry: InquiryDetailDTO }>;
export type RelatedInquiriesRESP = BaseResponse<{ related_inquiries: RelatedInquiryDTO[] }>;
export type InquiryTimelineRESP = BaseResponse<{ timeline: TimelineEventDTO[] }>;
export type RepliesRESP = BaseResponse<{ replies: ReplyDTO[] }>;
export type ReplyRESP = BaseResponse<{ reply: ReplyDTO }>;
export type InternalMemosRESP = BaseResponse<{ memos: InternalMemoDTO[] }>;
export type InternalMemoRESP = BaseResponse<{ memo: InternalMemoDTO }>;
export type InquiryAuditLogsRESP = BaseResponse<{ audit_logs: InquiryAuditLogDTO[] }>;
export type ExportInquiryRESP = BaseResponse<{ history: InquiryExportHistoryDTO }>;
