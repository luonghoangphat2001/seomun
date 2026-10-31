import type { TFunction } from 'i18next';

import type { StringOptions } from '@/types/api';

import { PaperSizeDivisionCode } from '../enums';

type PaperSizeDivisionLabelKey = `page.products.unit_price_settings.enums.paper_size_division.${PaperSizeDivisionCode}`;

export const PAPER_SIZE_DIVISION_LABELS: Record<PaperSizeDivisionCode, PaperSizeDivisionLabelKey> = {
  [PaperSizeDivisionCode.NATIONAL_FULL]: 'page.products.unit_price_settings.enums.paper_size_division.NATIONAL_FULL',
  [PaperSizeDivisionCode.NATIONAL_2]: 'page.products.unit_price_settings.enums.paper_size_division.NATIONAL_2',
  [PaperSizeDivisionCode.NATIONAL_4]: 'page.products.unit_price_settings.enums.paper_size_division.NATIONAL_4',
  [PaperSizeDivisionCode.NATIONAL_8]: 'page.products.unit_price_settings.enums.paper_size_division.NATIONAL_8',
  [PaperSizeDivisionCode.NATIONAL_16]: 'page.products.unit_price_settings.enums.paper_size_division.NATIONAL_16',
  [PaperSizeDivisionCode.SIZE_46_FULL]: 'page.products.unit_price_settings.enums.paper_size_division.SIZE_46_FULL',
  [PaperSizeDivisionCode.SIZE_46_2]: 'page.products.unit_price_settings.enums.paper_size_division.SIZE_46_2',
  [PaperSizeDivisionCode.SIZE_46_4]: 'page.products.unit_price_settings.enums.paper_size_division.SIZE_46_4',
  [PaperSizeDivisionCode.SIZE_46_8]: 'page.products.unit_price_settings.enums.paper_size_division.SIZE_46_8',
  [PaperSizeDivisionCode.SIZE_46_16]: 'page.products.unit_price_settings.enums.paper_size_division.SIZE_46_16',
  [PaperSizeDivisionCode.SMALL_NATIONAL_FULL]: 'page.products.unit_price_settings.enums.paper_size_division.SMALL_NATIONAL_FULL',
  [PaperSizeDivisionCode.SMALL_NATIONAL_2]: 'page.products.unit_price_settings.enums.paper_size_division.SMALL_NATIONAL_2',
  [PaperSizeDivisionCode.SMALL_NATIONAL_4]: 'page.products.unit_price_settings.enums.paper_size_division.SMALL_NATIONAL_4',
};

const PAPER_SIZE_DIVISION_FALLBACK_LABELS: Record<PaperSizeDivisionCode, string> = {
  [PaperSizeDivisionCode.NATIONAL_FULL]: '국전 (636×939mm)',
  [PaperSizeDivisionCode.NATIONAL_2]: '국2절 (636×469mm)',
  [PaperSizeDivisionCode.NATIONAL_4]: '국4절 (468×317mm)',
  [PaperSizeDivisionCode.NATIONAL_8]: '국8절 (234×318mm)',
  [PaperSizeDivisionCode.NATIONAL_16]: '국16절 (159×234mm)',
  [PaperSizeDivisionCode.SIZE_46_FULL]: '사륙 (788×1091mm)',
  [PaperSizeDivisionCode.SIZE_46_2]: '사륙 2절 (788×545mm)',
  [PaperSizeDivisionCode.SIZE_46_4]: '사륙 4절 (394×545mm)',
  [PaperSizeDivisionCode.SIZE_46_8]: '사륙 8절 (394×272mm)',
  [PaperSizeDivisionCode.SIZE_46_16]: '사륙 16절 (197×272mm)',
  [PaperSizeDivisionCode.SMALL_NATIONAL_FULL]: '소국전 (625×880mm)',
  [PaperSizeDivisionCode.SMALL_NATIONAL_2]: '소국전2절 (625×440mm)',
  [PaperSizeDivisionCode.SMALL_NATIONAL_4]: '소국전4절 (440×317mm)',
};

function isPaperSizeDivisionCode(value: string): value is PaperSizeDivisionCode {
  return Object.prototype.hasOwnProperty.call(PAPER_SIZE_DIVISION_LABELS, value);
}

export function getPaperSizeDivisionCodeLabel(t: TFunction, value: string): string {
  if (!isPaperSizeDivisionCode(value)) {
    return value;
  }

  return t(PAPER_SIZE_DIVISION_LABELS[value], PAPER_SIZE_DIVISION_FALLBACK_LABELS[value]);
}

export function getPaperSizeDivisionCodeOptions(t: TFunction): StringOptions[] {
  return Object.values(PaperSizeDivisionCode).map((value) => ({
    value,
    label: getPaperSizeDivisionCodeLabel(t, value),
  }));
}

export function localizePaperSizeDivisionOptions(t: TFunction, options: StringOptions[]): StringOptions[] {
  return options.map((option) => ({ value: option.value, label: getPaperSizeDivisionCodeLabel(t, option.value) }));
}
