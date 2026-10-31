import { Checkbox, CheckboxProps } from '@/components/common/checkbox';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

export interface FormCheckboxProps<T extends FieldValues> extends Omit<CheckboxProps, 'name' | 'checked' | 'onChange'> {
  name: Path<T>;
  control: Control<T>;
}

export const FormCheckbox = <T extends FieldValues>({ name, control, ...props }: FormCheckboxProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...field } }) => (
        <Checkbox {...field} {...props} checked={!!value} onChange={onChange} />
      )}
    />
  );
};
