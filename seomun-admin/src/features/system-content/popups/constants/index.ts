import type { TFunction } from 'i18next';

import type { AppSelectOption } from '@/components/shared/app-select';
import { ExposureStatus } from '@/enums';

export const POPUP_WIDTH = '400';
export const POPUP_HEIGHT = '300';

export const POPUP_EXPOSURE_STATUS_OPTIONS: Record<ExposureStatus, (t: TFunction<'page'>) => string> = {
  [ExposureStatus.EXPOSED]: (t) => t('popups.form.status_option.exposed'),
  [ExposureStatus.NON_EXPOSED]: (t) => t('popups.form.status_option.non_exposed'),
};

export function getPopupExposureStatusOptions(t: TFunction<'page'>): AppSelectOption<ExposureStatus>[] {
  return [
    { value: ExposureStatus.EXPOSED, label: POPUP_EXPOSURE_STATUS_OPTIONS[ExposureStatus.EXPOSED](t) },
    { value: ExposureStatus.NON_EXPOSED, label: POPUP_EXPOSURE_STATUS_OPTIONS[ExposureStatus.NON_EXPOSED](t) },
  ];
}

// TODO: remove when backend ships exposure_location_options
export const POPUP_EXPOSURE_LOCATION_VALUES = ['homepage', 'product_list', 'product_detail'] as const;

export type PopupExposureLocation = (typeof POPUP_EXPOSURE_LOCATION_VALUES)[number];

export const POPUP_EXPOSURE_LOCATION_OPTIONS: Record<PopupExposureLocation, (t: TFunction<'page'>) => string> = {
  homepage: (t) => t('popups.form.exposure_location_option.homepage'),
  product_list: (t) => t('popups.form.exposure_location_option.product_list'),
  product_detail: (t) => t('popups.form.exposure_location_option.product_detail'),
};

export function getPopupExposureLocationOptions(t: TFunction<'page'>): AppSelectOption<string>[] {
  return POPUP_EXPOSURE_LOCATION_VALUES.map((value) => ({ value, label: POPUP_EXPOSURE_LOCATION_OPTIONS[value](t) }));
}
