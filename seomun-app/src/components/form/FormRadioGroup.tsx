import { RadioGroup, RadioGroupProps } from '@/components/common';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

export interface FormRadioGroupProps<T extends FieldValues> extends Omit<
  RadioGroupProps,
  'name' | 'value' | 'onChange' | 'error'
> {
  name: Path<T>;
  control: Control<T>;
}

export const FormRadioGroup = <T extends FieldValues>({ name, control, children, ...props }: FormRadioGroupProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <RadioGroup {...field} {...props} error={error?.message} value={field.value ?? ''}>
          {children}
        </RadioGroup>
      )}
    />
  );
};
