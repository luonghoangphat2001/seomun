export enum AdministratorRole {
  SUPER_ADMIN = 'super_admin',
  NORMAL_USER = 'normal_user',
  STORE_ADMIN = 'store_admin',
}

export enum AdministratorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum AdministratorBulkAction {
  STATUS = 'status',
  PERMISSION = 'permission',
  DELETE = 'delete',
}

export enum AdministratorExportExcelType {
  ALL = 'ALL',
  CURRENT_PAGE = 'CURRENT_PAGE',
  SELECTED = 'SELECTED',
}

export enum AdministratorSortField {
  NAME = 'name',
  ROLE = 'role',
  EMAIL = 'email',
  STATUS = 'status',
}
