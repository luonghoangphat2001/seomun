import type { TFunction } from 'i18next';
import { z } from 'zod';

import { BookPrintingSizeType, BookPrintingType, PaperSizeDivisionCode, PrintingMachineType, PrintSideType } from '../enums';

const requiredNumberString = (t: TFunction, fieldLabel: string) =>
  z
    .string()
    .trim()
    .min(1, t('validation.required', { field: fieldLabel }))
    .refine((value) => !isNaN(Number(value)), t('validation.numeric_only'))
    .refine((value) => Number(value) >= 0, t('validation.min_number', { min: 0 }));

const enumSelectString = (t: TFunction, enumObject: Record<string, string>, fieldLabel: string) => {
  const message = t('validation.required', { field: fieldLabel });
  return z
    .string()
    .trim()
    .min(1, message)
    .refine((value) => Object.values(enumObject).includes(value), message);
};

// Optional counterpart: empty is allowed, anything else still has to be a real enum member.
const optionalEnumSelectString = (enumObject: Record<string, string>) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || Object.values(enumObject).includes(value))
    .optional();

export function createPrintingPriceItemFormSchema(t: TFunction) {
  return z.object({
    id: z.number().optional(),
    quantity: requiredNumberString(t, t('page.products.unit_price_settings.printing_price.dialog.item_quantity', 'Quantity')),
    supply_price: requiredNumberString(t, t('page.products.unit_price_settings.printing_price.dialog.item_supply_price', 'Supply price')),
    cost: requiredNumberString(t, t('page.products.unit_price_settings.printing_price.dialog.item_cost', 'Cost')),
  });
}

export function createPrintingPriceFormSchema(t: TFunction) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, t('validation.required', { field: t('page.products.unit_price_settings.printing_price.dialog.name', 'Name') })),
    machine_type: enumSelectString(t, PrintingMachineType, t('page.products.unit_price_settings.printing_price.dialog.machine_type', 'Machine type')),
    book_printing_size_type: enumSelectString(
      t,
      BookPrintingSizeType,
      t('page.products.unit_price_settings.printing_price.dialog.size_type', 'Size type'),
    ),
    paper_size_division_code: enumSelectString(
      t,
      PaperSizeDivisionCode,
      t('page.products.unit_price_settings.paper_price.dialog.paper_size', 'Paper size'),
    ),
    side_type: optionalEnumSelectString(PrintSideType),
    book_printing_type: optionalEnumSelectString(BookPrintingType),
    is_hot_deal: z.boolean(),
    items: z
      .array(createPrintingPriceItemFormSchema(t))
      .min(1, t('page.products.unit_price_settings.printing_price.dialog.items_required', 'At least one quantity tier is required')),
  });
}

export type PrintingPriceItemFormValues = z.infer<ReturnType<typeof createPrintingPriceItemFormSchema>>;
export type PrintingPriceFormValues = z.infer<ReturnType<typeof createPrintingPriceFormSchema>>;

export function getEmptyPrintingPriceItem(): PrintingPriceItemFormValues {
  return { quantity: '1', supply_price: '0', cost: '0' };
}

export function getPrintingPriceFormDefaults(): PrintingPriceFormValues {
  return {
    name: '',
    machine_type: '',
    book_printing_size_type: '',
    paper_size_division_code: '',
    side_type: '',
    book_printing_type: '',
    is_hot_deal: false,
    items: [getEmptyPrintingPriceItem()],
  };
}
