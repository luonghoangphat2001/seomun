import { Input } from '@/components/common';
import { FormInput } from '@/components/form';
import { Careright, XIcon } from '@/icons';
import { cn } from '@/lib/utils';
import { ProductOrderConfig } from '@/types';
import { useTranslations } from 'next-intl';
import { Control, FieldValues, Path } from 'react-hook-form';

export interface SizeInputGroupProps<T extends FieldValues> {
  label: string;
  // width: string;
  // height: string;
  editable?: boolean;
  control: Control<T>;
  nameWidth: Path<T>;
  nameHeight: Path<T>;
}

export const SizeInputGroup = <T extends FieldValues>({
  label,
  // width,
  // height,
  editable = false,
  control,
  nameWidth,
  nameHeight,
}: SizeInputGroupProps<T>) => {
  const t = useTranslations('product');

  return (
    <div className='flex flex-col gap-1 xl:flex-row xl:items-center xl:gap-6'>
      <div className='flex min-w-[100px] items-center gap-2'>
        <Careright className='size-4' />
        <span className='caption-12 md:input-15'>{label}</span>
      </div>
      <div className='flex w-full items-center gap-3'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <span className='caption-12 whitespace-nowrap'>{t('width')}</span>
            <FormInput
              control={control}
              name={nameWidth}
              readOnly={!editable}
              className={cn('!button-13 bg-fill-soft h-8 w-[62px] text-center', editable && 'bg-white')}
              showClear={false}
              numericOnly
              numericAsNumber
            />
          </div>
          {/* <XIcon className='text-text-third size-5' /> */}
          <div className='flex items-center gap-2'>
            <span className='caption-12 whitespace-nowrap'>{t('length')}</span>
            <FormInput
              control={control}
              name={nameHeight}
              readOnly={!editable}
              className={cn('!button-13 bg-fill-soft h-8 w-[62px] text-center', editable && 'bg-white')}
              showClear={false}
              numericOnly
              numericAsNumber
            />
          </div>
        </div>
        <span className='caption-12 -ml-2'>mm</span>
      </div>
    </div>
  );
};
