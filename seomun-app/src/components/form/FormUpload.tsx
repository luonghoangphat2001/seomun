import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Upload, UploadProps } from '@/components/common';

export interface FormUploadProps<T extends FieldValues> extends Omit<UploadProps, 'name' | 'files' | 'onChange' | 'error'> {
  name: Path<T>;
  control: Control<T>;
}

export const FormUpload = <T extends FieldValues>({ name, control, ...props }: FormUploadProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...field }, fieldState: { error } }) => (
        <Upload {...field} {...props} files={value ?? []} onChange={(files) => onChange(files)} error={error?.message} />
      )}
    />
  );
};
