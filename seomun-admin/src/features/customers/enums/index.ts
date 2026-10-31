export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  WITHDRAWN = 'withdrawn',
}

export enum CustomerApprovalStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}

export enum MemberType {
  BUSINESS = 'business',
  INDIVIDUAL = 'individual',
}

export enum CustomerApprovalRequestType {
  SIGN_UP = 'SIGN_UP',
  INFORMATION_MODIFICATION = 'INFORMATION_MODIFICATION',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
}

export enum MembershipLevelCode {
  FAMILY = 'FAMILY',
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  DIAMOND = 'DIAMOND',
  VIP = 'VIP',
}

export enum PointTransactionType {
  EARN = 'earn',
  USE = 'use',
  EXPIRE = 'expire',
  REFUND = 'refund',
}

export enum PointDetailCategory {
  PAYMENT = 'PAYMENT',
  DEDUCTION = 'DEDUCTION',
  SIGNUP_REWARD = 'SIGNUP_REWARD',
  INVITE_REWARD = 'INVITE_REWARD',
  MANUAL_GRANT = 'MANUAL_GRANT',
  MANUAL_DEDUCTION = 'MANUAL_DEDUCTION',
  RESTORED_POINTS = 'RESTORED_POINTS',
}

export enum PointActionType {
  GRANT = 'GRANT',
  DEDUCT = 'DEDUCT',
}
