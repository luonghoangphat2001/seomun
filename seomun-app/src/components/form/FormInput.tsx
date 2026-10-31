import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Input, InputProps } from '@/components/common';
import { formatKoreanPhoneInput } from '@/lib/utils';

export interface FormInputProps<T extends FieldValues> extends Omit<InputProps, 'name' | 'value' | 'onChange' | 'error'> {
  name: Path<T>;
  control: Control<T>;
  hideError?: boolean;
  numericOnly?: boolean;
  phoneFormat?: boolean;
  numericAsNumber?: boolean;
  onValueChange?: (value: string | number) => void;
}

export const FormInput = <T extends FieldValues>({
  name,
  control,
  hideError,
  numericOnly,
  phoneFormat,
  numericAsNumber,
  onValueChange,
  onBlur: onBlurProp,
  ...props
}: FormInputProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onBlur, onChange, value, ...field }, fieldState: { error } }) => (
        <Input
          {...field}
          {...props}
          isError={!!error}
          error={hideError ? undefined : error?.message}
          value={value ?? ''}
          onBlur={(event) => {
            onBlur();
            onBlurProp?.(event);
          }}
          onChange={(e) => {
            const val = e.target.value;
            if (phoneFormat) {
              const formatted = formatKoreanPhoneInput(val);
              onChange(formatted);
              onValueChange?.(formatted);
            } else if (numericOnly) {
              const numericValue = val.replace(/\D/g, '');
              const nextValue = numericAsNumber ? Number(numericValue || 0) : numericValue;
              onChange(nextValue);
              onValueChange?.(nextValue);
            } else {
              onChange(val);
              onValueChange?.(val);
            }
          }}
        />
      )}
    />
  );
};
