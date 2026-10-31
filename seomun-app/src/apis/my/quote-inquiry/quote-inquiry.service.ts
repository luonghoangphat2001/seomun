import { DATE_FORMAT, PAGINATION } from '@/constants/common';
import { InquiryStatus } from '@/enums/inquiry';
import { formatDate } from '@/lib/utils';
import { PaymentInquiry, QuoteInquiry, QuoteInquiryDetail, ReworkRequest, RefundRequest } from '@/types/inquiry';
import { QuoteInquiryListREQ } from './quote-inquiry.request';
import { QuoteInquiryRESP } from './quote-inquiry.response';

export const getInitFilterQuoteInquiry = (searchParams: URLSearchParams): QuoteInquiryListREQ => {
  return {
    page: Number(searchParams.get('page')) || PAGINATION.DEFAULT_PAGE,
    per_page: Number(searchParams.get('per_page')) || PAGINATION.MAX_PAGE_SIZE,
    search: searchParams.get('search') || undefined,
    status: searchParams.get('status') || undefined,
    created_from: searchParams.get('created_from') || undefined,
    created_to: searchParams.get('created_to') || undefined,
  };
};

export const normalizeQuoteInquiryListREQ = (params?: QuoteInquiryListREQ): QuoteInquiryListREQ => {
  return {
    ...params,
    category: params?.category?.trim() || undefined,
    status: params?.status?.trim() || undefined,
    search: params?.search?.trim() || undefined,
    created_from: params?.created_from?.trim() || undefined,
    created_to: params?.created_to?.trim() || undefined,
    page: params?.page || PAGINATION.DEFAULT_PAGE,
    per_page: params?.per_page || PAGINATION.MAX_PAGE_SIZE,
  };
};

export const transformQuoteInquiryRESPToListItem = (resp: QuoteInquiryRESP): QuoteInquiry => {
  const hasReply = resp.comments.length > 0;
  const firstAttachment = resp.attachments[0];
  const manager = resp?.manager_name?.trim() || '';

  return {
    id: resp.id,
    createdAt: formatDate(resp.created_at, DATE_FORMAT.DEFAULT),
    product: resp.category_label,
    title: resp.title,
    isReply: hasReply,
    manager,
    phone: resp.contact,
    attachment: resp.attachments.length > 0,
    attachmentUrl: firstAttachment?.file_url || firstAttachment?.file_path,
    status: resp.status === 'pending' ? InquiryStatus.CHECKING : InquiryStatus.ANSWERED,
  };
};

export const transformQuoteInquiryRESPToPaymentInquiryItem = (resp: QuoteInquiryRESP): PaymentInquiry => {
  const firstAttachment = resp.attachments[0];
  const manager = resp?.manager_name?.trim() || '-';

  return {
    id: resp.id,
    createdAt: formatDate(resp.created_at, DATE_FORMAT.DEFAULT),
    order: resp.order_number ?? resp.category_label,
    title: resp.title,
    isReply: resp.comments.length > 0,
    manager,
    phone: resp.contact,
    attachment: resp.attachments.length > 0,
    attachmentUrl: firstAttachment?.file_url || firstAttachment?.file_path,
  };
};

export const transformQuoteInquiryRESPToReworkRequestItem = (resp: QuoteInquiryRESP): ReworkRequest => {
  const firstAttachment = resp.attachments[0];
  const manager = resp?.manager_name?.trim() || '-';

  return {
    id: resp.id,
    createdAt: formatDate(resp.created_at, DATE_FORMAT.DEFAULT),
    order: resp.order_number ?? resp.category_label,
    title: resp.title,
    isReply: resp.comments.length > 0,
    manager,
    phone: resp.contact,
    attachment: resp.attachments.length > 0,
    attachmentUrl: firstAttachment?.file_url || firstAttachment?.file_path,
  };
};

export const transformQuoteInquiryRESPToRefundRequestItem = (resp: QuoteInquiryRESP): RefundRequest => {
  const firstAttachment = resp.attachments[0];
  const manager = resp?.manager_name?.trim() || '-';

  return {
    id: resp.id,
    createdAt: formatDate(resp.created_at, DATE_FORMAT.DEFAULT),
    order: resp.order_number ?? resp.category_label,
    title: resp.title,
    isReply: resp.comments.length > 0,
    manager,
    phone: resp.contact,
    attachment: resp.attachments.length > 0,
    attachmentUrl: firstAttachment?.file_url || firstAttachment?.file_path,
  };
};

export const transformQuoteInquiryRESPToDetailItem = (resp: QuoteInquiryRESP): QuoteInquiryDetail => {
  const latestAdminComment = [...resp.comments].reverse().find((comment) => comment.is_admin);
  const manager = resp?.manager_name || '-';

  return {
    id: resp.id,
    title: resp.title,
    product: resp.product?.name ?? resp.category_label,
    order: resp.order_number ?? undefined,
    productImage: resp.product?.images?.[0],
    manager,
    phone: resp.contact,
    createdAt: formatDate(resp.created_at, DATE_FORMAT.DEFAULT),
    detail: resp.content,
    files: resp.attachments.map((file) => ({
      name: file.file_name,
      size: file.file_size,
      url: file.file_url,
    })),
    comments: resp.comments.map((comment) => ({
      id: comment.id,
      isAdmin: comment.is_admin,
      authorName: comment.author_name,
      content: comment.content,
      createdAt: formatDate(comment.created_at, DATE_FORMAT.DEFAULT),
      files:
        comment === latestAdminComment
          ? resp.reply_attachments.map((file) => ({
              name: file.file_name,
              size: file.file_size,
              url: file.file_path,
            }))
          : undefined,
    })),
  };
};
