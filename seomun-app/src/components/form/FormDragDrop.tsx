import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { DragDrop, DragDropProps } from '@/components/common';

export interface FormDragDropProps<T extends FieldValues> extends Omit<DragDropProps, 'files' | 'onChange' | 'error'> {
  name: Path<T>;
  control: Control<T>;
}

export const FormDragDrop = <T extends FieldValues>({ name, control, ...props }: FormDragDropProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <DragDrop {...props} files={value ?? []} onChange={onChange} error={error?.message} />
      )}
    />
  );
};
