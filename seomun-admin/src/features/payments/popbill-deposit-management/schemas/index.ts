import { z } from 'zod';

import { BankAccountKey, BankDepositStatus } from '../enums';

export const popbillDepositManagementSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).max(100).optional().catch(undefined),
  status: z.nativeEnum(BankDepositStatus).optional().catch(undefined),
  bank_account_key: z.nativeEnum(BankAccountKey).optional().catch(undefined),
});

export type PopbillDepositManagementSearch = z.infer<typeof popbillDepositManagementSearchSchema>;

export type PopbillDepositSearchFilterValues = Pick<PopbillDepositManagementSearch, 'status' | 'bank_account_key'>;
