import type { TFunction } from 'i18next';

import type { AppSelectOption } from '@/components/shared/app-select';
import { ExposureStatus } from '@/enums/common.enum';

import { NoticeType } from '../enums';

export const NOTICE_TYPE_OPTIONS: Record<NoticeType, (t: TFunction<'page'>) => string> = {
  [NoticeType.ALL]: (t) => t('notices.form.type_option.all'),
  [NoticeType.ORDERS]: (t) => t('notices.form.type_option.orders'),
  [NoticeType.PRODUCT_NEWS]: (t) => t('notices.form.type_option.product_news'),
  [NoticeType.SERVICE]: (t) => t('notices.form.type_option.service'),
  [NoticeType.EVENTS]: (t) => t('notices.form.type_option.events'),
  [NoticeType.SHIPPING_DELIVERY]: (t) => t('notices.form.type_option.shipping_delivery'),
  [NoticeType.OTHER]: (t) => t('notices.form.type_option.other'),
};

export function getNoticeTypeOptions(t: TFunction<'page'>): AppSelectOption<NoticeType>[] {
  return Object.entries(NOTICE_TYPE_OPTIONS).map(([value, getLabel]) => ({ value: value as NoticeType, label: getLabel(t) }));
}

export function getNoticeExposureStatusOptions(t: TFunction<'page'>): AppSelectOption<string>[] {
  return [
    { value: ExposureStatus.EXPOSED, label: t('notices.exposure_status_option.exposed') },
    { value: ExposureStatus.NON_EXPOSED, label: t('notices.exposure_status_option.non_exposed') },
  ];
}

export const NOTICE_EXPOSURE_STATUS_OPTIONS: Record<ExposureStatus, (t: TFunction<'page'>) => string> = {
  [ExposureStatus.EXPOSED]: (t) => t('notices.exposure_status_option.exposed'),
  [ExposureStatus.NON_EXPOSED]: (t) => t('notices.exposure_status_option.non_exposed'),
};
