import { useController, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { AppDateRangePicker, type AppDateRangePickerProps } from '@/components/shared/app-date-range-picker';

import { AppFormField } from './AppFormField';
import type { AppFormFieldSharedProps } from './types';

export type AppDateRangePickerFormFieldProps<
  TFieldValues extends FieldValues,
  TFromName extends FieldPath<TFieldValues>,
  TToName extends FieldPath<TFieldValues>,
> = AppFormFieldSharedProps &
  Omit<
    AppDateRangePickerProps,
    'value' | 'onChange' | 'disabled' | 'required' | 'isInvalid' | 'aria-describedby' | 'aria-labelledby' | 'name' | 'onBlur'
  > & {
    control: Control<TFieldValues>;
    fromName: TFromName;
    toName: TToName;
    disabled?: boolean;
    required?: boolean;
    id?: string;
  };

export function AppDateRangePickerFormField<
  TFieldValues extends FieldValues,
  TFromName extends FieldPath<TFieldValues>,
  TToName extends FieldPath<TFieldValues>,
>({
  control,
  fromName,
  toName,
  disabled,
  label,
  description,
  required,
  labelClassName,
  descriptionClassName,
  errorClassName,
  fieldClassName,
  ...dateRangePickerProps
}: AppDateRangePickerFormFieldProps<TFieldValues, TFromName, TToName>) {
  const {
    field: fromField,
    fieldState: { error: fromError },
  } = useController({
    control,
    name: fromName,
    disabled,
  });

  const {
    field: toField,
    fieldState: { error: toError },
  } = useController({
    control,
    name: toName,
    disabled,
  });

  const fromValue = fromField.value as Date | null | undefined;
  const toValue = toField.value as Date | null | undefined;

  return (
    <AppFormField
      id={dateRangePickerProps.id}
      label={label}
      description={description}
      error={fromError?.message || toError?.message}
      required={required}
      disabled={disabled}
      className={fieldClassName}
      labelClassName={labelClassName}
      descriptionClassName={descriptionClassName}
      errorClassName={errorClassName}
    >
      {({ id, labelId, describedBy, isInvalid }) => (
        <AppDateRangePicker
          {...dateRangePickerProps}
          id={id}
          name={`${fromField.name}-${toField.name}`}
          value={{
            from: fromValue ?? undefined,
            to: toValue ?? undefined,
          }}
          onChange={(range) => {
            fromField.onChange(range?.from ? new Date(range.from) : null);
            toField.onChange(range?.to ? new Date(range.to) : null);
          }}
          onBlur={() => {
            fromField.onBlur();
            toField.onBlur();
          }}
          disabled={disabled}
          required={required}
          isInvalid={isInvalid}
          aria-labelledby={labelId}
          aria-describedby={describedBy}
        />
      )}
    </AppFormField>
  );
}
