import { getRouteApi } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';

import { FormMode } from '@/enums/form.enum';
import { useCreateAdministratorMutation } from '../api/administrator.query';
import { AdministratorForm } from '../components/AdministratorForm';
import type { AdministratorFormValues } from '../schemas';
import { getAdministratorAPIErrorMessage } from '../utils/administrator-error';

const routeApi = getRouteApi('/administrators/create');

export function AdministratorCreatePage() {
  const { t } = useTranslation('page');
  const { t: tMessage } = useTranslation('message');
  const navigate = routeApi.useNavigate();
  const createMutation = useCreateAdministratorMutation();

  const handleCancel = () => {
    navigate({ to: '/administrators' });
  };

  const handleSubmit = (values: AdministratorFormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success(tMessage('administrators.create.success'));
        navigate({ to: '/administrators' });
      },
      onError: (error) => {
        toast.error(getAdministratorAPIErrorMessage(error, tMessage('administrators.create.error')));
      },
    });
  };

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('administrators.create.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('administrators.create.description')}</p> */}
        </div>
      </div>

      <Separator />

      <div className='rounded-md border p-6'>
        <AdministratorForm mode={FormMode.CREATE} isPending={createMutation.isPending} onCancel={handleCancel} onSubmit={handleSubmit} />
      </div>
    </PageContainer>
  );
}
