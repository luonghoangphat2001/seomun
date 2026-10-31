import { useState } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { FormMode } from '@/enums/form.enum';

import { useBannerDetailQuery, useBannersFilterQuery, useDeleteBannerMutation, useUpdateBannerMutation } from '../api/banner.query';
import { toBannerPayload } from '../api/banner.service';
import { BannerForm } from '../components/BannerForm';
import type { BannerFormValues } from '../schemas';

const routeApi = getRouteApi('/system-content/banners/$bannerId');

export function BannerEditPage() {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { t: tMessage } = useTranslation('message');

  const { bannerId } = routeApi.useParams();
  const navigate = routeApi.useNavigate();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: banner, isLoading } = useBannerDetailQuery(bannerId);
  const { data: filterData } = useBannersFilterQuery();
  const updateMutation = useUpdateBannerMutation();
  const deleteMutation = useDeleteBannerMutation();

  const handleCancel = () => {
    void navigate({ to: '/system-content/banners' });
  };

  const handleSubmit = (values: BannerFormValues) => {
    updateMutation.mutate(
      { id: bannerId, payload: toBannerPayload(values) },
      {
        onSuccess: () => {
          toast.success(tMessage('banners.update.success'));
          void navigate({ to: '/system-content/banners' });
        },
        onError: () => toast.error(tMessage('banners.update.error')),
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(bannerId, {
      onSuccess: () => {
        toast.success(tMessage('banners.delete.success'));
        void navigate({ to: '/system-content/banners' });
      },
      onError: () => toast.error(tMessage('banners.delete.error')),
    });
  };

  return (
    <PageContainer>
      <div>
        <h1 className='text-xl font-semibold'>{t('banners.edit.title')}</h1>
        {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('banners.edit.description')}</p> */}
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
      ) : !banner ? (
        <div className='text-muted-foreground py-8 text-center'>{t('banners.edit.not_found')}</div>
      ) : (
        <BannerForm
          mode={FormMode.EDIT}
          banner={banner}
          filterData={filterData}
          isPending={updateMutation.isPending}
          isDeleting={deleteMutation.isPending}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          onDelete={() => setShowDeleteDialog(true)}
        />
      )}

      <AppDialogModal
        isOpen={showDeleteDialog}
        setIsOpen={setShowDeleteDialog}
        title={tCommon('action.delete')}
        footer={
          <>
            <AppButton variant='outline' onClick={() => setShowDeleteDialog(false)} disabled={deleteMutation.isPending}>
              {tCommon('action.cancel')}
            </AppButton>
            <AppButton variant='destructive' onClick={handleDelete} isLoading={deleteMutation.isPending}>
              {tCommon('action.delete')}
            </AppButton>
          </>
        }
      >
        <p className='text-sm'>{t('banners.edit.confirm_delete')}</p>
      </AppDialogModal>
    </PageContainer>
  );
}
