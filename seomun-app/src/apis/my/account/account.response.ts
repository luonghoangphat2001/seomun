export interface MyAccountRESP {
  bank_code: string;
  account_number: string;
  account_holder: string;
  status: string;
  created_at: string;
  last_transaction_at: string | null;
}

export interface MyAccountDetailRESP {
  account: MyAccountRESP | null;
}

export interface MyAccountChangeBankRESP {
  account: MyAccountRESP;
}
