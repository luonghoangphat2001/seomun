import { getRouteApi } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';
import { FormMode } from '@/enums/form.enum';

import { useCreateNotificationTemplateMutation } from '../api';
import { NotificationTemplateForm } from '../components/NotificationTemplateForm';
import type { NotificationTemplateFormValues } from '../schemas';
import { buildNotificationTemplateCreatePayload } from '../utils/notification-template-list-params';

const routeApi = getRouteApi('/notifications/templates/create');

export function NotificationTemplateCreatePage() {
  const { t } = useTranslation('page');
  const navigate = routeApi.useNavigate();
  const createMutation = useCreateNotificationTemplateMutation();

  const handleCancel = () => {
    void navigate({ to: '/notifications/templates' });
  };

  const handleSubmit = (values: NotificationTemplateFormValues) => {
    createMutation.mutate(buildNotificationTemplateCreatePayload(values), {
      onSuccess: () => {
        toast.success(t('notifications.templates.create.success'));
        void navigate({ to: '/notifications/templates' });
      },
      onError: () => {
        toast.error(t('notifications.templates.create.error'));
      },
    });
  };

  return (
    <PageContainer>
      <div className='space-y-6'>
        <div>
          <h1 className='text-xl font-semibold'>{t('notifications.templates.create.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('notifications.templates.create.description')}</p> */}
        </div>

        <Separator />

        <div className='rounded-2xl border p-6 shadow-sm'>
          <NotificationTemplateForm mode={FormMode.CREATE} isPending={createMutation.isPending} onCancel={handleCancel} onSubmit={handleSubmit} />
        </div>
      </div>
    </PageContainer>
  );
}
