import type { TFunction } from 'i18next';

import type { AppSelectOption } from '@/components/shared/app-select';
import type { Category } from '../api';
import type { CATEGORY_LEVEL } from '../enums';

export type FlatCategoryOption = AppSelectOption<string> & {
  level: number;
  categoryLevel?: CATEGORY_LEVEL;
};

export function toDate(value: string | null | undefined): Date | null {
  return value ? new Date(value) : null;
}

export function flattenCategories(categories: Category[], currentCategoryId?: number, level = 0): FlatCategoryOption[] {
  return categories.flatMap((category) => {
    const children = category.children?.length ? flattenCategories(category.children, currentCategoryId, level + 1) : [];

    if (category.id === currentCategoryId) {
      return children;
    }

    return [
      {
        value: category.id.toString(),
        label: `${'— '.repeat(level)}${category.name}`,
        level,
        categoryLevel: category.level,
      },
      ...children,
    ];
  });
}

export function getErrorMessage(tValidation: TFunction<'validation'>, message?: string, field?: string) {
  if (!message) return undefined;
  if (message === 'validation.required') return tValidation('required', { field });
  if (message === 'validation.min_number') return tValidation('min_number', { min: 0 });
  if (message === 'validation.end_date_after_start_date') return tValidation('end_date_after_start_date');
  return message;
}

export function translateFormErrors(
  errors: Record<string, { message?: string } | undefined>,
  labels: Record<string, string>,
  tValidation: TFunction<'validation'>,
) {
  Object.entries(errors).forEach(([name, error]) => {
    if (error?.message) {
      error.message = getErrorMessage(tValidation, error.message, labels[name]);
    }
  });
}

export function toUtcStartOfDay(value: Date | null | undefined): string | null {
  if (!value) return null;

  return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate())).toISOString().slice(0, 10);
}

export function toUtcEndOfDay(value: Date | null | undefined): string | null {
  if (!value) return null;

  return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate())).toISOString().slice(0, 10);
}
