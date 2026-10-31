export enum CouponDiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum CouponValidityStatus {
  VALID = 'valid',
  EXPIRED = 'expired',
  UPCOMING = 'upcoming',
}

export enum CouponActiveFilter {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum CouponIssueTargetType {
  SPECIFIC_USERS = 'specific_users',
  ALL_USERS = 'all_users',
}

export enum CouponIssuanceStatus {
  AVAILABLE = 'available',
  USED = 'used',
  UPCOMING = 'upcoming',
  EXPIRED = 'expired',
}

export enum CouponSortField {
  CODE = 'code',
  NAME = 'name',
  STARTS_AT = 'starts_at',
  EXPIRES_AT = 'expires_at',
  CREATED_AT = 'created_at',
}
