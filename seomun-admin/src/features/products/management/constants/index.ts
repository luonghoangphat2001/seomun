import type { AppSelectOption } from '@/components/shared/app-select';
import { ProductStatus } from '../enums';

export const PRODUCT_STATUS_LABELS = {
  [ProductStatus.SOLD]: 'Sold',
  [ProductStatus.HIDDEN]: 'Hidden',
} satisfies Record<ProductStatus, string>;

export const PRODUCT_STATUS_STYLES = {
  [ProductStatus.SOLD]: 'bg-emerald-100 text-emerald-800',
  [ProductStatus.HIDDEN]: 'bg-slate-200 text-slate-700',
} satisfies Record<ProductStatus, string>;

export const PRODUCT_STATUS_OPTIONS: AppSelectOption<ProductStatus>[] = [
  { value: ProductStatus.SOLD, label: PRODUCT_STATUS_LABELS[ProductStatus.SOLD] },
  { value: ProductStatus.HIDDEN, label: PRODUCT_STATUS_LABELS[ProductStatus.HIDDEN] },
];

export const PRODUCT_BOOLEAN_FILTER_OPTIONS: AppSelectOption<'true' | 'false'>[] = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];

export const PRODUCT_TYPE_OPTIONS: AppSelectOption<string>[] = [
  { value: 'template', label: 'Template' },
  { value: 'general', label: 'General' },
];

export const PRODUCT_INFO_ICON_FIELDS = ['size', 'paper', 'printed_color', 'quantity', 'post_processing', 'design'] as const;

export const DEFAULT_INFINITE_PER_PAGE = 20;
