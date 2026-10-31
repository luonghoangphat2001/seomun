export enum AccessLogEventType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
}

export enum AccessLogExportType {
  ALL = 'ALL',
  CURRENT_PAGE = 'CURRENT_PAGE',
  SELECTED = 'SELECTED',
}

export enum AccessLogSortField {
  LOGIN_ID = 'login_id',
  IP_ADDRESS = 'ip_address',
  CONNECTION_TIME = 'connection_time',
}
