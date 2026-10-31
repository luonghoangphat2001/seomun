import type { BaseResponse, PaginationResponse } from '@/types/api';
import { type CATEGORY_STATUS, type CATEGORY_LEVEL } from '../enums';

export type CategoryRegistrant = {
  id: number;
  name?: string;
  username?: string;
};

export type CategoryStatusInfo = {
  value: CATEGORY_STATUS;
  label: string;
};

export type CategoryFilterOption = {
  status_options: Array<{
    value: CATEGORY_STATUS;
    label: string;
  }>;
  category_levels: Array<{
    value: CATEGORY_LEVEL;
    label: string;
  }>;
};

export type CategoryFilterOptionRESP = BaseResponse<{
  filters: CategoryFilterOption;
}>;

export type Category = {
  id: number;
  name: string;
  name_en?: string | null;
  name_ja?: string | null;
  code: string | null;
  slug: string;
  parent_id: number | null;
  parent?: {
    id: number | null;
    name: string | null;
    name_en?: string | null;
    name_ja?: string | null;
    code: string | null;
  } | null;
  description: string | null;
  image: string | null;
  icon: string | null;
  banner_image: string | null;
  level: CATEGORY_LEVEL;
  status: CategoryStatusInfo;
  sort_order: number;
  exposure_order: number | null;
  is_best: boolean;
  exposure_start_date: string | null;
  exposure_end_date: string | null;
  registrant: CategoryRegistrant | null;

  created_at: string;
  updated_at: string;
  children: Category[];
};

export type CategoryListRESP = PaginationResponse<{
  categories: Category[];
}>;

export type CategoryDetailRESP = BaseResponse<{
  category: Category;
}>;

export type CategoryActionRESP = BaseResponse<Record<string, never>>;

export type CategorySortOrderRESP = BaseResponse<Record<string, never>>;

export type UploadExposureImageRESP = BaseResponse<{
  path: string;
  url: string;
}>;

export type ExportHistory = {
  id: number;
  user_id: number;
  module: string;
  status: string;
  file_path: string;
  file_name: string;
  filters: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};
export type ExportCategoryRESP = BaseResponse<{
  history: ExportHistory;
}>;
