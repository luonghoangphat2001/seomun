export interface VirtualAccountRESP {
  id: number;
  user_id: number;
  provider: string;
  account_number: string;
  bank_code: string;
  customer_name: string;
  account_type: string;
  status: string;
  issued_at: string;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface VirtualAccountDetailRESP {
  virtual_account: VirtualAccountRESP | null;
}

export interface VirtualAccountCreateRESP {
  id: number;
  user_id: number;
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  status: string;
  created_at: string;
  updated_at: string;
}
