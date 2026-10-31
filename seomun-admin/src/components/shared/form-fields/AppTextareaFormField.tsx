import { useController, type FieldPath, type FieldValues } from 'react-hook-form';

import { AppTextarea, type AppTextareaProps } from '@/components/shared/app-textarea';

import { AppFormField } from './AppFormField';
import type { AppControlledFormFieldProps } from './types';

export type AppTextareaFormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = AppControlledFormFieldProps<TFieldValues, TName> &
  Omit<AppTextareaProps, 'name' | 'value' | 'defaultValue' | 'onValueChange' | 'onChange' | 'onBlur' | 'ref' | 'isInvalid' | 'aria-describedby'>;

export function AppTextareaFormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
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
  ...textareaProps
}: AppTextareaFormFieldProps<TFieldValues, TName>) {
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
      id={textareaProps.id}
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
        <AppTextarea
          {...textareaProps}
          id={id}
          ref={field.ref}
          name={field.name}
          value={typeof field.value === 'string' ? field.value : ''}
          onValueChange={field.onChange}
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
