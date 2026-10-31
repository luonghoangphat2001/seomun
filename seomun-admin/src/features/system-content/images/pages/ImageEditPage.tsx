import { getRouteApi } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { FormMode } from '@/enums/form.enum';

import { useImageDetailQuery, useUpdateImageMutation } from '../api';
import { ImageForm } from '../components/ImageForm';
import type { ImageFormValues } from '../schemas';

// === Variables ===

const routeApi = getRouteApi('/system-content/images/$imageId/edit');

// === Component ===

export function ImageEditPage() {
  const { t } = useTranslation('page');
  const { t: tMsg } = useTranslation('message');
  const { imageId } = routeApi.useParams();
  const navigate = routeApi.useNavigate();

  const { data: image, isLoading } = useImageDetailQuery(imageId);
  const updateMutation = useUpdateImageMutation(imageId);

  const handleCancel = () => {
    void navigate({ to: '/system-content/images' });
  };

  const handleSubmit = (values: ImageFormValues) => {
    updateMutation.mutate(values, {
      onSuccess: () => {
        toast.success(tMsg('images.update.success', 'Image updated successfully.'));
        void navigate({ to: '/system-content/images' });
      },
      onError: () => {
        toast.error(tMsg('images.update.error', 'Failed to update image.'));
      },
    });
  };

  return (
    <PageContainer>
      <div>
        <h1 className='text-xl font-semibold'>{t('images.edit.title', 'Edit Image')}</h1>
        {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('images.edit.description', 'Update image metadata or replace the image file.')}</p> */}
      </div>

      <Separator />

      {isLoading ? (
        <div className='space-y-6'>
          <div className='grid gap-4 md:grid-cols-2'>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-10 w-full' />
              </div>
            ))}
          </div>
          <Skeleton className='h-48 w-full' />
        </div>
      ) : !image ? (
        <div className='text-muted-foreground py-8 text-center'>{t('images.edit.not_found', 'Image not found.')}</div>
      ) : (
        <ImageForm mode={FormMode.EDIT} image={image} isPending={updateMutation.isPending} onCancel={handleCancel} onSubmit={handleSubmit} />
      )}
    </PageContainer>
  );
}
