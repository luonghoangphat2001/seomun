import { useController, type FieldPath, type FieldValues } from 'react-hook-form';

import { AppDatePicker, type AppDatePickerProps } from '@/components/shared/app-date-picker';

import { AppFormField } from './AppFormField';
import type { AppControlledFormFieldProps } from './types';

export type AppDatePickerFormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = AppControlledFormFieldProps<TFieldValues, TName> &
  Omit<
    AppDatePickerProps,
    'name' | 'value' | 'defaultValue' | 'onValueChange' | 'onChange' | 'onBlur' | 'ref' | 'disabled' | 'required' | 'isInvalid' | 'aria-describedby'
  >;

export function AppDatePickerFormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
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
  ...datePickerProps
}: AppDatePickerFormFieldProps<TFieldValues, TName>) {
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

  const fieldValue = field.value as unknown;
  const value = fieldValue instanceof Date ? fieldValue : null;

  return (
    <AppFormField
      id={datePickerProps.id}
      label={label}
      description={description}
      error={error?.message}
      required={required}
      disabled={disabled}
      className={fieldClassName}
      labelClassName={labelClassName}
      descriptionClassName={descriptionClassName}
      errorClassName={errorClassName}
    >
      {({ id, labelId, describedBy, isInvalid }) => (
        <AppDatePicker
          {...datePickerProps}
          id={id}
          ref={field.ref}
          name={field.name}
          value={value}
          onValueChange={field.onChange}
          onBlur={field.onBlur}
          disabled={disabled}
          required={required}
          isInvalid={isInvalid}
          aria-labelledby={datePickerProps['aria-labelledby'] ?? labelId}
          aria-describedby={describedBy}
        />
      )}
    </AppFormField>
  );
}
