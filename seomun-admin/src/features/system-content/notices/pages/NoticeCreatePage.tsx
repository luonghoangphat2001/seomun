import { getRouteApi } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';
import { FormMode } from '@/enums/form.enum';

import { toNoticePayload } from '../api/notice.service';
import { useCreateNoticeMutation, useNoticesFilterQuery } from '../api';
import { NoticeForm } from '../components/NoticeForm';
import type { NoticeFormValues } from '../schemas';

const routeApi = getRouteApi('/system-content/notices/create');

export function NoticeCreatePage() {
  const { t } = useTranslation('page');
  const { t: tMsg } = useTranslation('message');
  const navigate = routeApi.useNavigate();

  const createMutation = useCreateNoticeMutation();
  const { data: filterData } = useNoticesFilterQuery();

  const handleCancel = () => {
    void navigate({ to: '/system-content/notices' });
  };

  const handleSubmit = (values: NoticeFormValues) => {
    createMutation.mutate(toNoticePayload(values), {
      onSuccess: () => {
        toast.success(tMsg('notices.create.success'));
        void navigate({ to: '/system-content/notices' });
      },
      onError: () => {
        toast.error(tMsg('notices.create.error'));
      },
    });
  };

  return (
    <PageContainer>
      <div>
        <h1 className='text-xl font-semibold'>{t('notices.create.title')}</h1>
        {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('notices.create.description')}</p> */}
      </div>

      <Separator />

      <NoticeForm
        mode={FormMode.CREATE}
        filterData={filterData}
        isPending={createMutation.isPending}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
}
