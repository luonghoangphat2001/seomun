import { zodResolver } from '@hookform/resolvers/zod';
import type { TFunction } from 'i18next';
import { KeyRound } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppFormField, AppInputFormField, AppSelectFormField, AppTextareaFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { blockNonDigitKey } from '@/utils/format-phone';

import type { MemberDetail, MemberPermissionInfo } from '../../../types/customer.type';
import { getCustomerStatusLabel, getMemberTypeLabel } from '../../../utils/i18n';
import { CustomerListWireStatus } from '../../api/customer-list.request';
import { mapMemberDetailToBasicInfoFormValues } from '../../api/customer-list.service';
import { createCustomerBasicInfoFormSchema, type CustomerBasicInfoFormValues } from '../../schemas';

type CustomerBasicInfoFormProps = {
  member?: MemberDetail;
  permission?: MemberPermissionInfo;
  isPending?: boolean;
  onChangePassword: () => void;
  onSubmit: (values: CustomerBasicInfoFormValues) => void;
};

export function CustomerBasicInfoForm({ member, permission, isPending, onChangePassword, onSubmit }: CustomerBasicInfoFormProps) {
  const { t } = useTranslation();
  const { t: tValidation } = useTranslation('validation');
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<CustomerBasicInfoFormValues>({
    resolver: zodResolver(createCustomerBasicInfoFormSchema(t, tValidation)),
    defaultValues: mapMemberDetailToBasicInfoFormValues(member),
  });

  useEffect(() => {
    reset(mapMemberDetailToBasicInfoFormValues(member));
  }, [member, reset]);

  const isEditable = (field: keyof CustomerBasicInfoFormValues) => member?.editableFields?.[field] ?? true;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='bg-muted/30 grid gap-4 rounded-lg p-4 sm:grid-cols-2 md:grid-cols-3'>
        <ReadOnlyValue label={fieldLabel(t, 'username', 'Username')} value={member?.username} />
        <ReadOnlyValue label={fieldLabel(t, 'member_type', 'Member Type')} value={getMemberTypeLabel(t, member?.member_type)} />
        <ReadOnlyValue label={fieldLabel(t, 'membership_level', 'Membership Level')} value={permission?.membershipLevel.label} />
        <ReadOnlyValue label={fieldLabel(t, 'availability', 'Availability')} value={permission?.availability.label} />
        <ReadOnlyValue label={fieldLabel(t, 'date_of_joining', 'Date of Joining')} value={member?.dateOfJoining} />
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <AppSelectFormField
          name='status'
          control={control}
          label={fieldLabel(t, 'status', 'Status')}
          options={[
            { value: CustomerListWireStatus.ACTIVE, label: getCustomerStatusLabel(t, CustomerListWireStatus.ACTIVE) },
            { value: CustomerListWireStatus.INACTIVE, label: getCustomerStatusLabel(t, CustomerListWireStatus.INACTIVE) },
            { value: CustomerListWireStatus.WITHDRAWN, label: getCustomerStatusLabel(t, CustomerListWireStatus.WITHDRAWN) },
          ]}
          disabled={!isEditable('status') || isPending}
          clearable={false}
          required
        />
        <AppInputFormField name='name' control={control} label={fieldLabel(t, 'name', 'Name')} disabled={!isEditable('name') || isPending} required />
        <AppInputFormField
          name='email'
          control={control}
          type='email'
          label={fieldLabel(t, 'email', 'Email')}
          disabled={!isEditable('email') || isPending}
        />
        <AppFormField label={fieldLabel(t, 'password', 'Password')}>
          {() => (
            <Button type='button' variant='outline' className='w-full gap-1.5' onClick={onChangePassword} disabled={isPending}>
              <KeyRound className='size-4' />
              {t('page.customers.detail.actions.change_password')}
            </Button>
          )}
        </AppFormField>
        <AppInputFormField
          name='phone'
          control={control}
          label={fieldLabel(t, 'phone', 'Phone')}
          disabled={!isEditable('phone') || isPending}
          onKeyDown={blockNonDigitKey}
        />
        <AppInputFormField
          name='mobile'
          control={control}
          label={fieldLabel(t, 'mobile', 'Mobile')}
          disabled={!isEditable('mobile') || isPending}
          onKeyDown={blockNonDigitKey}
        />
        <AppInputFormField
          name='postcode'
          control={control}
          label={fieldLabel(t, 'postcode', 'Postcode')}
          disabled={!isEditable('postcode') || isPending}
        />
        <AppInputFormField
          name='address'
          control={control}
          label={fieldLabel(t, 'address', 'Address')}
          disabled={!isEditable('address') || isPending}
        />
        <AppInputFormField
          name='detailed_address'
          control={control}
          label={fieldLabel(t, 'detailed_address', 'Detailed Address')}
          disabled={!isEditable('detailed_address') || isPending}
          fieldClassName='md:col-span-2'
        />
        <AppTextareaFormField
          name='note'
          control={control}
          label={fieldLabel(t, 'note', 'Note')}
          disabled={!isEditable('note') || isPending}
          fieldClassName='md:col-span-2'
        />
      </div>

      <div className='flex justify-end gap-2'>
        <Button type='button' variant='outline' onClick={() => reset(mapMemberDetailToBasicInfoFormValues(member))} disabled={!isDirty || isPending}>
          {t('common.action.reset')}
        </Button>
        <AppButton type='submit' isLoading={isPending}>
          {t('page.customers.detail.actions.save_basic_info')}
        </AppButton>
      </div>
    </form>
  );
}

function fieldLabel(t: TFunction, field: string, fallback: string) {
  return String(t(`form.customers.detail.basic_info.fields.${field}.label` as never, { defaultValue: fallback } as never));
}

function ReadOnlyValue({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className='text-muted-foreground text-xs'>{label}</p>
      <p className='font-medium'>{value || '-'}</p>
    </div>
  );
}
