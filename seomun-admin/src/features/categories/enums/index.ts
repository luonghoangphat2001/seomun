export enum CATEGORY_LEVEL {
  LARGE = 'large',
  MEDIUM = 'medium',
  SMALL = 'small',
}
export enum CATEGORY_STATUS {
  ACTIVE = 'active',
  HIDDEN = 'hidden',
}

export enum CATEGORY_SORT_FIELD {
  NAME = 'name',
  STATUS = 'status',
  IS_BEST = 'is_best',
  SORT_ORDER = 'sort_order',
  CREATED_AT = 'created_at',
}

export enum ExportType {
  ALL = 'ALL',
  CURRENT = 'CURRENT',
  SELECTED = 'SELECTED',
}

export enum ExportStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
