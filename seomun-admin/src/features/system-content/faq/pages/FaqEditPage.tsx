import { getRouteApi } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { FormMode } from '@/enums/form.enum';

import { useDeleteFaqMutation, useFaqDetailQuery, useUpdateFaqMutation } from '../api/faq.query';
import { FaqForm } from '../components/FaqForm';
import type { FaqFormValues } from '../schemas';

const routeApi = getRouteApi('/system-content/faqs/$faqId');

export function FaqEditPage() {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { t: tMessage } = useTranslation('message');

  const { faqId } = routeApi.useParams();
  const navigate = routeApi.useNavigate();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: faq, isLoading } = useFaqDetailQuery(faqId);
  const updateMutation = useUpdateFaqMutation(faqId);
  const deleteMutation = useDeleteFaqMutation();

  const handleCancel = () => {
    void navigate({ to: '/system-content/faqs' });
  };

  const handleSubmit = (values: FaqFormValues) => {
    updateMutation.mutate(values, {
      onSuccess: () => {
        toast.success(tMessage('faqs.update.success'));
        void navigate({ to: '/system-content/faqs' });
      },
      onError: () => {
        toast.error(tMessage('faqs.update.error'));
      },
    });
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(faqId, {
      onSuccess: () => {
        toast.success(tMessage('faqs.delete.success'));
        void navigate({ to: '/system-content/faqs' });
      },
      onError: () => {
        toast.error(tMessage('faqs.delete.error'));
        setShowDeleteDialog(false);
      },
    });
  };

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t('faqs.edit.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('faqs.edit.description')}</p> */}
        </div>
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
      ) : !faq ? (
        <div className='text-muted-foreground py-8 text-center'>{t('faqs.edit.not_found')}</div>
      ) : (
        <FaqForm
          mode={FormMode.EDIT}
          faq={faq}
          isPending={updateMutation.isPending}
          isDeleting={deleteMutation.isPending}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          onDelete={() => setShowDeleteDialog(true)}
        />
      )}

      <AppDialogModal
        isOpen={showDeleteDialog}
        setIsOpen={(open) => {
          if (!open) setShowDeleteDialog(false);
        }}
        title={tCommon('action.delete')}
        confirmLoading={deleteMutation.isPending}
        footer={
          <>
            <AppButton variant='outline' onClick={() => setShowDeleteDialog(false)} disabled={deleteMutation.isPending}>
              {tCommon('action.cancel')}
            </AppButton>
            <AppButton variant='destructive' onClick={handleDeleteConfirm} isLoading={deleteMutation.isPending}>
              {tCommon('action.delete')}
            </AppButton>
          </>
        }
      >
        <p className='text-sm'>{t('faqs.list.confirm_delete')}</p>
      </AppDialogModal>
    </PageContainer>
  );
}
