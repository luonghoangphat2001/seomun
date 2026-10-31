import { useId, type ReactNode } from 'react';

import { cn } from '@/utils/cn';

import { AppFieldLabel } from './AppFieldLabel';
import { AppFieldMessage } from './AppFieldMessage';

export type AppFormFieldRenderProps = {
  id: string;
  labelId: string | undefined;
  describedBy: string | undefined;
  isInvalid: boolean;
  disabled: boolean;
  required: boolean;
};

export type AppFormFieldProps = {
  id?: string;
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
  children: (props: AppFormFieldRenderProps) => ReactNode;
};

export function AppFormField({
  id,
  label,
  description,
  error,
  required = false,
  disabled = false,
  className,
  labelClassName,
  descriptionClassName,
  errorClassName,
  children,
}: AppFormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const labelId = label ? `${fieldId}-label` : undefined;
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;
  const isInvalid = Boolean(error);

  return (
    <div
      className={cn('group/field flex min-w-0 flex-col gap-1.5', className)}
      data-disabled={disabled ? 'true' : undefined}
      data-invalid={isInvalid ? 'true' : undefined}
    >
      <AppFieldLabel id={labelId} htmlFor={fieldId} label={label} required={required} className={labelClassName} />

      {children({ id: fieldId, labelId, describedBy, isInvalid, disabled, required })}

      <AppFieldMessage id={descriptionId} message={description} className={descriptionClassName} />

      <AppFieldMessage id={errorId} message={error} variant='error' className={errorClassName} />
    </div>
  );
}
