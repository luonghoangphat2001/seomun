import type { TFunction } from 'i18next';
import type { KeyboardEvent } from 'react';

import type { AppSelectOption } from '@/components/shared/app-select';

import { ErpOptionDisplayType, ErpOptionGroupType, PaperCategory, PaperStatusValue } from '../enums';

export const NO_SPIN_INPUT_CLASS =
  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

export function blockNonPositiveNumericKeys(e: KeyboardEvent<HTMLInputElement>) {
  if (['+', '-', 'e', 'E'].includes(e.key)) e.preventDefault();
}

type ErpOptionGroupTypeLabelKey =
  | 'page.products.options.enums.group_type.DEFAULT'
  | 'page.products.options.enums.group_type.STANDARD'
  | 'page.products.options.enums.group_type.PRINTED_COLOR'
  | 'page.products.options.enums.group_type.PAPER'
  | 'page.products.options.enums.group_type.POST_PROCESSING';

export const ERP_OPTION_GROUP_TYPE_LABELS: Record<ErpOptionGroupType, ErpOptionGroupTypeLabelKey> = {
  [ErpOptionGroupType.DEFAULT]: 'page.products.options.enums.group_type.DEFAULT',
  [ErpOptionGroupType.STANDARD]: 'page.products.options.enums.group_type.STANDARD',
  [ErpOptionGroupType.PRINTED_COLOR]: 'page.products.options.enums.group_type.PRINTED_COLOR',
  [ErpOptionGroupType.PAPER]: 'page.products.options.enums.group_type.PAPER',
  [ErpOptionGroupType.POST_PROCESSING]: 'page.products.options.enums.group_type.POST_PROCESSING',
};

export function getErpOptionGroupTypeLabel(t: TFunction, type: ErpOptionGroupType) {
  return t(ERP_OPTION_GROUP_TYPE_LABELS[type]);
}

export function getErpOptionGroupTypeOptions(t: TFunction): AppSelectOption<ErpOptionGroupType>[] {
  return Object.values(ErpOptionGroupType).map((type) => ({
    value: type,
    label: getErpOptionGroupTypeLabel(t, type),
  }));
}

type ErpOptionDisplayTypeLabelKey =
  | 'page.products.options.enums.display_type.select'
  | 'page.products.options.enums.display_type.radio'
  | 'page.products.options.enums.display_type.checkbox';

export const ERP_OPTION_DISPLAY_TYPE_LABELS: Record<ErpOptionDisplayType, ErpOptionDisplayTypeLabelKey> = {
  [ErpOptionDisplayType.SELECT]: 'page.products.options.enums.display_type.select',
  [ErpOptionDisplayType.RADIO]: 'page.products.options.enums.display_type.radio',
  [ErpOptionDisplayType.CHECKBOX]: 'page.products.options.enums.display_type.checkbox',
};

export function getErpOptionDisplayTypeLabel(t: TFunction, type: ErpOptionDisplayType) {
  return t(ERP_OPTION_DISPLAY_TYPE_LABELS[type]);
}

export function getErpOptionDisplayTypeOptions(t: TFunction): AppSelectOption<ErpOptionDisplayType>[] {
  return Object.values(ErpOptionDisplayType).map((type) => ({
    value: type,
    label: getErpOptionDisplayTypeLabel(t, type),
  }));
}

type PaperCategoryLabelKey =
  | 'page.products.options.enums.paper_category.GENERAL_PAPER'
  | 'page.products.options.enums.paper_category.SPECIALTY_PAPER'
  | 'page.products.options.enums.paper_category.HIGH_QUALITY_PAPER'
  | 'page.products.options.enums.paper_category.STICKER_PAPER'
  | 'page.products.options.enums.paper_category.PAPERBOARD'
  | 'page.products.options.enums.paper_category.BANNER'
  | 'page.products.options.enums.paper_category.PLASTIC'
  | 'page.products.options.enums.paper_category.COLORED_PAPER';

export const PAPER_CATEGORY_LABELS: Record<PaperCategory, PaperCategoryLabelKey> = {
  [PaperCategory.GENERAL_PAPER]: 'page.products.options.enums.paper_category.GENERAL_PAPER',
  [PaperCategory.SPECIALTY_PAPER]: 'page.products.options.enums.paper_category.SPECIALTY_PAPER',
  [PaperCategory.HIGH_QUALITY_PAPER]: 'page.products.options.enums.paper_category.HIGH_QUALITY_PAPER',
  [PaperCategory.STICKER_PAPER]: 'page.products.options.enums.paper_category.STICKER_PAPER',
  [PaperCategory.PAPERBOARD]: 'page.products.options.enums.paper_category.PAPERBOARD',
  [PaperCategory.BANNER]: 'page.products.options.enums.paper_category.BANNER',
  [PaperCategory.PLASTIC]: 'page.products.options.enums.paper_category.PLASTIC',
  [PaperCategory.COLORED_PAPER]: 'page.products.options.enums.paper_category.COLORED_PAPER',
};

export function getPaperCategoryLabel(t: TFunction, category: PaperCategory) {
  return t(PAPER_CATEGORY_LABELS[category]);
}

export function getPaperCategoryOptions(t: TFunction): AppSelectOption<PaperCategory>[] {
  return Object.values(PaperCategory).map((category) => ({
    value: category,
    label: getPaperCategoryLabel(t, category),
  }));
}

type PaperStatusLabelKey = 'page.products.options.enums.paper_status.active' | 'page.products.options.enums.paper_status.hidden';

export const PAPER_STATUS_LABELS: Record<PaperStatusValue, PaperStatusLabelKey> = {
  [PaperStatusValue.ACTIVE]: 'page.products.options.enums.paper_status.active',
  [PaperStatusValue.HIDDEN]: 'page.products.options.enums.paper_status.hidden',
};

export function getPaperStatusLabel(t: TFunction, status: PaperStatusValue) {
  return t(PAPER_STATUS_LABELS[status]);
}

export function getPaperStatusOptions(t: TFunction): AppSelectOption<PaperStatusValue>[] {
  return Object.values(PaperStatusValue).map((status) => ({
    value: status,
    label: getPaperStatusLabel(t, status),
  }));
}
