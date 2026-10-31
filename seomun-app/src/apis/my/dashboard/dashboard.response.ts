import { OrderHistoryRESP } from '../order/order.response';

export type DashboardStatusRESP = {
  key: string;
  label: string;
  count: number;
};

export type DashboardMemberTierRESP = {
  id: number;
  name: string;
  threshold_amount: number;
  accumulation_rate: number;
  has_free_shipping: boolean;
  required_amount: number;
};

export type DashboardMemberSummaryRESP = {
  name: string;
  membership_tier: string;
  accumulation_rate: number;
  point_balance: number;
  prepaid_balance: number;
  exclusive_account: null;
  current_quarter_spent: number;
  next_tier: DashboardMemberTierRESP;
};

export type DashboardInquirySummaryRESP = {
  category: string;
  label: string;
  answered: number;
  pending: number;
  total: number;
};

export type DashboardReviewSummaryRESP = {
  reviewable_count: number;
  photo_review_points: number;
  normal_review_points: number;
};

export type DashboardRESP = {
  member_summary: DashboardMemberSummaryRESP;
  production_status: DashboardStatusRESP[];
  design_status: DashboardStatusRESP[];
  delivery_status: DashboardStatusRESP[];
  recent_orders: OrderHistoryRESP[];
  inquiry_summary: DashboardInquirySummaryRESP[];
  review_summary: DashboardReviewSummaryRESP;
};
