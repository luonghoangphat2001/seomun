import type { TFunction } from 'i18next';

import type { AppSelectOption } from '@/components/shared/app-select';
import { ExposureStatus } from '@/enums';

import { GuideType } from '../enums';

export const GUIDE_EXPOSURE_STATUS_OPTIONS: Record<ExposureStatus, (t: TFunction<'page'>) => string> = {
  [ExposureStatus.EXPOSED]: (t) => t('guides.exposure_status_option.exposed'),
  [ExposureStatus.NON_EXPOSED]: (t) => t('guides.exposure_status_option.non_exposed'),
};

export const GUIDE_TYPE_OPTIONS: Record<GuideType, (t: TFunction<'page'>) => string> = {
  [GuideType.COATED]: (t) => t('guides.type_option.coated'),
  [GuideType.OSHI]: (t) => t('guides.type_option.oshi'),
  [GuideType.ROUNDING]: (t) => t('guides.type_option.rounding'),
  [GuideType.PERFORATION]: (t) => t('guides.type_option.perforation'),
  [GuideType.GROUNDING]: (t) => t('guides.type_option.grounding'),
  [GuideType.NUMBERING]: (t) => t('guides.type_option.numbering'),
  [GuideType.DOMUSONG]: (t) => t('guides.type_option.domusong'),
  [GuideType.FOUNDATION]: (t) => t('guides.type_option.foundation'),
};

export function getGuideExposureStatusOptions(t: TFunction<'page'>): AppSelectOption<ExposureStatus>[] {
  return [
    { value: ExposureStatus.EXPOSED, label: GUIDE_EXPOSURE_STATUS_OPTIONS[ExposureStatus.EXPOSED](t) },
    { value: ExposureStatus.NON_EXPOSED, label: GUIDE_EXPOSURE_STATUS_OPTIONS[ExposureStatus.NON_EXPOSED](t) },
  ];
}

export function getGuideTypeOptions(t: TFunction<'page'>): AppSelectOption<GuideType>[] {
  return Object.values(GuideType).map((value) => ({ value, label: GUIDE_TYPE_OPTIONS[value](t) }));
}

export function getGuideExposureTargetOptions(t: TFunction<'page'>): AppSelectOption<string>[] {
  return [{ value: 'all', label: t('guides.enum.exposure_target.all', 'All') }];
}
