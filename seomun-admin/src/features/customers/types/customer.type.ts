import type {
  CustomerApprovalRequestType,
  CustomerApprovalStatus,
  MembershipLevelCode,
  PointActionType,
  PointDetailCategory,
  PointTransactionType,
} from '../enums';

export interface LabelValue<T extends string = string> {
  value: T;
  label: string;
}

export interface CustomerSummary {
  id: number;
  companyName: string;
  businessRegistrationNumber: string | null;
  accessCode: string;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  status: LabelValue<string>;
  approvalStatus: LabelValue<CustomerApprovalStatus>;
  membershipLevel: LabelValue<MembershipLevelCode>;
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDetail extends CustomerSummary {
  postcode?: string | null;
  mobile?: string | null;
  representativeName: string | null;
  address: string | null;
  detailedAddress: string | null;
  fullAddress?: string | null;
  approvedAt?: string | null;
  approvedBy?: {
    id: number;
    name: string;
    username: string;
  } | null;
  editableFields?: Partial<Record<CustomerEditableField, boolean>>;
}

export type CustomerEditableField =
  | 'company_name'
  | 'representative_name'
  | 'business_registration_number'
  | 'contact_name'
  | 'contact_phone'
  | 'contact_email'
  | 'mobile'
  | 'postcode'
  | 'address'
  | 'detailed_address';

export interface CustomerAuditLog {
  id: number;
  action: string;
  field?: string;
  oldValue?: string | null;
  newValue?: string | null;
  changedBy?: {
    id: number;
    name: string;
    email: string;
  } | null;
  changedAt: string;
  actor?: string;
  reason?: string | null;
  changes?: string[];
}

export interface CustomerMember {
  id: number;
  customerId?: number;
  name: string;
  username: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  member_type?: string;
  companyName?: string | null;
  note?: string | null;
  authority?: { value: string | null; label: string };
  approvalStatus: LabelValue<CustomerApprovalStatus>;
  status: LabelValue<string>;
  isMasterAccount: boolean;
  dateOfJoining?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface MemberCompanyInfo {
  companyName: string | null;
  businessRegistrationNumber: string | null;
  representativeName: string | null;
  industryType: string | null;
  businessType: string | null;
  postcode: string | null;
  address: string | null;
  detailedAddress: string | null;
  taxInvoiceEmail: string | null;
  businessRegistrationFile: string | null;
}

export type MemberEditableField =
  | 'name'
  | 'email'
  | 'phone'
  | 'mobile'
  | 'postcode'
  | 'address'
  | 'detailed_address'
  | 'username'
  | 'status'
  | 'note';

export interface MemberDetail extends CustomerMember {
  postcode: string | null;
  address: string | null;
  detailedAddress: string | null;
  fullAddress: string | null;
  company: MemberCompanyInfo | null;
  agreedAt: string | null;
  approvedAt: string | null;
  approvedBy: { id: number; name: string; username: string } | null;
  membershipTier: { id: number; name: string } | null;
  agreePrivacy: boolean;
  agreeTerms: boolean;
  editableFields?: Partial<Record<MemberEditableField, boolean>>;
  refundBank: string | null;
  refundAccountNumber: string | null;
  refundAccountName: string | null;
  virtualAccount: MemberVirtualAccount | null;
}

export interface MemberVirtualAccount {
  provider: string;
  accountNumber: string;
  bankCode: string;
  customerName: string;
  status: string;
}

export interface MemberPermissionInfo {
  membershipLevel: LabelValue<string>;
  availability: { value: boolean; label: string };
  approvalStatus: LabelValue<string>;
  authority: LabelValue<string>;
  status: LabelValue<string>;
  canApprove: boolean;
  canRestore: boolean;
}

export interface CustomerApprovalRequest {
  id: number;
  customerId: number;
  requestType: LabelValue<CustomerApprovalRequestType> | null;
  requester: string;
  requestedAt: string;
  reason: string | null;
  companyName: string;
  businessRegistrationNumber: string | null;
  contactName: string | null;
  status: LabelValue<string>;
  approvalStatus: LabelValue<CustomerApprovalStatus>;
}

export interface CustomerApprovalHistoryItem {
  id: number;
  customerId: number;
  requestType: LabelValue<CustomerApprovalRequestType> | null;
  requester: string;
  approver: string;
  requestedAt: string;
  processedAt: string;
  reason: string | null;
  result: LabelValue<CustomerApprovalStatus>;
  companyName: string;
}

export interface PromotionalProduct {
  id: number;
  name: string;
  sku: string;
  category?: {
    id: number;
    name: string;
  } | null;
  price: number;
  isPromoted: boolean;
  sortOrder?: number;
}

export interface MembershipLevel {
  id: number;
  code: MembershipLevelCode;
  name: string;
  conditionAmount: number;
  promotionThreshold: number;
  averageAmount: number;
  accrualRate: number;
  freeShipping: boolean;
  isActive: boolean;
  displayOrder: number;
  memberCount: number;
}

export interface PointHistoryItem {
  id: number;
  customerId: number;
  memberId: number;
  memberName: string;
  memberLoginId: string;
  contact: string | null;
  email: string;
  category: LabelValue<PointTransactionType>;
  detailCategory: LabelValue<PointDetailCategory | string>;
  orderNumber: string | null;
  amount: number;
  issuedAt: string;
  remarks: string | null;
}

export interface PointSetting {
  newSignupReward: number;
  monthlyRewardLimit: number;
  inviterReward: number;
  invitedReward: number;
  paymentUsageRestrictionEnabled: boolean;
  minimumOrderAmount: number;
  invitationPointPurchaseLimitEnabled: boolean;
  invitationPointPurchasePoints: number;
  invitationPointPurchasePercent: number;
}

export interface PointPolicyItem {
  id: string;
  content: string;
}

export interface PointPolicySection {
  id: string;
  title: string;
  items: PointPolicyItem[];
}

export interface PointChangeLog {
  id: number;
  actor: string;
  action: string;
  targetMemberId: number;
  targetName: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface PointManualAdjustmentPayload {
  memberId: number;
  action: PointActionType;
  amount: number;
  reason: string;
}

export interface PointTargetMember {
  memberId: number;
  customerId: number;
  memberName: string;
  memberLoginId: string;
  customerName: string;
  contact: string | null;
  email: string;
  membershipLevel: LabelValue<MembershipLevelCode>;
}
