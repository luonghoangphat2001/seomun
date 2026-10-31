export type BaseResponse<T> = {
  data: T;
  message: string;
  success: boolean;
};

export type PaginationMeta = {
  current_page: number;
  per_page: number;
  total_page: number;
  total_item: number;
};

export interface PaginatedResponse<T> extends BaseResponse<T[]> {
  pagination: PaginationMeta;
}

export interface PaginationResponse<T> extends BaseResponse<T> {
  pagination: PaginationMeta;
}

export type NestedPaginationResponse<T> = {
  data: T & {
    pagination: PaginationMeta;
  };
  message?: string;
  success: boolean;
};

export interface IBaseError {
  error?: string;
  error_code?: string;
  errors: unknown;
  message: string;
  success: boolean;
}

export type StringOptions = {
  value: string;
  label: string;
};

export type NumberOptions = {
  value: number;
  label: string;
};
