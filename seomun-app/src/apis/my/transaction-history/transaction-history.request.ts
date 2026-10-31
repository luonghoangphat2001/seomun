export type TransactionHistoryListREQ = {
  start_date?: string;
  end_date?: string;
  months?: 1 | 3 | 6;
  search?: string;
};
