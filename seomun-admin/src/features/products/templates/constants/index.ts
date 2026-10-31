import type { TFunction } from 'i18next';

import { DEFAULT_DPI } from '@/features/products/web-editors';

import { StatusValue, TemplateSide, TemplateType } from '../enums';
import type { AppSelectOption } from '@/components/shared/app-select';

export const TEMPLATE_STATUS_STYLES: Record<StatusValue, string> = {
  [StatusValue.ACTIVE]: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  [StatusValue.INACTIVE]: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
};

export function getTemplateStatusOptions(t: TFunction<'common'>) {
  return [
    { value: StatusValue.ACTIVE, label: t('status.active', 'Active') },
    { value: StatusValue.INACTIVE, label: t('status.inactive', 'Inactive') },
  ];
}

export function getTemplateTypeOptions(t: TFunction<'page'>): AppSelectOption<TemplateType>[] {
  return Object.values(TemplateType).map((value) => ({
    value,
    label: t(`products.templates.types.${value}`),
  }));
}

export function getTemplateSideOptions(t: TFunction<'page'>): AppSelectOption<TemplateSide>[] {
  return Object.values(TemplateSide).map((value) => ({
    value,
    label: t(`products.templates.sides.${value}`),
  }));
}

// === Canvas geometry ===
// DPI is configured per web editor (WebEditorRES.dpi), not a fixed value —
// callers must pass the selected editor's dpi (falling back to the same
// DEFAULT_DPI a new web editor is created with, when no editor is selected yet).
export const mmToPx = (mm: number, dpi: number = DEFAULT_DPI): number => (mm * dpi) / 25.4;

// Minimum wrap width (content px) for a text box
export const MIN_TEXT_WIDTH = 20;

export const FOLD_NUMBER_MAP: Record<TemplateType, number> = {
  [TemplateType.NO_FOLD]: 0,
  [TemplateType.TWO_FOLD]: 1,
  [TemplateType.THREE_FOLD]: 2,
  [TemplateType.FOUR_FOLD]: 3,
};
