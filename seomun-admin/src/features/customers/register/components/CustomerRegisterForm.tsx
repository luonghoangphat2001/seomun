import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppInputFormField, AppSelectFormField, AppTextareaFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { FileType } from '@/enums';
import { useUploadFileMutation } from '@/features/system-content/images';
import { cn } from '@/utils/cn';
import { blockNonDigitKey } from '@/utils/format-phone';

import { BusinessRegistrationFileField } from '../../components/BusinessRegistrationFileField';
import {
  createCustomerRegisterFormSchema,
  customerRegisterFormDefaultValues,
  type CustomerRegisterFormValues,
  type CustomerRegisterSubmitValues,
} from '../schemas';

type CustomerRegisterFormProps = {
  isPending?: boolean;
  onCancel: () => void;
  onSubmit: (values: CustomerRegisterSubmitValues) => void;
};

export function CustomerRegisterForm({ isPending: isSubmitting, onCancel, onSubmit }: CustomerRegisterFormProps) {
  const { t } = useTranslation();
  const { t: tValidation } = useTranslation('validation');

  const { control, handleSubmit } = useForm<CustomerRegisterFormValues>({
    resolver: zodResolver(createCustomerRegisterFormSchema(t, tValidation)),
    defaultValues: customerRegisterFormDefaultValues,
  });

  const uploadMutation = useUploadFileMutation(FileType.CUSTOMER_BUSINESS_REGISTRATION);
  const isPending = isSubmitting || uploadMutation.isPending;

  const memberType = useWatch({ control, name: 'member_type' });
  const isBusiness = memberType === 'business';

  const handleFormSubmit = async (values: CustomerRegisterFormValues) => {
    let fileUrl: string | null;

    if (values.business_registration_file instanceof File) {
      try {
        const uploaded = await uploadMutation.mutateAsync(values.business_registration_file);
        fileUrl = uploaded.url;
      } catch {
        toast.error(t('common.upload_failed', 'Upload failed.'));
        return;
      }
    } else {
      fileUrl = values.business_registration_file;
    }

    onSubmit({ ...values, business_registration_file: fileUrl });
  };

  return (
    <form noValidate onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
      <section className='rounded-xl border'>
        <div className='border-b px-5 py-4'>
          <h2 className='text-sm font-semibold'>{t('form.customers.register.sections.basic_info', { defaultValue: 'Basic Information' })}</h2>
        </div>
        <div className='grid gap-4 p-5 md:grid-cols-2'>
          <AppSelectFormField
            name='member_type'
            control={control}
            label={t('form.customers.register.fields.member_type.label', { defaultValue: 'Member Type' })}
            options={[
              { value: 'business', label: t('form.customers.register.fields.member_type.options.business', { defaultValue: 'Business' }) },
              { value: 'individual', label: t('form.customers.register.fields.member_type.options.individual', { defaultValue: 'Individual' }) },
            ]}
            disabled={isPending}
            fieldClassName='md:col-span-2'
            required
          />
          <AppInputFormField name='name' control={control} label={t('form.customers.register.fields.name.label')} disabled={isPending} required />
          <AppInputFormField
            name='username'
            control={control}
            label={t('form.customers.register.fields.username.label')}
            disabled={isPending}
            required
          />
          <AppInputFormField
            name='password'
            control={control}
            type='password'
            label={t('form.customers.register.fields.password.label')}
            disabled={isPending}
            required
          />
          <AppInputFormField
            name='password_confirmation'
            control={control}
            type='password'
            label={t('form.customers.register.fields.password_confirmation.label')}
            disabled={isPending}
            required
          />
          <AppInputFormField
            name='mobile'
            control={control}
            label={t('form.customers.register.fields.mobile.label')}
            disabled={isPending}
            onKeyDown={blockNonDigitKey}
            required
          />
          <AppInputFormField
            name='email'
            control={control}
            type='email'
            label={t('form.customers.register.fields.email.label')}
            disabled={isPending}
            required
          />
          <AppInputFormField
            name='postcode'
            control={control}
            label={t('form.customers.register.fields.postcode.label')}
            disabled={isPending}
            required
          />
          <AppInputFormField
            name='address'
            control={control}
            label={t('form.customers.register.fields.address.label')}
            disabled={isPending}
            required
          />
          <AppInputFormField
            name='detail_address'
            control={control}
            label={t('form.customers.register.fields.detail_address.label')}
            disabled={isPending}
            fieldClassName='md:col-span-2'
          />
          <AppTextareaFormField
            name='note'
            control={control}
            label={t('form.customers.register.fields.note.label')}
            disabled={isPending}
            fieldClassName='md:col-span-2'
          />
        </div>
      </section>

      {/* grid-rows 0fr↔1fr animates height:auto smoothly without measuring; content stays mounted so RHF keeps its values */}
      <div
        aria-hidden={!isBusiness}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-in-out',
          isBusiness ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <section className='overflow-hidden rounded-xl border'>
          <div className='border-b px-5 py-4'>
            <h2 className='text-sm font-semibold'>{t('form.customers.register.sections.business_info', { defaultValue: 'Business Information' })}</h2>
          </div>
          <fieldset disabled={!isBusiness || isPending} className='m-0 grid gap-4 border-0 p-5 md:grid-cols-2'>
            <AppInputFormField
              name='company_name'
              control={control}
              label={t('form.customers.register.fields.company_name.label')}
              disabled={isPending}
              required
            />
            <AppInputFormField
              name='business_registration_number'
              control={control}
              label={t('form.customers.register.fields.business_registration_number.label')}
              disabled={isPending}
              required
            />
            <AppInputFormField
              name='representative_name'
              control={control}
              label={t('form.customers.register.fields.representative_name.label')}
              disabled={isPending}
              required
            />
            <AppInputFormField
              name='industry_type'
              control={control}
              label={t('form.customers.register.fields.industry_type.label')}
              disabled={isPending}
              required
            />
            <AppInputFormField
              name='business_type'
              control={control}
              label={t('form.customers.register.fields.business_type.label')}
              disabled={isPending}
              required
            />
            <AppInputFormField
              name='tax_invoice_email'
              control={control}
              type='email'
              label={t('form.customers.register.fields.tax_invoice_email.label')}
              disabled={isPending}
            />
            <AppInputFormField
              name='business_postcode'
              control={control}
              label={t('form.customers.register.fields.business_postcode.label')}
              disabled={isPending}
              required
            />
            <AppInputFormField
              name='business_address'
              control={control}
              label={t('form.customers.register.fields.business_address.label')}
              disabled={isPending}
              required
              fieldClassName='md:col-span-2'
            />
            <BusinessRegistrationFileField
              control={control}
              disabled={isPending}
              label={t('form.customers.register.fields.business_registration_file.label')}
              description={t('form.customers.register.fields.business_registration_file.description', {
                defaultValue: 'PDF, JPG, JPEG, or PNG. Max 10MB.',
              })}
              required
              className='md:col-span-2'
            />
          </fieldset>
        </section>
      </div>

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel} disabled={isPending}>
          {t('common.action.cancel')}
        </Button>
        <AppButton type='submit' isLoading={isPending}>
          {t('page.customers.register.actions.submit')}
        </AppButton>
      </div>
    </form>
  );
}
