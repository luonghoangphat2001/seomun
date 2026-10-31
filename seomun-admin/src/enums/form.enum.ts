export enum FormMode {
  CREATE = 'create',
  EDIT = 'edit',
  DETAIL = 'detail',
}

export const FORM_MODE_LABELS: Record<FormMode, string> = {
  [FormMode.CREATE]: 'Create',
  [FormMode.EDIT]: 'Edit',
  [FormMode.DETAIL]: 'Detail',
};
