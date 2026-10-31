export type QuoteInquiryProductRESP = {
  id: number;
  name: string;
  name_en: string;
  sku: string;
  images?: string[];
};

export type QuoteInquiryCommentRESP = {
  id: number;
  author_name: string;
  content: string;
  is_admin: boolean;
  user_id: number | null;
  created_at: string;
  updated_at: string;
};

export type QuoteInquiryAttachmentRESP = {
  id: number;
  file_name: string;
  file_path: string;
  file_url: string;
  file_type: string;
  file_size: number;
};

export type QuoteInquiryRESP = {
  id: number;
  category: string;
  category_label: string;
  category_label_en: string;
  title: string;
  content: string;
  order_number: string | null;
  contact: string;
  author_name: string;
  manager_name: string | null;
  product_id: number | null;
  product: QuoteInquiryProductRESP | null;
  status: string;
  status_label: string;
  status_label_en: string;
  comments: QuoteInquiryCommentRESP[];
  attachments: QuoteInquiryAttachmentRESP[];
  reply_attachments: QuoteInquiryAttachmentRESP[];
  created_at: string;
  updated_at: string;
};

export type QuoteInquiryListRESP = {
  inquiries: QuoteInquiryRESP[];
};

export type QuoteInquiryDetailRESP = {
  inquiry: QuoteInquiryRESP;
};

export type QuoteInquiryCreateRESP = {
  inquiry: QuoteInquiryRESP;
};

export type QuoteInquiryCommentCreateRESP = {
  inquiry: QuoteInquiryRESP;
};
