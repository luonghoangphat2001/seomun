import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppInputFormField } from '@/components/shared/form-fields';
import { getApiErrorMessage } from '@/utils/api-error';

import { useCustomerChangePasswordMutation } from '../../api/customer-list.query';
import { createCustomerChangePasswordFormSchema, type CustomerChangePasswordFormValues } from '../../schemas';

type CustomerChangePasswordFormProps = {
  memberId: number;
  onSuccess?: () => void;
};

function PasswordVisibilityToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button type='button' tabIndex={-1} onClick={onToggle} className='text-muted-foreground hover:text-foreground'>
      {visible ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
    </button>
  );
}

export function CustomerChangePasswordForm({ memberId, onSuccess }: CustomerChangePasswordFormProps) {
  const { t } = useTranslation();
  const { t: tValidation } = useTranslation('validation');
  const changePasswordMutation = useCustomerChangePasswordMutation(memberId);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { control, handleSubmit, reset } = useForm<CustomerChangePasswordFormValues>({
    resolver: zodResolver(createCustomerChangePasswordFormSchema(t, tValidation)),
    defaultValues: { new_password: '', new_password_confirmation: '' },
  });

  const onSubmit = (values: CustomerChangePasswordFormValues) => {
    changePasswordMutation.mutate(values, {
      onSuccess: () => {
        toast.success(t('message.customers.detail.change_password.success'));
        reset();
        onSuccess?.();
      },
      onError: (error) => toast.error(getApiErrorMessage(error, t('message.customers.detail.change_password.error'))),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4' noValidate>
      <p className='text-muted-foreground text-xs'>{t('form.customers.detail.change_password.hint')}</p>

      <div className='grid gap-4 md:grid-cols-2'>
        <AppInputFormField
          name='new_password'
          control={control}
          type={showNewPassword ? 'text' : 'password'}
          label={t('form.customers.detail.change_password.fields.new_password.label')}
          disabled={changePasswordMutation.isPending}
          suffix={<PasswordVisibilityToggle visible={showNewPassword} onToggle={() => setShowNewPassword((prev) => !prev)} />}
          required
        />
        <AppInputFormField
          name='new_password_confirmation'
          control={control}
          type={showConfirmPassword ? 'text' : 'password'}
          label={t('form.customers.detail.change_password.fields.new_password_confirmation.label')}
          disabled={changePasswordMutation.isPending}
          suffix={<PasswordVisibilityToggle visible={showConfirmPassword} onToggle={() => setShowConfirmPassword((prev) => !prev)} />}
          required
        />
      </div>

      <div className='flex justify-end'>
        <AppButton type='submit' isLoading={changePasswordMutation.isPending}>
          {t('page.customers.detail.actions.change_password')}
        </AppButton>
      </div>
    </form>
  );
}
