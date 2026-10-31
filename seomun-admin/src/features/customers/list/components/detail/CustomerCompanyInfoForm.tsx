import { zodResolver } from '@hookform/resolvers/zod';
import type { TFunction } from 'i18next';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppInputFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { FileType } from '@/enums';
import { useUploadFileMutation } from '@/features/system-content/images';

import type { MemberCompanyInfo } from '../../../types/customer.type';
import { BusinessRegistrationFileField } from '../../../components/BusinessRegistrationFileField';
import { mapMemberCompanyInfoToFormValues } from '../../api/customer-list.service';
import { createCustomerCompanyInfoFormSchema, type CustomerCompanyInfoFormValues, type CustomerCompanyInfoSubmitValues } from '../../schemas';

type CustomerCompanyInfoFormProps = {
  company?: MemberCompanyInfo | null;
  isPending?: boolean;
  onSubmit: (values: CustomerCompanyInfoSubmitValues) => void;
};

export function CustomerCompanyInfoForm({ company, isPending: isSubmitting, onSubmit }: CustomerCompanyInfoFormProps) {
  const { t } = useTranslation();
  const { t: tValidation } = useTranslation('validation');
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<CustomerCompanyInfoFormValues>({
    resolver: zodResolver(createCustomerCompanyInfoFormSchema(tValidation)),
    defaultValues: mapMemberCompanyInfoToFormValues(company),
  });

  const uploadMutation = useUploadFileMutation(FileType.CUSTOMER_BUSINESS_REGISTRATION);
  const isPending = isSubmitting || uploadMutation.isPending;

  // The file lives in the form as a File until here, so a cancelled edit never uploads anything.
  const handleFormSubmit = async (values: CustomerCompanyInfoFormValues) => {
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

  useEffect(() => {
    reset(mapMemberCompanyInfoToFormValues(company));
  }, [company, reset]);

  if (!company) return <p className='text-muted-foreground py-6 text-center text-sm'>{t('page.customers.detail.messages.no_company_info')}</p>;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
      <div className='grid gap-4 md:grid-cols-2'>
        <AppInputFormField name='company_name' control={control} label={fieldLabel(t, 'company_name', 'Client Company Name')} disabled={isPending} />
        <AppInputFormField
          name='business_registration_number'
          control={control}
          label={fieldLabel(t, 'business_registration_number', 'Business Registration Number')}
          disabled={isPending}
        />
        <AppInputFormField
          name='representative_name'
          control={control}
          label={fieldLabel(t, 'representative_name', 'Representative Name')}
          disabled={isPending}
        />
        <AppInputFormField name='industry_type' control={control} label={fieldLabel(t, 'industry_type', 'Industry Type')} disabled={isPending} />
        <AppInputFormField name='business_type' control={control} label={fieldLabel(t, 'business_type', 'Business Type')} disabled={isPending} />
        <AppInputFormField
          name='tax_invoice_email'
          control={control}
          type='email'
          label={fieldLabel(t, 'tax_invoice_email', 'Tax Invoice Email')}
          disabled={isPending}
        />
        <AppInputFormField
          name='business_postcode'
          control={control}
          label={fieldLabel(t, 'business_postcode', 'Business Postcode')}
          disabled={isPending}
        />
        <AppInputFormField
          name='business_address'
          control={control}
          label={fieldLabel(t, 'business_address', 'Business Address')}
          disabled={isPending}
        />
        <AppInputFormField
          name='business_detailed_address'
          control={control}
          label={fieldLabel(t, 'business_detailed_address', 'Business Detailed Address')}
          disabled={isPending}
        />
        <BusinessRegistrationFileField
          control={control}
          disabled={isPending}
          label={fieldLabel(t, 'business_registration_file', 'Business Registration File')}
          description={t('form.customers.register.fields.business_registration_file.description', {
            defaultValue: 'PDF, JPG, JPEG, or PNG. Max 10MB.',
          })}
          className='md:col-span-2'
        />
      </div>

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={() => reset(mapMemberCompanyInfoToFormValues(company))} disabled={!isDirty || isPending}>
          {t('common.action.reset')}
        </Button>
        <AppButton type='submit' isLoading={isPending}>
          {t('page.customers.detail.actions.save_company_info')}
        </AppButton>
      </div>
    </form>
  );
}

function fieldLabel(t: TFunction, field: string, fallback: string) {
  return String(t(`form.customers.detail.basic_info.fields.${field}.label` as never, { defaultValue: fallback } as never));
}
