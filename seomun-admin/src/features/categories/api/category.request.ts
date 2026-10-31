import type { PaginationRequest, SortRequest } from '@/types/api';
import type { CATEGORY_LEVEL, CATEGORY_SORT_FIELD, CATEGORY_STATUS } from '../enums';

export type CategoryListREQ = PaginationRequest &
  SortRequest<CATEGORY_SORT_FIELD> & {
    name?: string;
    status?: CATEGORY_STATUS;
    level?: CATEGORY_LEVEL;
    registrant?: string;
    tree?: boolean;
  };

export type CategorySaveREQ = {
  name: string;
  code?: string;
  name_en?: string;
  slug?: string;
  description?: string;
  parent_id?: number | null;
  status: CATEGORY_STATUS;
  level: CATEGORY_LEVEL;
  sort_order?: number;
  image?: string;
  banner_image?: string;
  icon?: string;
  exposure_order?: number;
  is_best: boolean;
  exposure_start_date?: string | null;
  exposure_end_date?: string | null;
};

export type CategoryCreateREQ = CategorySaveREQ;

export type CategoryUpdateREQ = Partial<CategorySaveREQ>;

export type CategorySortOrderItem = {
  id: number;
  sort_order: number;
};

export type CategorySortOrderREQ = {
  categories: CategorySortOrderItem[];
};

export type ExportCategoriesREQ = {
  export_type: 'ALL' | 'CURRENT_PAGE' | 'SELECTED';
  locale?: string;
  sort_by?: CATEGORY_SORT_FIELD;
  sort_order?: 'asc' | 'desc';
  name?: string;
  status?: CATEGORY_STATUS;
  level?: CATEGORY_LEVEL;
  registrant?: string;
  current_page?: number;
  per_page?: number;
  selected_ids?: number[];
};

export type UpdateCategoryExposureREQ = {
  exposure_order?: number;
  exposure_start_date?: string | null;
  exposure_end_date?: string | null;
};
