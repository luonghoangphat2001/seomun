import { isAxiosError } from 'axios';

export type ApiErrorPayload = {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: unknown;
};

export type ApiErrorMessagePriority = 'error' | 'validation' | 'message';

export type ApiErrorMessageOptions = {
  priority?: ApiErrorMessagePriority[];
};

const DEFAULT_PRIORITY: ApiErrorMessagePriority[] = ['error', 'validation', 'message'];

export function getFirstValidationError(errors: unknown): string | undefined {
  if (typeof errors === 'string' && errors.trim()) return errors;
  if (Array.isArray(errors)) return errors.find((error): error is string => typeof error === 'string' && Boolean(error.trim()));

  if (errors && typeof errors === 'object') {
    for (const error of Object.values(errors)) {
      const message = getFirstValidationError(error);
      if (message) return message;
    }
  }

  return undefined;
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string, options?: ApiErrorMessageOptions) {
  if (!isAxiosError<ApiErrorPayload>(error)) return fallbackMessage;

  const payload = error.response?.data;
  const priority = options?.priority ?? DEFAULT_PRIORITY;
  const candidates: Record<ApiErrorMessagePriority, string | undefined> = {
    error: payload?.error,
    validation: getFirstValidationError(payload?.errors),
    message: payload?.message,
  };

  return priority.map((key) => candidates[key]).find((message): message is string => Boolean(message?.trim())) ?? fallbackMessage;
}
