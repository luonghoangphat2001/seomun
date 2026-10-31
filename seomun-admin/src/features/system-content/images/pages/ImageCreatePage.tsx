import { getRouteApi } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';
import { FormMode } from '@/enums/form.enum';

import { useCreateImageMutation } from '../api';
import { ImageForm } from '../components/ImageForm';
import type { ImageFormValues } from '../schemas';

// === Variables ===

const routeApi = getRouteApi('/system-content/images/create');

// === Component ===

export function ImageCreatePage() {
  const { t } = useTranslation('page');
  const { t: tMsg } = useTranslation('message');
  const navigate = routeApi.useNavigate();

  const createMutation = useCreateImageMutation();

  const handleCancel = () => {
    void navigate({ to: '/system-content/images' });
  };

  const handleSubmit = (values: ImageFormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success(tMsg('images.create.success', 'Image registered successfully.'));
        void navigate({ to: '/system-content/images' });
      },
      onError: () => {
        toast.error(tMsg('images.create.error', 'Failed to register image.'));
      },
    });
  };

  return (
    <PageContainer>
      <div>
        <h1 className='text-xl font-semibold'>{t('images.create.title', 'Upload Image')}</h1>
        {/* <p className='text-muted-foreground mt-0.5 text-sm'>
          {t('images.create.description', 'Upload a new image and assign it to a page category.')}
        </p> */}
      </div>

      <Separator />

      <ImageForm mode={FormMode.CREATE} isPending={createMutation.isPending} onCancel={handleCancel} onSubmit={handleSubmit} />
    </PageContainer>
  );
}
