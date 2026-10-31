import { useId } from 'react';
import { useController, type FieldPath, type FieldValues } from 'react-hook-form';

import { AppSwitch, type AppSwitchProps } from '@/components/shared/app-switch';
import { cn } from '@/utils/cn';

import { AppFieldLabel } from './AppFieldLabel';
import { AppFieldMessage } from './AppFieldMessage';
import type { AppControlledFormFieldProps } from './types';

export type AppSwitchFormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = AppControlledFormFieldProps<TFieldValues, TName> &
  Omit<
    AppSwitchProps,
    | 'name'
    | 'checked'
    | 'defaultChecked'
    | 'onCheckedChange'
    | 'onValueChange'
    | 'onBlur'
    | 'disabled'
    | 'required'
    | 'isInvalid'
    | 'aria-describedby'
  >;

export function AppSwitchFormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  control,
  name,
  rules,
  shouldUnregister,
  defaultValue,
  disabled,
  label,
  description,
  required,
  labelClassName,
  descriptionClassName,
  errorClassName,
  fieldClassName,
  ...switchProps
}: AppSwitchFormFieldProps<TFieldValues, TName>) {
  const generatedId = useId();
  const fieldId = switchProps.id ?? generatedId;
  const descriptionId = description ? `${fieldId}-description` : undefined;

  const {
    field,
    fieldState: { error },
  } = useController({
    control,
    name,
    rules,
    shouldUnregister,
    defaultValue,
    disabled,
  });

  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;
  const isInvalid = Boolean(error);
  const { ref: fieldRef, name: fieldName, value: fieldValue, onChange: fieldOnChange, onBlur: fieldOnBlur } = field;

  return (
    <div
      className={cn('group/field flex min-w-0 items-start gap-2.5', fieldClassName)}
      data-disabled={disabled ? 'true' : undefined}
      data-invalid={isInvalid ? 'true' : undefined}
    >
      <AppSwitch
        {...switchProps}
        id={fieldId}
        ref={fieldRef}
        name={fieldName}
        checked={fieldValue === true}
        onValueChange={fieldOnChange}
        onBlur={fieldOnBlur}
        disabled={disabled}
        required={required}
        isInvalid={isInvalid}
        aria-describedby={describedBy}
      />

      <div className='min-w-0 space-y-1'>
        <AppFieldLabel htmlFor={fieldId} label={label} required={required} className={labelClassName} />
        <AppFieldMessage id={descriptionId} message={description} className={descriptionClassName} />
        <AppFieldMessage id={errorId} message={error?.message} variant='error' className={errorClassName} />
      </div>
    </div>
  );
}
