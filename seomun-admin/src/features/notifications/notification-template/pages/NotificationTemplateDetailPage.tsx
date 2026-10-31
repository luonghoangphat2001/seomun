import { getRouteApi, Link } from '@tanstack/react-router';
import { AlertCircle, ArrowLeft, Loader2, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { NotificationType } from '../../enums';
import { useNotificationTemplateDetailQuery } from '../api';
import type { NotificationTemplateChannelConfigsRESP } from '../api';
import { getNotificationTemplateChannelLabel, getNotificationTemplateUsageStatusLabel, sortNotificationChannelTypes } from '../constants';

const routeApi = getRouteApi('/notifications/templates/$templateId');

export function NotificationTemplateDetailPage() {
  const { t } = useTranslation('page');
  const { templateId } = routeApi.useParams();
  const resolvedTemplateId = Number(templateId);

  const {
    data: response,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useNotificationTemplateDetailQuery(resolvedTemplateId, {
    enabled: Number.isFinite(resolvedTemplateId),
  });
  const template = response?.data.template;

  if (isLoading) {
    return (
      <PageContainer>
        <div className='flex items-center justify-center py-20'>
          <Loader2 className='text-primary size-8 animate-spin' />
        </div>
      </PageContainer>
    );
  }

  if (isError || !template) {
    return (
      <PageContainer>
        <div className='bg-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border px-6 py-10 text-center shadow-sm'>
          <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
            <AlertCircle className='size-6' />
          </div>

          <div className='space-y-1'>
            <h2 className='text-lg font-semibold'>{t('notifications.templates.detail.not_found')}</h2>
          </div>

          <Button type='button' variant='outline' onClick={() => void refetch()} disabled={isFetching} className='gap-2'>
            {isFetching ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
            {t('notifications.templates.retry')}
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' asChild className='-ml-2'>
            <Link to='/notifications/templates'>
              <ArrowLeft className='size-5' />
              <span className='sr-only'>{t('notifications.templates.detail.back')}</span>
            </Link>
          </Button>
          <div>
            <h1 className='text-xl font-semibold'>{t('notifications.templates.detail.title')}</h1>
            {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('notifications.templates.detail.description')}</p> */}
          </div>
        </div>

        <Button variant='outline' asChild className='gap-2'>
          <Link to='/notifications/templates/$templateId/edit' params={{ templateId }}>
            <Pencil className='size-4' />
            {t('notifications.templates.columns.edit')}
          </Link>
        </Button>
      </div>

      <Separator />

      <div className='space-y-6'>
        <div className='grid gap-3 sm:grid-cols-2'>
          <SummaryCard label={t('notifications.templates.detail.template_name')} value={template.name} />
          <SummaryCard label={t('notifications.templates.detail.template_number')} value={template.template_number} />
          <SummaryCard label={t('notifications.templates.detail.trigger_event')} value={template.trigger_event_label ?? '-'} />
          <SummaryCard
            label={t('notifications.templates.detail.usage_status')}
            value={getNotificationTemplateUsageStatusLabel(t, template.usage_status.value)}
          />
          <SummaryCard label={t('notifications.templates.detail.registrant')} value={template.registrant.name} />
          <SummaryCard label={t('notifications.templates.detail.created_at')} value={template.created_at} />
          <SummaryCard label={t('notifications.templates.detail.updated_at')} value={template.updated_at} />
        </div>

        <div className='bg-card space-y-3 rounded-xl border p-6 shadow-sm'>
          <h2 className='text-sm font-semibold'>{t('notifications.templates.detail.channels')}</h2>

          <div className='flex flex-wrap gap-1.5'>
            {sortNotificationChannelTypes(template.channel_types).map((channel) => (
              <Badge key={channel} variant='secondary' className='rounded-md px-2 py-0.5 text-xs'>
                {getNotificationTemplateChannelLabel(t, channel)}
              </Badge>
            ))}
          </div>

          <div className='space-y-3'>
            {sortNotificationChannelTypes(template.channel_types).map((channel) => (
              <ChannelConfigCard key={channel} channel={channel} configs={template.channel_configs} />
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function ChannelConfigCard({ channel, configs }: { channel: NotificationType; configs: NotificationTemplateChannelConfigsRESP }) {
  const { t } = useTranslation('page');

  if (channel === NotificationType.EMAIL) {
    const config = configs.email;
    if (!config) return null;

    return (
      <div className='rounded-xl border p-4 shadow-sm'>
        <span className='text-sm font-medium'>{getNotificationTemplateChannelLabel(t, channel)}</span>
        <div className='mt-2 grid gap-3 text-sm sm:grid-cols-2'>
          <DetailField label={t('notifications.templates.form.email.title_label')} value={config.title} />
          <DetailField label={t('notifications.templates.form.email.sender_email_label')} value={config.sender_email_address} />
        </div>
        <p className='text-muted-foreground mt-2 max-h-64 overflow-y-auto rounded-md bg-gray-50 p-2 text-xs whitespace-pre-wrap'>{config.body}</p>
        {config.variables && config.variables.length > 0 ? (
          <DetailField className='mt-2' label={t('notifications.templates.form.email.variables_label')} value={config.variables.join(', ')} />
        ) : null}
      </div>
    );
  }

  const config = channel === NotificationType.SMS ? configs.sms : configs.notification_talk;
  if (!config) return null;

  return (
    <div className='rounded-xl border p-4 shadow-sm'>
      <span className='text-sm font-medium'>{getNotificationTemplateChannelLabel(t, channel)}</span>
      <DetailField className='mt-2' label={t('notifications.templates.form.sms.sender_number_label')} value={config.sender_number} />
      <p className='text-muted-foreground mt-2 max-h-64 overflow-y-auto rounded-md bg-gray-50 p-2 text-xs whitespace-pre-wrap'>{config.content}</p>
      {config.variables && config.variables.length > 0 ? (
        <DetailField className='mt-2' label={t('notifications.templates.form.sms.variables_label')} value={config.variables.join(', ')} />
      ) : null}
    </div>
  );
}

function DetailField({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>{label}</p>
      <p className='mt-1 text-sm'>{value}</p>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className='bg-muted/30 min-w-0 rounded-xl border p-4'>
      <p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>{label}</p>
      <p className='mt-1 text-sm font-medium wrap-break-word'>{value}</p>
    </div>
  );
}
