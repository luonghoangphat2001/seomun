import { getRouteApi } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { FormMode } from '@/enums/form.enum';

import { useGuideDetailQuery, useUpdateGuideMutation } from '../api';
import { toGuidePayload } from '../api/guide.service';
import { GuideForm } from '../components/GuideForm';
import type { GuideFormValues } from '../schemas';

const routeApi = getRouteApi('/system-content/guides/$guideId');

export function GuideEditPage() {
  const { t } = useTranslation('page');
  const { t: tMsg } = useTranslation('message');

  const { guideId } = routeApi.useParams();
  const navigate = routeApi.useNavigate();

  const { data: guide, isLoading } = useGuideDetailQuery(guideId);
  const updateMutation = useUpdateGuideMutation();

  const handleCancel = () => {
    void navigate({ to: '/system-content/guides' });
  };

  const handleSubmit = (values: GuideFormValues) => {
    updateMutation.mutate(
      { id: guideId, payload: toGuidePayload(values) },
      {
        onSuccess: () => {
          toast.success(tMsg('guides.update.success'));
          void navigate({ to: '/system-content/guides' });
        },
        onError: () => toast.error(tMsg('guides.update.error')),
      },
    );
  };

  return (
    <PageContainer>
      <div>
        <h1 className='text-xl font-semibold'>{t('guides.edit.title')}</h1>
        {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('guides.edit.description')}</p> */}
      </div>

      <Separator />

      {isLoading ? (
        <div className='space-y-6'>
          <div className='grid gap-4 md:grid-cols-2'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-10 w-full' />
              </div>
            ))}
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-32 w-full' />
          </div>
        </div>
      ) : !guide ? (
        <div className='text-muted-foreground py-8 text-center'>{t('guides.edit.not_found')}</div>
      ) : (
        <GuideForm mode={FormMode.EDIT} guide={guide} isPending={updateMutation.isPending} onCancel={handleCancel} onSubmit={handleSubmit} />
      )}
    </PageContainer>
  );
}
