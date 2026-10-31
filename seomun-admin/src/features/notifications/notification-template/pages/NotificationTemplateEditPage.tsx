import { getRouteApi } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { FormMode } from '@/enums/form.enum';
import { getApiErrorMessage } from '@/utils/api-error';

import { useNotificationTemplateDetailQuery, useUpdateNotificationTemplateMutation } from '../api';
import { NotificationTemplateForm } from '../components/NotificationTemplateForm';
import type { NotificationTemplateFormValues } from '../schemas';
import { buildNotificationTemplateUpdatePayload } from '../utils/notification-template-list-params';

const routeApi = getRouteApi('/notifications/templates/$templateId_/edit');

export function NotificationTemplateEditPage() {
  const { t } = useTranslation('page');
  const { templateId } = routeApi.useParams();
  const navigate = routeApi.useNavigate();
  const resolvedTemplateId = Number(templateId);

  const { data: response, isLoading } = useNotificationTemplateDetailQuery(resolvedTemplateId, {
    enabled: Number.isFinite(resolvedTemplateId),
  });
  const updateMutation = useUpdateNotificationTemplateMutation(resolvedTemplateId);

  const handleCancel = () => {
    void navigate({ to: '/notifications/templates/$templateId', params: { templateId } });
  };

  const handleSubmit = (values: NotificationTemplateFormValues) => {
    updateMutation.mutate(buildNotificationTemplateUpdatePayload(values), {
      onSuccess: () => {
        toast.success(t('notifications.templates.edit.success'));
        void navigate({ to: '/notifications/templates/$templateId', params: { templateId } });
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, t('notifications.templates.edit.error')));
      },
    });
  };

  return (
    <PageContainer>
      <div className='space-y-6'>
        <div>
          <h1 className='text-xl font-semibold'>{t('notifications.templates.edit.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('notifications.templates.edit.description')}</p> */}
        </div>

        <Separator />

        <div className='rounded-2xl border p-6 shadow-sm'>
          {isLoading ? (
            <div className='space-y-6'>
              <div className='grid gap-4 md:grid-cols-2'>
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className='space-y-2'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-10 w-full' />
                  </div>
                ))}
              </div>
              <div className='grid gap-4 xl:grid-cols-3'>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className='space-y-3 rounded-2xl border p-4'>
                    <Skeleton className='h-5 w-32' />
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-10 w-full' />
                    <Skeleton className='h-28 w-full' />
                  </div>
                ))}
              </div>
            </div>
          ) : !response?.data.template ? (
            <div className='text-muted-foreground py-8 text-center'>{t('notifications.templates.detail.not_found')}</div>
          ) : (
            <NotificationTemplateForm
              mode={FormMode.EDIT}
              template={response.data.template}
              isPending={updateMutation.isPending}
              onCancel={handleCancel}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
