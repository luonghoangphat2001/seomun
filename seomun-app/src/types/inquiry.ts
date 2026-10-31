import { Category } from '@/apis/category/category.response';
import { Product } from '@/apis/product/product.response';
import { DirectDeliveryStatus, DirectDeliveryType, InquiryStatus } from '@/enums/inquiry';

export type ProductInquiry = {
  id: number;
  createdAt: string;
  product: string;
  title: string;
  isReply: boolean;
  manager: string;
  phone: string;
  attachment: boolean;
  attachmentUrl?: string;
  status: InquiryStatus;
};

export type QuoteInquiry = {
  id: number;
  createdAt: string;
  product: string;
  title: string;
  isReply: boolean;
  manager: string;
  phone: string;
  attachment: boolean;
  attachmentUrl?: string;
  status: InquiryStatus;
};

export type QuoteInquiryDetailAttachment = {
  name: string;
  size: number;
  url: string;
};

export type QuoteInquiryDetailComment = {
  id: number;
  isAdmin: boolean;
  authorName: string;
  content: string;
  createdAt: string;
  files?: QuoteInquiryDetailAttachment[];
};

export type QuoteInquiryDetail = {
  id: number;
  title: string;
  product: string;
  order?: string;
  productImage?: string;
  manager: string;
  phone: string;
  createdAt: string;
  detail: string;
  files: QuoteInquiryDetailAttachment[];
  comments: QuoteInquiryDetailComment[];
};

export type ShippingInquiry = {
  id: number;
  createdAt: string;
  order: string;
  title: string;
  isReply: boolean;
  manager: string;
  phone: string;
  attachment: boolean;
  attachmentUrl?: string;
};

export type PaymentInquiry = {
  id: number;
  createdAt: string;
  order: string;
  title: string;
  isReply: boolean;
  manager: string;
  phone: string;
  attachment: boolean;
  attachmentUrl?: string;
};

export type DirectDeliveryRequest = {
  id: number;
  createdAt: string;
  type: string;
  name: string;
  phone: string;
  address: string;
  postcode?: string;
  baseAddress?: string;
  detailedAddress?: string;
  detailRequest?: string;
  storageLocation?: string;
  fileUrl?: string;
  fileName?: string;
  status: DirectDeliveryStatus;
};

export type ReworkRequest = {
  id: number;
  createdAt: string;
  order: string;
  title: string;
  isReply: boolean;
  manager: string;
  phone: string;
  attachment: boolean;
  attachmentUrl?: string;
};

export type RefundRequest = {
  id: number;
  createdAt: string;
  order: string;
  title: string;
  isReply: boolean;
  manager: string;
  phone: string;
  attachment: boolean;
  attachmentUrl?: string;
};

export type MockCategory = Partial<Category> & { products: Partial<Product>[] };
