import type { PaginationRequest, SortRequest } from '@/types/api';

import type { UserLimitStatus, UserStatus } from '../enums';

export interface UserLimitListREQ extends PaginationRequest, SortRequest<'created_at'> {
  name?: string;
  status?: UserLimitStatus;
}

export interface UserListREQ extends PaginationRequest {
  search_term?: string;
  authority?: string;
  status?: UserStatus;
}

export interface UserLimitCreateREQ {
  user_id: number;
  limit: number;
  remaining_amount: number;
  status: UserLimitStatus;
}

export interface UserLimitUpdateREQ {
  user_id: number;
  limit: number;
  status: UserLimitStatus;
}
