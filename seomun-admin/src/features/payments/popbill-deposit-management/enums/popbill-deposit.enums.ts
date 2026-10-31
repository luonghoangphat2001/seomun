export enum BankDepositStatus {
  UNMATCHED = 'unmatched',
  MATCHED = 'matched',
}

export enum BankAccountKey {
  WOORI = 'woori',
  HANA = 'hana',
  IM = 'im',
}

export enum BankDepositMatchReason {
  NO_EXACT_MATCH = 'no_exact_match',
  AMBIGUOUS_MATCH = 'ambiguous_match',
  PAYMENT_CHANGED = 'payment_changed',
  EXACT_MATCH = 'exact_match',
  MANUAL = 'manual',
}
