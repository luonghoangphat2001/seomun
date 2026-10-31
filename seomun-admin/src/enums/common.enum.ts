export enum ExposureStatus {
  EXPOSED = 'exposed',
  NON_EXPOSED = 'non-exposed',
}

export const EXPOSURE_STATUS_LABELS: Record<ExposureStatus, string> = {
  [ExposureStatus.EXPOSED]: 'Exposed',
  [ExposureStatus.NON_EXPOSED]: 'Non-exposed',
};

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum SOURCE_TYPE {
  UPLOAD_FILE = 'upload_file',
  WEB_EDITOR = 'web_editor',
}
