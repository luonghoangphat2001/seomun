import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';

import type { ImageListREQ } from '../api/image.request';
import { ImageSortField } from '../enums';
import type { ImageListSearch } from '../schemas';

export type NormalizedImageListParams = ImageListREQ & Required<Pick<ImageListREQ, 'page' | 'per_page'>>;

export function buildImageListParams(search: ImageListSearch): NormalizedImageListParams {
  return {
    ...search,
    sort_order: search.sort_by ? (search.sort_order ?? SortOrder.ASC) : undefined,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}

const IMAGE_SORT_FIELD_VALUES = new Set<string>(Object.values(ImageSortField));

export function isImageSortField(value: string): value is ImageSortField {
  return IMAGE_SORT_FIELD_VALUES.has(value);
}
