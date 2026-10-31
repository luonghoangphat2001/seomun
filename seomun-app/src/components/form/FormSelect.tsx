import { Select, SelectProps } from '@/components/common';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

export interface FormSelectProps<T extends FieldValues> extends Omit<SelectProps, 'name' | 'value' | 'onChange' | 'error'> {
  name: Path<T>;
  control: Control<T>;
  onChange?: (value: string | number) => void;
  hideError?: boolean;
}

export const FormSelect = <T extends FieldValues>({
  name,
  control,
  onChange: customOnChange,
  hideError,
  ...props
}: FormSelectProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
        <Select
          {...field}
          {...props}
          isError={!!error}
          error={hideError ? undefined : error?.message}
          value={value ?? ''}
          onChange={(val) => {
            onChange(val);
            customOnChange?.(val);
          }}
        />
      )}
    />
  );
};
