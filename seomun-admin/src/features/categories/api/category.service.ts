import type { Category } from './category.response';
import type { CategorySaveREQ } from './category.request';
import { EMPTY_VALUES, type CategoryFormData } from '../schemas';
import { toDate, toUtcEndOfDay, toUtcStartOfDay } from '../utils';

export function toFormValues(category?: Category | null): CategoryFormData {
  if (!category) return EMPTY_VALUES;

  return {
    code: category.code ?? '',
    name: category.name,
    name_en: category.name_en ?? '',
    slug: category.slug ?? '',
    description: category.description ?? '',
    parentId: category.parent_id ? category.parent_id.toString() : '',
    level: category.level,
    status: category.status.value,
    rank: category.sort_order,
    image: category.image ?? '',
    banner_image: category.banner_image ?? '',
    icon_image: category.icon ?? '',
    exposure_order: category.exposure_order ?? 0,
    is_best: category.is_best,
    display_start_date: toDate(category.exposure_start_date),
    display_end_date: toDate(category.exposure_end_date),
  };
}

export function mapCategoryFormToRequest(data: CategoryFormData): CategorySaveREQ {
  return {
    code: data.code,
    name: data.name,
    name_en: data.name_en,
    slug: data.slug,
    description: data.description,
    parent_id: data.parentId ? Number(data.parentId) : null,
    status: data.status,
    level: data.level,
    sort_order: data.rank,
    image: data.image,
    banner_image: data.banner_image,
    icon: data.icon_image,
    exposure_order: data.exposure_order,
    is_best: data.is_best,
    exposure_start_date: toUtcStartOfDay(data.display_start_date),
    exposure_end_date: toUtcEndOfDay(data.display_end_date),
  };
}
