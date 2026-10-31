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

import { usePopupDetailQuery, useDeletePopupMutation, useUpdatePopupMutation } from '../api/popup.query';
import { toPopupPayload } from '../api/popup.service';
import { PopupForm } from '../components/PopupForm';
import type { PopupFormValues } from '../schemas';

const routeApi = getRouteApi('/system-content/popups/$popupId');

export function PopupEditPage() {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { t: tMessage } = useTranslation('message');

  const { popupId } = routeApi.useParams();
  const navigate = routeApi.useNavigate();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: popup, isLoading } = usePopupDetailQuery(popupId);
  const updateMutation = useUpdatePopupMutation();
  const deleteMutation = useDeletePopupMutation();

  const handleCancel = () => {
    void navigate({ to: '/system-content/popups' });
  };

  const handleSubmit = (values: PopupFormValues) => {
    updateMutation.mutate(
      { id: popupId, payload: toPopupPayload(values) },
      {
        onSuccess: () => {
          toast.success(tMessage('popups.update.success'));
          void navigate({ to: '/system-content/popups' });
        },
        onError: () => toast.error(tMessage('popups.update.error')),
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(popupId, {
      onSuccess: () => {
        toast.success(tMessage('popups.delete.success'));
        void navigate({ to: '/system-content/popups' });
      },
      onError: () => toast.error(tMessage('popups.delete.error')),
    });
  };

  return (
    <PageContainer>
      <div>
        <h1 className='text-xl font-semibold'>{t('popups.edit.title')}</h1>
        {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('popups.edit.description')}</p> */}
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
      ) : !popup ? (
        <div className='text-muted-foreground py-8 text-center'>{t('popups.edit.not_found')}</div>
      ) : (
        <PopupForm
          mode={FormMode.EDIT}
          popup={popup}
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
        <p className='text-sm'>{t('popups.list.confirm_delete')}</p>
      </AppDialogModal>
    </PageContainer>
  );
}
