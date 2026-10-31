import { Button, Modal, ModalHandle, Popover } from '@/components/common';
import { useMediaQuery } from '@/hooks';
import { Info } from '@/icons';
import { cn } from '@/lib/utils';
import { getFormErrorMessage } from '@/lib/utils/helper';
import { useRef } from 'react';
import DaumPostcodeEmbed, { Address } from 'react-daum-postcode';
import { Control, FieldValues, Path, PathValue, useFormContext } from 'react-hook-form';
import { FormInput } from './FormInput';
import { FormRow } from './FormRow';

interface FormAddressProps<T extends FieldValues> {
  control: Control<T>;
  nameZipCode: Path<T>;
  nameAddress: Path<T>;
  nameDetailedAddress: Path<T>;
  label: string;
  required?: boolean;
  zipCodePlaceholder?: string;
  addressPlaceholder?: string;
  detailedAddressPlaceholder?: string;
  searchLabel?: string;
  onSearch?: () => void;
  iconClassName?: string;
  popoverContent?: React.ReactNode;
  labelIcon?: React.ReactNode;
  labelPlacement?: 'top' | 'left';
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  buttonClassName?: string;
  helperText?: string;
  disabled?: boolean;
}

export const FormAddress = <T extends FieldValues>({
  control,
  nameZipCode,
  nameAddress,
  nameDetailedAddress,
  label,
  required,
  zipCodePlaceholder,
  addressPlaceholder,
  detailedAddressPlaceholder,
  searchLabel,
  onSearch,
  iconClassName,
  popoverContent,
  labelIcon,
  labelPlacement,
  className,
  inputClassName,
  labelClassName,
  buttonClassName,
  helperText,
  disabled,
}: FormAddressProps<T>) => {
  const modalRef = useRef<ModalHandle>(null);
  const {
    formState: { errors },
    setValue,
    getValues,
  } = useFormContext<T>();

  const isDesktop = useMediaQuery('(min-width: 768px)');

  const handleComplete = (data: Address) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }

    // The old detailed address no longer belongs to a newly picked address.
    if (getValues(nameAddress) !== fullAddress) {
      setValue(nameDetailedAddress, '' as PathValue<T, Path<T>>, { shouldDirty: true });
    }
    setValue(nameZipCode, data.zonecode as PathValue<T, Path<T>>, { shouldDirty: true, shouldValidate: true });
    setValue(nameAddress, fullAddress as PathValue<T, Path<T>>, { shouldDirty: true, shouldValidate: true });
    modalRef.current?.close();
  };

  const handleSearchClick = () => {
    if (disabled) return;

    if (onSearch) {
      onSearch();
    } else {
      modalRef.current?.open();
    }
  };
  const renderIcon = () => {
    if (labelIcon) return labelIcon;
    if (!popoverContent) return null;

    return (
      <Popover
        contentClassName='w-[220px] caption-12'
        trigger={<Info className={cn('size-4 text-gray-400', iconClassName)} />}
        align='left'>
        {popoverContent}
      </Popover>
    );
  };

  const error = (getFormErrorMessage(errors, nameZipCode) ||
    getFormErrorMessage(errors, nameAddress) ||
    getFormErrorMessage(errors, nameDetailedAddress)) as string | undefined;

  return (
    <>
      <FormRow
        label={label}
        required={required}
        error={error}
        className={className}
        inputClassName={inputClassName}
        labelClassName={labelClassName}
        icon={renderIcon()}
        labelPlacement={labelPlacement}>
        <div className='space-y-1 md:space-y-3'>
          <div className='flex items-center gap-1.5'>
            <FormInput
              control={control}
              name={nameZipCode}
              placeholder={zipCodePlaceholder}
              readOnly
              disabled={disabled}
              showClear={false}
              hideError
            />
            <Button
              variant='secondary'
              className={cn('bg-border-soft hover:bg-border-light h-11 w-19 shrink-0 px-0 md:w-30 md:px-2', buttonClassName)}
              onClick={handleSearchClick}
              disabled={disabled}
              type='button'>
              {searchLabel}
            </Button>
          </div>
          <FormInput
            control={control}
            name={nameAddress}
            placeholder={addressPlaceholder}
            readOnly
            disabled={disabled}
            hideError
          />
          <FormInput
            control={control}
            name={nameDetailedAddress}
            placeholder={detailedAddressPlaceholder}
            disabled={disabled}
            hideError
          />
        </div>
        {helperText && <p className='caption-12 text-error mt-1.5'>{helperText}</p>}
      </FormRow>

      <Modal ref={modalRef} size='md' position={isDesktop ? 'center' : 'bottom'}>
        <DaumPostcodeEmbed onComplete={handleComplete} />
      </Modal>
    </>
  );
};
