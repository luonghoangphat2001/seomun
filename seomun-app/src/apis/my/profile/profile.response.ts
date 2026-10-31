import { Membership, User } from '@/types';

export type ProfileCustomer = NonNullable<User['customer']> & {
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  business_items?: string | null;
  business_registration_file?: string | null;
};

export interface UploadBusinessRegistrationFileRESP {
  file_path: string;
  file_url: string;
}

export interface ProfileBalance {
  id: number;
  user_id: number;
  balance: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileVirtualAccount {
  id: number;
  user_id: number;
  provider: string;
  account_number: string;
  bank: {
    code: string;
    name: string;
  };
  customer_name: string;
  account_type: string;
  status: string;
  issued_at: string;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type ProfileUser = Omit<User, 'avatar' | 'customer' | 'headquarters' | 'business_office' | 'team' | 'position'> & {
  avatar?: string | null;
  headquarters: string | null;
  business_office: string | null;
  team: string | null;
  position: string | null;
  customer: ProfileCustomer | null;
  authority?: string | null;
  role?: string | null;
  is_admin?: boolean;
  is_super_admin?: boolean;
  is_store_admin?: boolean;
  is_normal_user?: boolean;
  permission?: string | null;
  individual_approval?: boolean;
  approval_line?: unknown[];
  agree_sms?: boolean;
  agree_email?: boolean;
  agreed_at?: string | null;
};

export interface ProfileRESP {
  profile: ProfileUser;
  membership: {
    current_quarter_spent: number;
    current: Membership | null;
    next: Membership | null;
  };
  point: { balance: number };
  balance: ProfileBalance | null;
  virtual_account: ProfileVirtualAccount | null;
}
