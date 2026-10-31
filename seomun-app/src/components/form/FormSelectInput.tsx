'use client';

import { Button } from '@/components/common';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { FieldValues, useFormContext } from 'react-hook-form';
import { FormInput } from './FormInput';
import { FormSelect, FormSelectProps } from './FormSelect';

export type FormSelectInputProps<T extends FieldValues> = FormSelectProps<T>;

export const FormSelectInput = <T extends FieldValues>({ name, control, ...props }: FormSelectInputProps<T>) => {
  const [isDirectInput, setIsDirectInput] = useState(false);
  const { setValue, clearErrors } = useFormContext<T>();
  const t = useTranslations();

  const handleToggle = () => {
    const next = !isDirectInput;
    setIsDirectInput(next);

    if (next) {
      setValue(name, '' as T[typeof name], {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      clearErrors(name);
    }
  };

  const { options, selectClassname, optionsClassname, renderSelectedValue, onChange: customOnChange, ...commonProps } = props;

  return (
    <div className='flex w-full items-center gap-3'>
      <div className='min-w-0 flex-1'>
        {isDirectInput ? (
          <FormInput name={name} control={control} {...commonProps} />
        ) : (
          <FormSelect
            name={name}
            control={control}
            {...commonProps}
            options={options}
            selectClassname={selectClassname}
            optionsClassname={optionsClassname}
            renderSelectedValue={renderSelectedValue}
            onChange={(value) => {
              customOnChange?.(value);
              clearErrors(name);
            }}
          />
        )}
      </div>
      <Button type='button' variant='outline' size='md' className='h-11 shrink-0 rounded-full px-4' onClick={handleToggle}>
        {isDirectInput ? t('auth.select') : t('auth.direct_input')}
      </Button>
    </div>
  );
};
