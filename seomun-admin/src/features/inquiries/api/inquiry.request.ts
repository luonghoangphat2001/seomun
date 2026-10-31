import type { InquiryExportType, InquiryStatus, InquiryType } from '../enums';
import type { PaginationRequest, SortRequest } from '@/types/api';

export type InquirySortField = 'inquiry_type' | 'customer_name' | 'inquirer_name' | 'status' | 'created_at' | 'assigned_to';

export interface InquiryFilterREQ extends PaginationRequest, SortRequest<InquirySortField> {
  inquiry_type?: InquiryType;
  customer_name?: string;
  inquirer_name?: string;
  status?: InquiryStatus;
  created_from?: string;
  created_to?: string;
  assigned_to?: string;
}

export type AssignManagerREQ = {
  assigned_to: string;
  note?: string;
};

export type UpdateInquiryStatusREQ = {
  status: InquiryStatus;
  note?: string;
};

export type CreateInternalMemoREQ = {
  content: string;
};

export type ReplyAttachmentREQ = {
  key: string;
  name: string;
  url: string;
  size: number;
};

export type CreateReplyREQ = {
  reply_content: string;
  contact_phone?: string;
  channels: string[];
  attachments?: ReplyAttachmentREQ[];
};

export type UpdateReplyREQ = CreateReplyREQ;

export type ExportInquiryREQ = Omit<InquiryFilterREQ, 'page' | 'per_page'> & {
  export_type: InquiryExportType;
  selected_ids?: string[];
  current_page?: number;
  per_page?: number;
};
