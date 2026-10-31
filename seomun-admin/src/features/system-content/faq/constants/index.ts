import type { TFunction } from 'i18next';

import type { AppSelectOption } from '@/components/shared/app-select';
import { ExposureStatus } from '@/enums';

import { FaqCategory } from '../enums';

export const FAQ_CATEGORY_LABELS: Record<FaqCategory, (t: TFunction<'page'>) => string> = {
  [FaqCategory.MEMBERSHIP]: (t) => t('faqs.category.membership'),
  [FaqCategory.FILES]: (t) => t('faqs.category.files'),
  [FaqCategory.DESIGN]: (t) => t('faqs.category.design'),
  [FaqCategory.ORDERS]: (t) => t('faqs.category.orders'),
  [FaqCategory.PRODUCTION]: (t) => t('faqs.category.production'),
  [FaqCategory.SHIPPING_DELIVERY]: (t) => t('faqs.category.shipping_delivery'),
  [FaqCategory.PAYMENT_ACCOUNTING]: (t) => t('faqs.category.payment_accounting'),
};

export const FAQ_POSTING_STATUS_LABELS: Record<ExposureStatus, (t: TFunction<'page'>) => string> = {
  [ExposureStatus.EXPOSED]: (t) => t('faqs.exposure_status_option.exposed'),
  [ExposureStatus.NON_EXPOSED]: (t) => t('faqs.exposure_status_option.non_exposed'),
};

export function getFaqCategoryOptions(t: TFunction<'page'>): AppSelectOption<FaqCategory>[] {
  return Object.values(FaqCategory).map((value) => ({
    value,
    label: FAQ_CATEGORY_LABELS[value](t),
  }));
}

export function getFaqExposureStatusOptions(t: TFunction<'page'>): AppSelectOption<ExposureStatus>[] {
  return [
    { value: ExposureStatus.EXPOSED, label: FAQ_POSTING_STATUS_LABELS[ExposureStatus.EXPOSED](t) },
    { value: ExposureStatus.NON_EXPOSED, label: FAQ_POSTING_STATUS_LABELS[ExposureStatus.NON_EXPOSED](t) },
  ];
}
