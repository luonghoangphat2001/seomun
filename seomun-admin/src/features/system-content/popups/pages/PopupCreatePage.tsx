import { getRouteApi } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';
import { FormMode } from '@/enums/form.enum';

import { useCreatePopupMutation } from '../api/popup.query';
import { toPopupPayload } from '../api/popup.service';
import { PopupForm } from '../components/PopupForm';
import type { PopupFormValues } from '../schemas';

const routeApi = getRouteApi('/system-content/popups/create');

export function PopupCreatePage() {
  const { t } = useTranslation('page');
  const { t: tMessage } = useTranslation('message');

  const navigate = routeApi.useNavigate();
  const createMutation = useCreatePopupMutation();

  const handleCancel = () => {
    void navigate({ to: '/system-content/popups' });
  };

  const handleSubmit = (values: PopupFormValues) => {
    createMutation.mutate(toPopupPayload(values), {
      onSuccess: () => {
        toast.success(tMessage('popups.create.success'));
        void navigate({ to: '/system-content/popups' });
      },
      onError: () => toast.error(tMessage('popups.create.error')),
    });
  };

  return (
    <PageContainer>
      <div>
        <h1 className='text-xl font-semibold'>{t('popups.create.title')}</h1>
        {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('popups.create.description')}</p> */}
      </div>

      <Separator />

      <PopupForm mode={FormMode.CREATE} isPending={createMutation.isPending} onCancel={handleCancel} onSubmit={handleSubmit} />
    </PageContainer>
  );
}
