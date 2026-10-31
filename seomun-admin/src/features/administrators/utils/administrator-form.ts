import type { FieldErrors } from 'react-hook-form';

import type { AdministratorFormValues } from '../schemas';

export function getFirstFormError(errors: FieldErrors<AdministratorFormValues>) {
  for (const error of Object.values(errors)) {
    if (typeof error?.message === 'string') {
      return error.message;
    }
  }

  return undefined;
}
