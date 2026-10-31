import { BANK } from '@/enums/dedicated-account';

export interface MyAccountChangeBankREQ {
  bank_code: BANK;
  account_number: string;
  account_holder: string;
}
