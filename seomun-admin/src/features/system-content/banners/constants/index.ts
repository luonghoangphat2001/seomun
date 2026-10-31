import type { TFunction } from 'i18next';

import type { AppSelectOption } from '@/components/shared/app-select';
import { ExposureStatus } from '@/enums';

export const BANNER_EXPOSURE_STATUS_OPTIONS: Record<ExposureStatus, (t: TFunction<'page'>) => string> = {
  [ExposureStatus.EXPOSED]: (t) => t('banners.exposure_status_option.exposed'),
  [ExposureStatus.NON_EXPOSED]: (t) => t('banners.exposure_status_option.non_exposed'),
};

export function getBannerExposureStatusOptions(t: TFunction<'page'>): AppSelectOption<ExposureStatus>[] {
  return [
    { value: ExposureStatus.EXPOSED, label: BANNER_EXPOSURE_STATUS_OPTIONS[ExposureStatus.EXPOSED](t) },
    { value: ExposureStatus.NON_EXPOSED, label: BANNER_EXPOSURE_STATUS_OPTIONS[ExposureStatus.NON_EXPOSED](t) },
  ];
}
