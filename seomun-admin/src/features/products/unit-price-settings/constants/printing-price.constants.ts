import type { TFunction } from 'i18next';

import type { StringOptions } from '@/types/api';

import { BookPrintingSizeType, BookPrintingType, PrintingMachineType, PrintSideType } from '../enums';

type PrintingEnumLabelKey = `page.products.unit_price_settings.enums.${string}.${string}`;

const PRINTING_MACHINE_TYPE_LABELS: Record<PrintingMachineType, PrintingEnumLabelKey> = {
  [PrintingMachineType.IX3200]: 'page.products.unit_price_settings.enums.machine_type.IX3200',
  [PrintingMachineType.P1350]: 'page.products.unit_price_settings.enums.machine_type.P1350',
  [PrintingMachineType.P140]: 'page.products.unit_price_settings.enums.machine_type.P140',
};

const PRINTING_MACHINE_TYPE_FALLBACK_LABELS: Record<PrintingMachineType, string> = {
  [PrintingMachineType.IX3200]: 'IX3200',
  [PrintingMachineType.P1350]: 'P1350',
  [PrintingMachineType.P140]: 'P140',
};

const BOOK_PRINTING_SIZE_TYPE_LABELS: Record<BookPrintingSizeType, PrintingEnumLabelKey> = {
  [BookPrintingSizeType.TYPE_A]: 'page.products.unit_price_settings.enums.size_type.TYPE_A',
  [BookPrintingSizeType.TYPE_B]: 'page.products.unit_price_settings.enums.size_type.TYPE_B',
  [BookPrintingSizeType.TYPE_C]: 'page.products.unit_price_settings.enums.size_type.TYPE_C',
  [BookPrintingSizeType.A4]: 'page.products.unit_price_settings.enums.size_type.A4',
  [BookPrintingSizeType.A5]: 'page.products.unit_price_settings.enums.size_type.A5',
  [BookPrintingSizeType.B5]: 'page.products.unit_price_settings.enums.size_type.B5',
  [BookPrintingSizeType.NATION4]: 'page.products.unit_price_settings.enums.size_type.NATION4',
  [BookPrintingSizeType.NATION8]: 'page.products.unit_price_settings.enums.size_type.NATION8',
  [BookPrintingSizeType.NATION16]: 'page.products.unit_price_settings.enums.size_type.NATION16',
};

const BOOK_PRINTING_SIZE_TYPE_FALLBACK_LABELS: Record<BookPrintingSizeType, string> = {
  [BookPrintingSizeType.TYPE_A]: 'Type A',
  [BookPrintingSizeType.TYPE_B]: 'Type B',
  [BookPrintingSizeType.TYPE_C]: 'Type C',
  [BookPrintingSizeType.A4]: 'A4',
  [BookPrintingSizeType.A5]: 'A5',
  [BookPrintingSizeType.B5]: 'B5',
  [BookPrintingSizeType.NATION4]: 'National 4',
  [BookPrintingSizeType.NATION8]: 'National 8',
  [BookPrintingSizeType.NATION16]: 'National 16',
};

const PRINT_SIDE_TYPE_LABELS: Record<PrintSideType, PrintingEnumLabelKey> = {
  [PrintSideType.SINGLE]: 'page.products.unit_price_settings.enums.side_type.SINGLE',
  [PrintSideType.DOUBLE]: 'page.products.unit_price_settings.enums.side_type.DOUBLE',
};

const PRINT_SIDE_TYPE_FALLBACK_LABELS: Record<PrintSideType, string> = {
  [PrintSideType.SINGLE]: 'Single-sided',
  [PrintSideType.DOUBLE]: 'Double-sided',
};

const BOOK_PRINTING_TYPE_LABELS: Record<BookPrintingType, PrintingEnumLabelKey> = {
  [BookPrintingType.BOOKLET_COVER]: 'page.products.unit_price_settings.enums.printing_type.BOOKLET_COVER',
  [BookPrintingType.BOOKLET_INNER]: 'page.products.unit_price_settings.enums.printing_type.BOOKLET_INNER',
};

const BOOK_PRINTING_TYPE_FALLBACK_LABELS: Record<BookPrintingType, string> = {
  [BookPrintingType.BOOKLET_COVER]: 'Booklet Cover',
  [BookPrintingType.BOOKLET_INNER]: 'Booklet Inner',
};

export function createEnumHelpers<TEnum extends string, TLabelKey extends string = PrintingEnumLabelKey>(
  labels: Record<TEnum, TLabelKey>,
  fallbackLabels: Record<TEnum, string>,
) {
  function isValue(value: string): value is TEnum {
    return Object.prototype.hasOwnProperty.call(labels, value);
  }

  function getLabel(t: TFunction, value: string): string {
    if (!isValue(value)) {
      return value;
    }

    return t(labels[value], fallbackLabels[value] as string);
  }

  function getOptions(t: TFunction): StringOptions[] {
    return (Object.keys(labels) as TEnum[]).map((value) => ({ value, label: getLabel(t, value) }));
  }

  return { getLabel, getOptions };
}

export const printingMachineTypeHelpers = createEnumHelpers(PRINTING_MACHINE_TYPE_LABELS, PRINTING_MACHINE_TYPE_FALLBACK_LABELS);
export const bookPrintingSizeTypeHelpers = createEnumHelpers(BOOK_PRINTING_SIZE_TYPE_LABELS, BOOK_PRINTING_SIZE_TYPE_FALLBACK_LABELS);
export const printSideTypeHelpers = createEnumHelpers(PRINT_SIDE_TYPE_LABELS, PRINT_SIDE_TYPE_FALLBACK_LABELS);
export const bookPrintingTypeHelpers = createEnumHelpers(BOOK_PRINTING_TYPE_LABELS, BOOK_PRINTING_TYPE_FALLBACK_LABELS);

export const getPrintingMachineTypeLabel = printingMachineTypeHelpers.getLabel;
export const getPrintingMachineTypeOptions = printingMachineTypeHelpers.getOptions;
export const getBookPrintingSizeTypeLabel = bookPrintingSizeTypeHelpers.getLabel;
export const getBookPrintingSizeTypeOptions = bookPrintingSizeTypeHelpers.getOptions;
export const getPrintSideTypeLabel = printSideTypeHelpers.getLabel;
export const getPrintSideTypeOptions = printSideTypeHelpers.getOptions;
export const getBookPrintingTypeLabel = bookPrintingTypeHelpers.getLabel;
export const getBookPrintingTypeOptions = bookPrintingTypeHelpers.getOptions;
