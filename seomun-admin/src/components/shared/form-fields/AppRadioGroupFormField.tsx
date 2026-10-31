import { useController, type FieldPath, type FieldValues } from 'react-hook-form';

import { AppRadioGroup, type AppRadioGroupProps } from '@/components/shared/app-radio-group';

import { AppFormField } from './AppFormField';
import type { AppControlledFormFieldProps } from './types';

export type AppRadioGroupFormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = AppControlledFormFieldProps<TFieldValues, TName> &
  Omit<AppRadioGroupProps, 'name' | 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'disabled' | 'isInvalid' | 'aria-describedby'>;

export function AppRadioGroupFormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
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
  ...radioGroupProps
}: AppRadioGroupFormFieldProps<TFieldValues, TName>) {
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

  return (
    <AppFormField
      id={radioGroupProps.id}
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
        <AppRadioGroup
          {...radioGroupProps}
          id={id}
          name={field.name}
          value={typeof field.value === 'string' ? field.value : undefined}
          onValueChange={field.onChange}
          onBlur={field.onBlur}
          disabled={disabled}
          isInvalid={isInvalid}
          aria-labelledby={radioGroupProps['aria-labelledby'] ?? labelId}
          aria-describedby={describedBy}
        />
      )}
    </AppFormField>
  );
}
