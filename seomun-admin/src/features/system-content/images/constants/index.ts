import type { TFunction } from 'i18next';

import type { AppSelectOption } from '@/components/shared/app-select';
import { FileType } from '@/enums';

import { ImageSortField } from '../enums';

export const DEFAULT_PER_PAGE = 12;
export const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;

export const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
export const PDF_EXTS = ['pdf'];
export const DOC_EXTS = ['doc', 'docx', 'txt'];

export const IMAGE_SORT_FIELD_LABELS: Record<ImageSortField, string> = {
  [ImageSortField.NAME]: 'Name',
  [ImageSortField.TYPE]: 'Type',
  [ImageSortField.CREATED_AT]: 'Upload Date',
};

export const IMAGE_CATEGORY_LABELS: Record<FileType, (t: TFunction<'page'>) => string> = {
  [FileType.BANNERS]: (t) => t('images.category.banner'),
  [FileType.POPUPS]: (t) => t('images.category.popup'),
  [FileType.NOTICE_ATTACHMENTS]: (t) => t('images.category.notice'),
  [FileType.GUIDE_CONTENT_ATTACHMENTS]: (t) => t('images.category.guide'),
  [FileType.PRODUCT_IMAGES]: (t) => t('images.category.product'),
  [FileType.TEMPLATE_PREVIEWS]: (t) => t('images.category.template_previews'),
  [FileType.TEMPLATES]: (t) => t('images.category.templates'),
  [FileType.BULK_ORDERS]: (t) => t('images.category.bulk_orders'),
  [FileType.INQUIRY_ATTACHMENTS]: (t) => t('images.category.inquiry'),
  [FileType.BUSINESS_REGISTRATIONS]: (t) => t('images.category.business_registrations'),
  [FileType.CUSTOMER_BUSINESS_REGISTRATION]: (t) => t('images.category.customer_registration'),
  [FileType.CATEGORY_EXPOSURE]: (t) => t('images.category.category_exposure'),
  [FileType.USER_GUIDES]: (t) => t('images.category.user_guides'),
  [FileType.DIRECT_SHIPPING]: (t) => t('images.category.direct_shipping'),
  [FileType.PAPER_OPTIONS]: (t) => t('images.category.paper_options'),
  [FileType.EQUIPMENTS]: (t) => t('images.category.equipments'),
  [FileType.OUTSOURCING_REGISTRATION_CERTIFICATE]: (t) => t('images.category.outsourcing_registration_certificate'),
};

export function getImageFileTypeOptions(t: TFunction<'page'>): AppSelectOption<string>[] {
  return Object.values(FileType).map((value) => ({
    value,
    label: IMAGE_CATEGORY_LABELS[value]?.(t) ?? value,
  }));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
