import type { BaseResponse, PaginationResponse } from '@/types/api';

import type { UserLimitStatus } from '../enums';

export interface UserLimitRESP {
  id: number;
  customer: AdminUserRESP;
  limit: number;
  usage_amount: number;
  remaining_amount: number;
  status: UserLimitStatus;
  created_at: string;
  updated_at: string;
}

export interface AdminUserRESP {
  id: number;
  username: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  status: string;
  authority: string | null;
  postcode: string | null;
  address: string | null;
  detailed_address: string | null;
  headquarters: string | null;
  business_office: string | null;
  team: string | null;
  position: string | null;
  agree_privacy: boolean;
  agree_terms: boolean;
  agreed_at: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Userlist {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string | null;
  mobile: string | null;
  headquarters: string | null;
  business_office: string | null;
  team: string | null;
  position: string | null;
}

export type UserListRESP = PaginationResponse<{ members: Userlist[] }>;
export type UserLimitListRESP = PaginationResponse<{ limit: UserLimitRESP[] }>;
export type UserLimitDetailWrapRESP = BaseResponse<{ limit: UserLimitRESP }>;
