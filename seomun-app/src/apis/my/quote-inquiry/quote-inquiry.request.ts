import { PaginationREQ } from '@/types';

export type QuoteInquiryListREQ = PaginationREQ & {
  category?: string;
  status?: string;
  search?: string;
  created_from?: string;
  created_to?: string;
};

export type QuoteInquiryCreateREQ = FormData;

export type QuoteInquiryCommentCreateREQ = {
  id: number;
  content: string;
  author_name?: string;
  manager_name?: string;
  attachments?: File[];
};
