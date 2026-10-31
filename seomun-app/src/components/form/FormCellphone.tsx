import { Button, Popover } from '@/components/common';
import { OtpModal, OtpModalHandle } from '@/components/common/otp-modal';
import { Info } from '@/icons';
import { cn } from '@/lib/utils';
import { getFormErrorMessage } from '@/lib/utils/helper';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { Control, FieldValues, Path, useFormContext } from 'react-hook-form';
import { FormInput } from './FormInput';
import { FormRow } from './FormRow';
import { FormSelect } from './FormSelect';

interface FormCellphoneProps<T extends FieldValues> {
  control: Control<T>;
  namePrefix: Path<T>;
  name1: Path<T>;
  name2: Path<T>;
  label: string;
  phoneOptions: { label: string; value: string }[];
  placeholderSelect?: string;
  /** Renders the phone prefix as a three-digit numeric input instead of a select. */
  isPrefixInput?: boolean;
  required?: boolean;
  showVerification?: boolean;
  verificationLabel?: string;
  showIcon?: boolean;
  iconClassName?: string;
  popoverContent?: React.ReactNode;
  labelPlacement?: 'top' | 'left';
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  onVerify?: () => void;
  onOtpVerify?: (otp: string) => void;
  onOtpResend?: () => void;
  onSendCode?: () => void;
  verificationClassName?: string;
  isSendingCode?: boolean;
  isVerifying?: boolean;
  otpModalRef?: React.RefObject<OtpModalHandle | null>;
  readOnly?: boolean;
  isVerified?: boolean;
  showSeparator?: boolean;
}

export const FormCellphone = <T extends FieldValues>({
  control,
  namePrefix,
  name1,
  name2,
  label,
  phoneOptions,
  placeholderSelect,
  isPrefixInput = false,
  required,
  showVerification,
  verificationLabel,
  showIcon,
  iconClassName,
  popoverContent,
  labelPlacement,
  className,
  inputClassName,
  labelClassName,
  onVerify,
  onOtpVerify,
  onOtpResend,
  onSendCode,
  verificationClassName,
  isSendingCode,
  isVerifying,
  otpModalRef,
  readOnly,
  isVerified,
  showSeparator = true,
}: FormCellphoneProps<T>) => {
  const internalModalRef = useRef<OtpModalHandle>(null);
  const modalRef = otpModalRef || internalModalRef;
  const {
    formState: { errors },
    watch,
    setFocus,
  } = useFormContext();

  // Move the caret between phone parts: forward when a part is full, back on Backspace in an empty part.
  const focusEnd = (name: Path<T>) => {
    setFocus(name as string);
    const input = document.activeElement;
    if (input instanceof HTMLInputElement) input.setSelectionRange(input.value.length, input.value.length);
  };
  const focusNextWhenFull = (next: Path<T>, length: number) => (value: string | number) => {
    if (String(value).length === length) focusEnd(next);
  };
  const focusPrevOnEmpty = (prev: Path<T>) => (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Backspace' || event.currentTarget.value) return;
    event.preventDefault();
    focusEnd(prev);
  };

  const error = (getFormErrorMessage(errors, namePrefix) ||
    getFormErrorMessage(errors, name1) ||
    getFormErrorMessage(errors, name2)) as string | undefined;

  const renderIcon = () => {
    if (!showIcon || !popoverContent) return null;

    return (
      <Popover
        contentClassName='w-[220px] caption-12'
        trigger={<Info className={cn('size-4 text-gray-400', iconClassName)} />}
        align='left'>
        {popoverContent}
      </Popover>
    );
  };

  const handleVerify = () => {
    if (onVerify) {
      onVerify();
    } else if (onSendCode) {
      onSendCode();
      modalRef.current?.open();
    } else {
      modalRef.current?.open();
    }
  };

  const phonePrefixValue = watch(namePrefix as string);
  const phone1Value = watch(name1 as string);
  const phone2Value = watch(name2 as string);
  const formattedPhone = [phonePrefixValue, phone1Value, phone2Value].filter(Boolean).join('-');

  const tAuth = useTranslations('auth');
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
        <div className='flex w-full items-center gap-1.5'>
          <div className='w-full flex-1'>
            {isPrefixInput ? (
              <FormInput
                control={control}
                name={namePrefix}
                maxLength={3}
                showClear={false}
                hideError
                numericOnly
                readOnly={readOnly}
                placeholder='-'
                onValueChange={focusNextWhenFull(name1, 3)}
              />
            ) : (
              <FormSelect
                control={control}
                name={namePrefix}
                options={phoneOptions}
                placeholder={placeholderSelect}
                hideError
                readOnly={readOnly}
              />
            )}
          </div>
          {showSeparator && <span className='input-15'>-</span>}
          <div className='w-full flex-1'>
            <FormInput
              control={control}
              name={name1}
              maxLength={4}
              showClear={false}
              hideError
              numericOnly
              readOnly={readOnly}
              placeholder='-'
              onValueChange={focusNextWhenFull(name2, 4)}
              onKeyDown={isPrefixInput ? focusPrevOnEmpty(namePrefix) : undefined}
            />
          </div>
          {showSeparator && <span className='input-15'>-</span>}
          <div className='w-full flex-1'>
            <FormInput
              control={control}
              name={name2}
              maxLength={4}
              showClear={false}
              hideError
              numericOnly
              readOnly={readOnly}
              placeholder='-'
              onKeyDown={focusPrevOnEmpty(name1)}
            />
          </div>
          <div className={cn('w-19 md:w-30', verificationClassName)}>
            {showVerification && (
              <Button
                variant='secondary'
                className={cn(
                  'bg-border-soft button-13 h-11 w-19 shrink-0 px-2 font-medium md:w-30',
                  phonePrefixValue && phone1Value && phone2Value && !error && !isVerified && 'hover:bg-border-light',
                )}
                type='button'
                onClick={handleVerify}
                loading={isSendingCode}
                disabled={!phonePrefixValue || !phone1Value || !phone2Value || !!error || isVerified}>
                {isVerified ? tAuth('verified') : verificationLabel}
              </Button>
            )}
          </div>
        </div>
      </FormRow>

      <OtpModal ref={modalRef} phone={formattedPhone} onVerify={onOtpVerify} onResend={onOtpResend} isVerifying={isVerifying} />
    </>
  );
};
