export type BaseResponse<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

export type PaginationResponse<T> = BaseResponse<T> & {
  pagination: PaginationRESP;
};

export type PaginationRESP = {
  current_page?: number;
  per_page?: number;
  total_item?: number;
  total_page?: number;
  total?: number;
  last_page?: number;
};

export type ErrorRESP = {
  success?: boolean;
  message?: string;
  errors?: string;
};
