import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useForm, type FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { AppInputFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';

import {
  createAdministratorUpdatePasswordFormSchema,
  EMPTY_ADMINISTRATOR_UPDATE_PASSWORD_FORM_VALUES,
  type AdministratorUpdatePasswordFormValues,
} from '../schemas';
import { getFirstFormError } from '../utils/administrator-form';

type AdministratorUpdatePasswordDialogProps = {
  open: boolean;
  isPending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AdministratorUpdatePasswordFormValues) => void;
};

export function AdministratorUpdatePasswordDialog({ open, isPending = false, onOpenChange, onSubmit }: AdministratorUpdatePasswordDialogProps) {
  const { t: tCommon } = useTranslation('common');
  const { t: tForm } = useTranslation('form');
  const { t: tPage } = useTranslation('page');
  const { t: tValidation } = useTranslation('validation');
  const schema = useMemo(() => createAdministratorUpdatePasswordFormSchema(tValidation, tForm), [tValidation, tForm]);
  const form = useForm<AdministratorUpdatePasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_ADMINISTRATOR_UPDATE_PASSWORD_FORM_VALUES,
    mode: 'all',
  });

  useEffect(() => {
    if (open) {
      form.reset(EMPTY_ADMINISTRATOR_UPDATE_PASSWORD_FORM_VALUES);
    }
  }, [form, open]);

  const handleInvalidSubmit = (errors: FieldErrors<AdministratorUpdatePasswordFormValues>) => {
    const message = getFirstFormError(errors);

    if (message) {
      toast.error(message);
    }
  };
  const handleSubmit = form.handleSubmit(onSubmit, handleInvalidSubmit);

  return (
    <AppDialogModal
      isOpen={open}
      setIsOpen={(nextOpen) => {
        if (!isPending) {
          onOpenChange(nextOpen);
        }
      }}
      title={tPage('administrators.edit.password_dialog.title')}
      footer={
        <>
          <Button type='button' variant='outline' className='h-10' onClick={() => onOpenChange(false)} disabled={isPending}>
            {tCommon('action.cancel')}
          </Button>
          <AppButton type='button' className='h-10' onClick={handleSubmit} isLoading={isPending}>
            {tCommon('action.save')}
          </AppButton>
        </>
      }
      width={520}
    >
      <form className='space-y-4 py-2' onSubmit={handleSubmit}>
        <AppInputFormField
          name='password'
          control={form.control}
          type='password'
          label={tForm('administrators.fields.password.label')}
          placeholder={tForm('administrators.fields.password.placeholder')}
          disabled={isPending}
          required
        />
        <AppInputFormField
          name='password_confirmation'
          control={form.control}
          type='password'
          label={tForm('administrators.fields.password_confirmation.label')}
          placeholder={tForm('administrators.fields.password_confirmation.placeholder')}
          disabled={isPending}
          required
        />
      </form>
    </AppDialogModal>
  );
}
