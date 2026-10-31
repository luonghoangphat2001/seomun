import { useController, type FieldPath, type FieldValues } from 'react-hook-form';

import { AppInput, type AppInputProps } from '@/components/shared/app-input';

import { AppFormField } from './AppFormField';
import type { AppControlledFormFieldProps } from './types';

export type AppInputFormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = AppControlledFormFieldProps<TFieldValues, TName> &
  Omit<AppInputProps, 'name' | 'value' | 'defaultValue' | 'onValueChange' | 'onChange' | 'onBlur' | 'ref' | 'isInvalid' | 'aria-describedby'> & {
    normalize?: (value: string) => string;
  };

export function AppInputFormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
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
  normalize,
  ...inputProps
}: AppInputFormFieldProps<TFieldValues, TName>) {
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
      id={inputProps.id}
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
      {({ id, describedBy, isInvalid }) => (
        <AppInput
          {...inputProps}
          id={id}
          ref={field.ref}
          name={field.name}
          value={typeof field.value === 'string' || typeof field.value === 'number' ? String(field.value) : ''}
          onValueChange={(next) => field.onChange(normalize ? normalize(next) : next)}
          onBlur={field.onBlur}
          disabled={disabled}
          required={required}
          isInvalid={isInvalid}
          aria-describedby={describedBy}
        />
      )}
    </AppFormField>
  );
}
