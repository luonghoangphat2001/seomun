import { getRouteApi } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { FormMode } from '@/enums/form.enum';

import { toNoticePayload } from '../api/notice.service';
import { useNoticeDetailQuery, useNoticesFilterQuery, useUpdateNoticeMutation } from '../api';
import { NoticeForm } from '../components/NoticeForm';
import type { NoticeFormValues } from '../schemas';

const routeApi = getRouteApi('/system-content/notices/$noticeId');

export function NoticeEditPage() {
  const { t } = useTranslation('page');
  const { t: tMsg } = useTranslation('message');
  const { noticeId } = routeApi.useParams();
  const navigate = routeApi.useNavigate();

  const { data: notice, isLoading } = useNoticeDetailQuery(noticeId);
  const { data: filterData } = useNoticesFilterQuery();
  const updateMutation = useUpdateNoticeMutation();

  const handleCancel = () => {
    void navigate({ to: '/system-content/notices' });
  };

  const handleSubmit = (values: NoticeFormValues) => {
    updateMutation.mutate(
      { id: noticeId, payload: toNoticePayload(values) },
      {
        onSuccess: () => {
          toast.success(tMsg('notices.update.success'));
        },
        onError: () => {
          toast.error(tMsg('notices.update.error'));
        },
      },
    );
  };

  return (
    <PageContainer>
      <div>
        <h1 className='text-xl font-semibold'>{t('notices.edit.title')}</h1>
        {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('notices.edit.description')}</p> */}
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
      ) : !notice ? (
        <div className='text-muted-foreground py-8 text-center'>{t('notices.edit.not_found')}</div>
      ) : (
        <NoticeForm
          mode={FormMode.EDIT}
          notice={notice}
          filterData={filterData}
          isPending={updateMutation.isPending}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      )}
    </PageContainer>
  );
}
