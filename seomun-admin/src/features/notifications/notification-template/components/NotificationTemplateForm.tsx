import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppInputFormField, AppSelectFormField, AppTextareaFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { FormMode } from '@/enums/form.enum';

import type { NotificationTemplateRESP } from '../api';
import { NotificationType } from '../../enums';
import {
  getNotificationTemplateChannelLabel,
  getNotificationTemplateChannelOptions,
  getNotificationTemplateTriggerTypeOptions,
  getNotificationTemplateUsageStatusOptions,
} from '../constants';
import {
  createNotificationTemplateDefaultValues,
  mapNotificationTemplateToFormValues,
  notificationTemplateFormSchema,
  type NotificationTemplateFormValues,
} from '../schemas';

type NotificationTemplateFormProps = {
  mode: FormMode;
  template?: NotificationTemplateRESP;
  isPending?: boolean;
  onCancel: () => void;
  onSubmit: (values: NotificationTemplateFormValues) => void;
};

export function NotificationTemplateForm({ mode, template, isPending, onCancel, onSubmit }: NotificationTemplateFormProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const isEditMode = mode === FormMode.EDIT;
  const defaultValues = useMemo(
    () => (template ? mapNotificationTemplateToFormValues(template) : createNotificationTemplateDefaultValues()),
    [template],
  );

  const { control, handleSubmit, reset, watch } = useForm<NotificationTemplateFormValues>({
    resolver: zodResolver(notificationTemplateFormSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const selectedChannels = watch('channel_types');
  const showEmail = selectedChannels.includes(NotificationType.EMAIL);
  const showSms = selectedChannels.includes(NotificationType.SMS);
  const showNotificationTalk = selectedChannels.includes(NotificationType.NOTIFICATION_TALK);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-2'>
        <AppInputFormField
          name='name'
          control={control}
          label={t('notifications.templates.form.fields.name.label')}
          placeholder={t('notifications.templates.form.fields.name.placeholder')}
          required
        />
        <AppInputFormField
          name='template_number'
          control={control}
          label={t('notifications.templates.form.fields.template_number.label')}
          placeholder={t('notifications.templates.form.fields.template_number.placeholder')}
          required
        />
        <AppSelectFormField
          name='trigger_type'
          control={control}
          label={t('notifications.templates.form.fields.trigger_type.label')}
          placeholder={t('notifications.templates.form.fields.trigger_type.placeholder')}
          options={getNotificationTemplateTriggerTypeOptions(t)}
          clearable={false}
          required
        />
        <AppSelectFormField
          name='usage_status'
          control={control}
          label={t('notifications.templates.form.fields.usage_status.label')}
          placeholder={t('notifications.templates.form.fields.usage_status.placeholder')}
          options={getNotificationTemplateUsageStatusOptions(t)}
          clearable={false}
          required
        />
      </div>

      <AppSelectFormField
        mode='multiple'
        name='channel_types'
        control={control}
        label={t('notifications.templates.form.fields.channel_types.label')}
        placeholder={t('notifications.templates.form.fields.channel_types.placeholder')}
        options={getNotificationTemplateChannelOptions(t)}
        required
      />

      <div className='space-y-4'>
        {showEmail ? (
          <ChannelConfigSection
            title={getNotificationTemplateChannelLabel(t, NotificationType.EMAIL)}
            description={t('notifications.templates.form.email.description')}
          >
            <div className='grid gap-4 md:grid-cols-2'>
              <AppInputFormField
                name='channel_configs.email.title'
                control={control}
                label={t('notifications.templates.form.email.title_label')}
                placeholder={t('notifications.templates.form.email.title_placeholder')}
                required
              />
              <AppInputFormField
                name='channel_configs.email.sender_email_address'
                control={control}
                type='email'
                label={t('notifications.templates.form.email.sender_email_label')}
                placeholder={t('notifications.templates.form.email.sender_email_placeholder')}
                required
              />
            </div>
            <AppTextareaFormField
              name='channel_configs.email.body'
              control={control}
              label={t('notifications.templates.form.email.body_label')}
              placeholder={t('notifications.templates.form.email.body_placeholder')}
              rows={6}
              required
            />
            <AppInputFormField
              name='channel_configs.email.variables_input'
              control={control}
              label={t('notifications.templates.form.email.variables_label')}
              placeholder={t('notifications.templates.form.email.variables_placeholder')}
              description={t('notifications.templates.form.email.variables_description')}
            />
          </ChannelConfigSection>
        ) : null}

        {showSms ? (
          <ChannelConfigSection
            title={getNotificationTemplateChannelLabel(t, NotificationType.SMS)}
            description={t('notifications.templates.form.sms.description')}
          >
            <div className='grid gap-4 md:grid-cols-2'>
              <AppInputFormField
                name='channel_configs.sms.sender_number'
                control={control}
                label={t('notifications.templates.form.sms.sender_number_label')}
                placeholder={t('notifications.templates.form.sms.sender_number_placeholder')}
                required
              />
              <AppInputFormField
                name='channel_configs.sms.variables_input'
                control={control}
                label={t('notifications.templates.form.sms.variables_label')}
                placeholder={t('notifications.templates.form.sms.variables_placeholder')}
                description={t('notifications.templates.form.sms.variables_description')}
              />
            </div>
            <AppTextareaFormField
              name='channel_configs.sms.content'
              control={control}
              label={t('notifications.templates.form.sms.content_label')}
              placeholder={t('notifications.templates.form.sms.content_placeholder')}
              rows={5}
              required
            />
          </ChannelConfigSection>
        ) : null}

        {showNotificationTalk ? (
          <ChannelConfigSection
            title={getNotificationTemplateChannelLabel(t, NotificationType.NOTIFICATION_TALK)}
            description={t('notifications.templates.form.notification_talk.description')}
          >
            <div className='grid gap-4 md:grid-cols-2'>
              <AppInputFormField
                name='channel_configs.notification_talk.sender_number'
                control={control}
                label={t('notifications.templates.form.notification_talk.sender_number_label')}
                placeholder={t('notifications.templates.form.notification_talk.sender_number_placeholder')}
                required
              />
              <AppInputFormField
                name='channel_configs.notification_talk.variables_input'
                control={control}
                label={t('notifications.templates.form.notification_talk.variables_label')}
                placeholder={t('notifications.templates.form.notification_talk.variables_placeholder')}
                description={t('notifications.templates.form.notification_talk.variables_description')}
              />
            </div>
            <AppTextareaFormField
              name='channel_configs.notification_talk.content'
              control={control}
              label={t('notifications.templates.form.notification_talk.content_label')}
              placeholder={t('notifications.templates.form.notification_talk.content_placeholder')}
              rows={5}
              required
            />
          </ChannelConfigSection>
        ) : null}
      </div>

      <div className='flex items-center justify-end gap-2'>
        <Button type='button' variant='outline' onClick={onCancel} disabled={isPending}>
          {tCommon('action.cancel')}
        </Button>
        <AppButton type='submit' isLoading={isPending}>
          {isEditMode ? t('notifications.templates.form.save_changes') : t('notifications.templates.form.create')}
        </AppButton>
      </div>
    </form>
  );
}

type ChannelConfigSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

function ChannelConfigSection({ title, description, children }: ChannelConfigSectionProps) {
  return (
    <section className='rounded-2xl border p-5 shadow-sm'>
      <div className='space-y-1'>
        <h2 className='text-base font-semibold'>{title}</h2>
        <p className='text-muted-foreground text-sm'>{description}</p>
      </div>

      <div className='mt-4 space-y-4'>{children}</div>
    </section>
  );
}
