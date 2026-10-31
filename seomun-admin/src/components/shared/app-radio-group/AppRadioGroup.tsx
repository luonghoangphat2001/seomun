import { useId } from 'react';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/utils/cn';

import {
  APP_RADIO_GROUP_CONTROL_SIZE_CLASSES,
  APP_RADIO_GROUP_DESCRIPTION_SIZE_CLASSES,
  APP_RADIO_GROUP_ITEM_SIZE_CLASSES,
  APP_RADIO_GROUP_LABEL_SIZE_CLASSES,
  APP_RADIO_GROUP_ORIENTATION_CLASSES,
} from './constants';
import type { AppRadioGroupProps } from './types';

export function AppRadioGroup({
  options,
  size = 'md',
  isInvalid = false,
  orientation = 'vertical',
  className,
  itemClassName,
  radioClassName,
  labelClassName,
  descriptionClassName,
  disabled = false,
  ...props
}: AppRadioGroupProps) {
  const idPrefix = useId();

  return (
    <RadioGroup
      {...props}
      disabled={disabled}
      aria-invalid={isInvalid || undefined}
      data-invalid={isInvalid ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      className={cn(APP_RADIO_GROUP_ORIENTATION_CLASSES[orientation], disabled && 'opacity-50', className)}
    >
      {options.map((option, index) => {
        const optionId = `${idPrefix}-${index}`;
        const descriptionId = option.description ? `${optionId}-description` : undefined;
        const optionDisabled = disabled || option.disabled;

        return (
          <div
            key={option.value}
            className={cn('group/field flex items-start', APP_RADIO_GROUP_ITEM_SIZE_CLASSES[size], optionDisabled && 'opacity-50', itemClassName)}
            data-disabled={optionDisabled ? 'true' : undefined}
            data-invalid={isInvalid ? 'true' : undefined}
          >
            <RadioGroupItem
              id={optionId}
              value={option.value}
              disabled={optionDisabled}
              aria-invalid={isInvalid || undefined}
              aria-describedby={descriptionId}
              className={cn(
                APP_RADIO_GROUP_CONTROL_SIZE_CLASSES[size],
                isInvalid && 'border-destructive aria-invalid:border-destructive aria-invalid:ring-0',
                radioClassName,
              )}
            />

            <div className='min-w-0 space-y-1'>
              <Label
                htmlFor={optionId}
                className={cn('leading-5', optionDisabled && 'cursor-not-allowed', APP_RADIO_GROUP_LABEL_SIZE_CLASSES[size], labelClassName)}
              >
                {option.label}
              </Label>

              {option.description ? (
                <p
                  id={descriptionId}
                  className={cn('text-muted-foreground leading-5', APP_RADIO_GROUP_DESCRIPTION_SIZE_CLASSES[size], descriptionClassName)}
                >
                  {option.description}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </RadioGroup>
  );
}
