import { FormInput } from '@/components/form';
import { useMediaQuery } from '@/hooks';
import { useTranslations } from 'next-intl';
import { Control } from 'react-hook-form';
import { ChangePasswordFormValues } from './schema';

interface ChangePasswordStepProps {
  control: Control<ChangePasswordFormValues>;
}

export const ChangePasswordStep = ({ control }: ChangePasswordStepProps) => {
  const tAuth = useTranslations('auth');

  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <div className='border-border-soft flex flex-col gap-4 border-t border-b px-4 py-6 max-md:border-none md:gap-8 md:px-10 md:py-8'>
      <div className='space-y-4'>
        <FormInput
          control={control}
          name='password'
          type='password'
          label={tAuth('password')}
          placeholder={tAuth('password')}
          labelPlacement={isDesktop ? 'left' : 'top'}
          inputClassName='w-full md:w-[358px]'
          containerClassName='justify-start md:gap-8'
          labelClassName='w-[94px]'
          helperText={tAuth('password_rule_message')}
        />
        <FormInput
          control={control}
          name='confirmPassword'
          type='password'
          label={tAuth('verify_password')}
          placeholder={tAuth('verify_password')}
          labelPlacement={isDesktop ? 'left' : 'top'}
          inputClassName='w-full md:w-[358px]'
          containerClassName='justify-start md:gap-8'
          labelClassName='w-[94px]'
        />
      </div>
    </div>
  );
};
