import type { AxiosError } from 'axios';

import type { IBaseError } from '@/types/api';

function getFirstValidationError(errors: unknown): string | undefined {
  if (typeof errors === 'string') {
    return errors;
  }

  if (Array.isArray(errors)) {
    return errors.find((error): error is string => typeof error === 'string');
  }

  if (errors && typeof errors === 'object') {
    for (const error of Object.values(errors)) {
      const message = getFirstValidationError(error);

      if (message) {
        return message;
      }
    }
  }

  return undefined;
}

export function getAdministratorAPIErrorMessage(error: AxiosError<IBaseError>, fallbackMessage: string) {
  const response = error.response?.data;

  return response?.message || response?.error || getFirstValidationError(response?.errors) || fallbackMessage;
}
