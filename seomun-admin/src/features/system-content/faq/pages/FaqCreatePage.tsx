import { getRouteApi } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';

import { FormMode } from '@/enums/form.enum';
import { useCreateFaqMutation } from '../api/faq.query';
import { FaqForm } from '../components/FaqForm';
import type { FaqFormValues } from '../schemas';

const routeApi = getRouteApi('/system-content/faqs/create');

export function FaqCreatePage() {
  const { t } = useTranslation('page');
  const { t: tMessage } = useTranslation('message');

  const navigate = routeApi.useNavigate();

  const createMutation = useCreateFaqMutation();

  const handleCancel = () => {
    void navigate({ to: '/system-content/faqs' });
  };

  const handleSubmit = (values: FaqFormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success(tMessage('faqs.create.success'));
        void navigate({ to: '/system-content/faqs' });
      },
      onError: () => {
        toast.error(tMessage('faqs.create.error'));
      },
    });
  };

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('faqs.create.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('faqs.create.description')}</p> */}
        </div>
      </div>

      <Separator />

      <FaqForm mode={FormMode.CREATE} isPending={createMutation.isPending} onCancel={handleCancel} onSubmit={handleSubmit} />
    </PageContainer>
  );
}
