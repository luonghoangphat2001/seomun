import { isAxiosError } from 'axios';

import type { CategoryFormData } from '../schemas';

type CategoryApiErrorPayload = {
  errors?: Record<string, unknown>;
  message?: string;
};

export type CategoryFormApiErrors = Partial<Record<keyof CategoryFormData, string>>;

const CATEGORY_API_FIELD_MAP: Record<string, keyof CategoryFormData> = {
  code: 'code',
  name: 'name',
  name_en: 'name_en',
  slug: 'slug',
  description: 'description',
  parent_id: 'parentId',
  parentId: 'parentId',
  level: 'level',
  status: 'status',
  sort_order: 'rank',
  rank: 'rank',
  image: 'image',
  banner_image: 'banner_image',
  icon: 'icon_image',
  icon_image: 'icon_image',
  exposure_order: 'exposure_order',
  is_best: 'is_best',
  exposure_start_date: 'display_start_date',
  display_start_date: 'display_start_date',
  exposure_end_date: 'display_end_date',
  display_end_date: 'display_end_date',
};

function getApiErrorPayload(error: unknown) {
  if (!isAxiosError<CategoryApiErrorPayload>(error)) return undefined;
  return error.response?.data;
}

function getValidationMessage(value: unknown) {
  if (typeof value === 'string' && value.trim()) return value;
  if (!Array.isArray(value)) return undefined;
  return value.find((message): message is string => typeof message === 'string' && Boolean(message.trim()));
}

export function getCategoryFormApiErrors(error: unknown): CategoryFormApiErrors {
  const errors = getApiErrorPayload(error)?.errors;
  if (!errors || typeof errors !== 'object') return {};

  return Object.entries(errors).reduce<CategoryFormApiErrors>((fieldErrors, [apiField, value]) => {
    const formField = CATEGORY_API_FIELD_MAP[apiField];
    const message = getValidationMessage(value);

    if (formField && message) {
      fieldErrors[formField] = message;
    }

    return fieldErrors;
  }, {});
}

export function getCategoryApiErrorMessage(error: unknown, fallbackMessage: string) {
  const payload = getApiErrorPayload(error);
  const validationMessage = payload?.errors && Object.values(payload.errors).map(getValidationMessage).find(Boolean);

  return validationMessage ?? payload?.message ?? fallbackMessage;
}
