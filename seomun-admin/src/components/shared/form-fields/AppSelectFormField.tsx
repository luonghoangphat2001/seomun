import { useController, type FieldPath, type FieldValues } from 'react-hook-form';

import { AppSelect, type AppMultipleSelectProps, type AppSingleSelectProps } from '@/components/shared/app-select';

import { AppFormField } from './AppFormField';
import type { AppControlledFormFieldProps } from './types';

type AppSelectFormFieldBaseProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = AppControlledFormFieldProps<TFieldValues, TName>;

export type AppSingleSelectFormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = AppSelectFormFieldBaseProps<TFieldValues, TName> &
  Omit<AppSingleSelectProps, 'value' | 'defaultValue' | 'onValueChange' | 'isInvalid' | 'aria-describedby'>;

export type AppMultipleSelectFormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = AppSelectFormFieldBaseProps<TFieldValues, TName> &
  Omit<AppMultipleSelectProps, 'value' | 'defaultValue' | 'onValueChange' | 'isInvalid' | 'aria-describedby'>;

export type AppSelectFormFieldProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> =
  | AppSingleSelectFormFieldProps<TFieldValues, TName>
  | AppMultipleSelectFormFieldProps<TFieldValues, TName>;

export function AppSelectFormField<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
  props: AppSelectFormFieldProps<TFieldValues, TName>,
) {
  const {
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
    ...selectProps
  } = props;

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
      id={selectProps.id}
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
      {({ id, labelId, describedBy, isInvalid }) => {
        const ariaLabelledBy = selectProps['aria-labelledby'] ?? labelId;

        if (selectProps.mode === 'multiple') {
          const value = Array.isArray(field.value) ? field.value : [];

          return (
            <AppSelect
              {...selectProps}
              id={id}
              value={value}
              onValueChange={field.onChange}
              disabled={disabled}
              isInvalid={isInvalid}
              aria-labelledby={ariaLabelledBy}
              aria-describedby={describedBy}
            />
          );
        }

        const value = typeof field.value === 'string' ? field.value : undefined;

        return (
          <AppSelect
            {...selectProps}
            id={id}
            value={value}
            // Clearing hands back `undefined`; RHF keeps the previous value for that, so write the empty string instead.
            onValueChange={(next) => field.onChange(next ?? '')}
            disabled={disabled}
            isInvalid={isInvalid}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={describedBy}
          />
        );
      }}
    </AppFormField>
  );
}
