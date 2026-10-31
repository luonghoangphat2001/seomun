export enum InquiryDateRangeFilterTab {
  ONE_WEEK = 'ONE_WEEK',
  ONE_MONTH = 'ONE_MONTH',
  THREE_MONTHS = 'THREE_MONTHS',
  SIX_MONTHS = 'SIX_MONTHS',
}

export enum InquiryStatus {
  ANSWERED = 'answered',
  CHECKING = 'checking',
}

export enum DirectDeliveryType {
  HOUSE = 'house',
  ACADEMY = 'academy',
  SCHOOL = 'school',
}

export enum DirectDeliveryStatus {
  APPROVAL = 'confirmed',
  UNAPPROVAL = 'cancelled',
  UNDERREVIEW = 'pending',
}
