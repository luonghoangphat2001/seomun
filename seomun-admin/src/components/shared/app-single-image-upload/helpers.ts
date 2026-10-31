import { IMAGE_TYPE_LABELS } from './constants';
import type { AppSingleImageUploadValue } from './types';

export function resolveImageUrl(value: AppSingleImageUploadValue, blobUrl: string | null): string {
  if (!value) return '';
  if (value instanceof File) return blobUrl ?? '';
  return value;
}

export function buildAcceptDescription(accept: string, maxSizeMB: number): string {
  const types = [
    ...new Set(
      accept.split(',').map((type) => {
        const normalizedType = type.trim().toLowerCase();
        return IMAGE_TYPE_LABELS[normalizedType] ?? normalizedType.replace(/^image\//, '').toUpperCase();
      }),
    ),
  ].join(', ');

  return `${types} - max ${maxSizeMB}MB`;
}
