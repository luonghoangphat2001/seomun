import { Control, FieldValues, Path, PathValue, UseFormSetValue, useFormContext, useWatch } from 'react-hook-form';
import { FormRow } from './FormRow';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';
import { cn } from '@/lib/utils';

interface FormEmailProps<T extends FieldValues> {
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  nameId: Path<T>;
  nameDomain: Path<T>;
  nameDomainSelect: Path<T>;
  label: string;
  emailOptions: { label: string; value: string }[];
  placeholderId?: string;
  placeholderDomain?: string;
  placeholderSelect?: string;
  required?: boolean;
  labelPlacement?: 'top' | 'left';
  inputClassName?: string;
  labelClassName?: string;
  selectInputClassName?: string;
  emailInputClassName?: string;
}

export const FormEmail = <T extends FieldValues>({
  control,
  setValue,
  nameId,
  nameDomain,
  nameDomainSelect,
  label,
  emailOptions,
  placeholderId,
  placeholderDomain,
  placeholderSelect,
  required,
  labelPlacement,
  inputClassName,
  labelClassName,
  selectInputClassName,
  emailInputClassName,
}: FormEmailProps<T>) => {
  const {
    formState: { errors },
  } = useFormContext();

  const domainSelect = useWatch({ control, name: nameDomainSelect });
  const isDirectInput = domainSelect === 'direct';

  const error = (errors[nameId]?.message || errors[nameDomain]?.message) as string | undefined;

  return (
    <FormRow
      label={label}
      required={required}
      error={error}
      inputClassName={inputClassName}
      labelClassName={labelClassName}
      labelPlacement={labelPlacement}>
      <div className='flex items-center gap-2'>
        <FormInput
          control={control}
          name={nameId}
          placeholder={placeholderId}
          showClear={false}
          hideError
          className={cn(emailInputClassName)}
        />
        <span className='input-15 shrink-0'>@</span>
        <FormInput
          control={control}
          name={nameDomain}
          placeholder={placeholderDomain}
          showClear={isDirectInput}
          readOnly={!isDirectInput}
          hideError
        />
        <div className={cn('w-26 shrink-0', selectInputClassName)}>
          <FormSelect
            control={control}
            name={nameDomainSelect}
            options={emailOptions}
            placeholder={placeholderSelect}
            hideError
            onChange={(val) => {
              if (val !== 'direct') {
                setValue(nameDomain, val as PathValue<T, Path<T>>);
              } else {
                setValue(nameDomain, '' as PathValue<T, Path<T>>);
              }
            }}
          />
        </div>
      </div>
    </FormRow>
  );
};
