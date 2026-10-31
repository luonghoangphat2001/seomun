import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Textarea, TextareaProps } from '@/components/common';

export interface FormTextareaProps<T extends FieldValues> extends Omit<TextareaProps, 'name' | 'value' | 'onChange' | 'error'> {
  name: Path<T>;
  control: Control<T>;
  hideError?: boolean;
  numericOnly?: boolean;
}

export const FormTextarea = <T extends FieldValues>({
  name,
  control,
  hideError,
  numericOnly,
  ...props
}: FormTextareaProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
        <Textarea
          {...field}
          {...props}
          isError={!!error}
          error={hideError ? undefined : error?.message}
          value={value ?? ''}
          onChange={(e) => {
            const val = e.target.value;
            if (numericOnly) {
              onChange(val.replace(/\D/g, ''));
            } else {
              onChange(val);
            }
          }}
        />
      )}
    />
  );
};
