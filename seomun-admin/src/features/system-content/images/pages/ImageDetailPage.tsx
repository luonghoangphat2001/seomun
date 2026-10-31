import { getRouteApi } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { FormMode } from '@/enums/form.enum';

import { useImageDetailQuery } from '../api';
import { ImageForm } from '../components/ImageForm';

// === Variables ===

const routeApi = getRouteApi('/system-content/images/$imageId/');

// === Component ===

export function ImageDetailPage() {
  const { t } = useTranslation('page');
  const { imageId } = routeApi.useParams();
  const navigate = routeApi.useNavigate();

  const { data: image, isLoading } = useImageDetailQuery(imageId);

  const handleBack = () => {
    void navigate({ to: '/system-content/images' });
  };

  return (
    <PageContainer>
      <div>
        <h1 className='text-xl font-semibold'>{t('images.detail.title', 'File Detail')}</h1>
        {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('images.detail.description', 'View file details.')}</p> */}
      </div>

      <Separator />

      {isLoading ? (
        <div className='space-y-4'>
          <Skeleton className='h-32 w-full' />
          <Skeleton className='h-48 w-full' />
        </div>
      ) : (
        <ImageForm mode={FormMode.DETAIL} image={image ?? undefined} isPending={false} onCancel={handleBack} />
      )}
    </PageContainer>
  );
}
