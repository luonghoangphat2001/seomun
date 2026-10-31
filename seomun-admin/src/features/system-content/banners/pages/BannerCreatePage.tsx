import { getRouteApi } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';
import { FormMode } from '@/enums/form.enum';

import { useCreateBannerMutation } from '../api/banner.query';
import { toBannerPayload } from '../api/banner.service';
import { BannerForm } from '../components/BannerForm';
import type { BannerFormValues } from '../schemas';

const routeApi = getRouteApi('/system-content/banners/create');

export function BannerCreatePage() {
  const { t } = useTranslation('page');
  const { t: tMessage } = useTranslation('message');

  const navigate = routeApi.useNavigate();
  const createMutation = useCreateBannerMutation();

  const handleCancel = () => {
    void navigate({ to: '/system-content/banners' });
  };

  const handleSubmit = (values: BannerFormValues) => {
    createMutation.mutate(toBannerPayload(values), {
      onSuccess: () => {
        toast.success(tMessage('banners.create.success'));
        void navigate({ to: '/system-content/banners' });
      },
      onError: () => toast.error(tMessage('banners.create.error')),
    });
  };

  return (
    <PageContainer>
      <div>
        <h1 className='text-xl font-semibold'>{t('banners.create.title')}</h1>
        {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('banners.create.description')}</p> */}
      </div>

      <Separator />

      <BannerForm mode={FormMode.CREATE} isPending={createMutation.isPending} onCancel={handleCancel} onSubmit={handleSubmit} />
    </PageContainer>
  );
}
