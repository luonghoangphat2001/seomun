import type {
  AnswerChannel,
  AuditLogAction,
  AuditLogField,
  DeliveryStatus,
  InquiryStatus,
  InquiryType,
  RelatedInquiryType,
  TimelineEventType,
} from '../enums';

export type InquiryManagerOption = {
  value: string;
  label: string;
};

export type InquiryAssignee = {
  id: number;
  name: string;
};

export type InquiryCreatedBy = InquiryAssignee;

export type AuditLogChangedBy = InquiryAssignee & { email: string };

export type InquiryFiltersDTO = {
  inquiry_type_options: { value: InquiryType; label: string }[];
  status_options: { value: InquiryStatus; label: string }[];
  assigned_to_options: InquiryManagerOption[];
};

export type InquiryProductDTO = {
  id: number;
  name: string;
  sku: string;
  price: number;
};

export type InquiryAttachmentDTO = {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  uploaded_at: string;
};

export type InquiryDTO = {
  id: number;
  inquiry_number: string;
  inquiry_type: InquiryType;
  inquiry_type_label: string;
  title: string;
  content?: string;
  customer_id: number;
  customer_name: string;
  inquirer_name: string;
  inquirer_email: string;
  inquirer_phone: string;
  inquirer_department?: string;
  status: InquiryStatus;
  status_label: string;
  priority: string | null;
  priority_label: string | null;
  assigned_to: InquiryAssignee | null;
  has_attachment: boolean;
  attachment_count: number;
  attachments?: InquiryAttachmentDTO[];
  created_at: string;
  updated_at: string;
  related_order_number?: string;
  related_design_draft_id?: string;
  reply_count: number | null;
  internal_memo_count?: number;
  product?: InquiryProductDTO | null;
};

export type RelatedInquiryDTO = {
  id: number;
  inquiry_number: string;
  title: string;
  inquiry_type: InquiryType;
  inquiry_type_label: string;
  status: InquiryStatus;
  status_label: string;
  created_at: string;
  customer_name?: string;
  relation_type: RelatedInquiryType;
  relation_type_label: string;
};

export type TimelineEventDTO = {
  id: number;
  inquiry_id: number;
  event_type: TimelineEventType;
  event_type_label: string;
  title: string;
  description: string;
  created_at: string;
  created_by: InquiryCreatedBy;
};

export type ReplyDeliveryDTO = {
  channel: AnswerChannel;
  status: DeliveryStatus;
  delivered_at: string;
  message?: string;
};

export type ReplyAttachmentDTO = {
  key?: string;
  name: string;
  url: string;
  size: number;
};

export type ReplyDTO = {
  id: string;
  inquiry_id: number;
  content: string;
  contact_phone?: string;
  attachments: ReplyAttachmentDTO[];
  notification_channel: string;
  notification_sent: boolean;
  notification_sent_at?: string;
  notification_status: string;
  // deliveries: ReplyDeliveryDTO[];
  created_at: string;
  updated_at?: string;
  created_by?: InquiryCreatedBy;
};

export type InternalMemoDTO = {
  id: string;
  inquiry_id: number;
  content: string;
  created_at: string;
  created_by: InquiryCreatedBy;
};

export type InquiryAuditLogDTO = {
  id: string;
  inquiry_id: number;
  action: AuditLogAction;
  field: AuditLogField;
  old_value: string | number | null;
  new_value: string | number | null;
  // detail: string;
  changed_by: AuditLogChangedBy | null;
  changed_at: string;
  ip_address: string | null;
};

export type InquiryDetailDTO = InquiryDTO & {
  content: string;
  attachments: InquiryAttachmentDTO[];
};

export type InquiryExportHistoryDTO = {
  id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_path: string | null;
};
