export interface PointBalanceRESP {
  balance: number;
}

export interface PointPaginationRESP {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PointTransactionRESP {
  id: number;
  user_id: number;
  type: string;
  type_label: string;
  category: string;
  category_label: string;
  amount: number;
  balance_after: number;
  description: string;
  reference_id: string;
  order_number: string;
  created_at: string;
}

export interface PointTransactionListRESP {
  transactions: PointTransactionRESP[];
  pagination: PointPaginationRESP;
}

export interface PointSummaryRESP {
  total_earned: number;
  total_used: number;
  total_expired: number;
  balance: number;
  expiring_soon_points: number;
  expiring_soon_date: string;
}
