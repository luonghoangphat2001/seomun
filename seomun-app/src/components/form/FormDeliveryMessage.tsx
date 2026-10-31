'use client';

import { isDeliveryMessagePreset } from '@/constants/common';
import { getFormErrorMessage } from '@/lib/utils/helper';
import { Control, FieldValues, Path, PathValue, useFormContext, useWatch } from 'react-hook-form';
import { FormRow } from './FormRow';
import { FormSelect } from './FormSelect';
import { FormInput } from './FormInput';
import { FormTextarea } from './FormTextarea';

interface FormDeliveryMessageProps<T extends FieldValues> {
  control: Control<T>;
  messageOptions: { label: string; value: string }[];
  nameMessageOption: Path<T>;
  nameMessageNote: Path<T>;
  label: string;
  required?: boolean;
  messageOptionPlaceholder?: string;
  messageNotePlaceholder?: string;
  labelPlacement?: 'top' | 'left';
  inputClassName?: string;
  labelClassName?: string;
}

export const FormDeliveryMessage = <T extends FieldValues>({
  control,
  messageOptions,
  nameMessageOption,
  nameMessageNote,
  label,
  required = false,
  messageOptionPlaceholder,
  messageNotePlaceholder,
  labelPlacement = 'top',
  inputClassName,
  labelClassName,
}: FormDeliveryMessageProps<T>) => {
  const {
    setValue,
    formState: { errors },
  } = useFormContext<T>();
  const messageOption = useWatch({ control, name: nameMessageOption });

  const error = (getFormErrorMessage(errors, nameMessageOption) || getFormErrorMessage(errors, nameMessageNote)) as
    string | undefined;

  return (
    <FormRow
      label={label}
      required={required}
      error={error}
      inputClassName={inputClassName}
      labelClassName={labelClassName}
      labelPlacement={labelPlacement}>
      <div className='space-y-1 md:space-y-3'>
        <FormSelect
          control={control}
          name={nameMessageOption}
          options={messageOptions}
          placeholder={messageOptionPlaceholder}
          hideError
          onChange={(value) => {
            if (isDeliveryMessagePreset(value)) setValue(nameMessageNote, '' as PathValue<T, Path<T>>, { shouldDirty: true });
          }}
        />
        <FormTextarea
          control={control}
          name={nameMessageNote}
          placeholder={messageNotePlaceholder}
          hideError
          disabled={isDeliveryMessagePreset(messageOption)}
        />
      </div>
    </FormRow>
  );
};
