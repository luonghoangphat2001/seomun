import type { BaseResponse } from '@/types/api';

export type User = {
  id: number;
  status: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  mobile: string;
  postcode: string;
  address: string;
  detailed_address: string;
  authority: string;
  role: string;
  is_admin: boolean;
  is_super_admin: boolean;
  is_store_admin: boolean;
  is_normal_user: boolean;
  headquarters: string;
  business_office: string;
  team: string;
  position: string;
};

export type LoginData = {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
};

export type LoginRESP = BaseResponse<LoginData>;
