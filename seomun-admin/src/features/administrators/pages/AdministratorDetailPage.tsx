import { Link, getRouteApi } from '@tanstack/react-router';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

import { FormMode } from '@/enums/form.enum';
import { useAdministratorDetailQuery, useUpdateAdministratorMutation, useUpdateAdministratorPasswordMutation } from '../api/administrator.query';
import { ADMINISTRATOR_FORM_ID, AdministratorForm } from '../components/AdministratorForm';
import { AdministratorUpdatePasswordDialog } from '../components/AdministratorUpdatePasswordDialog';
import type { AdministratorFormValues, AdministratorUpdatePasswordFormValues } from '../schemas';
import { getAdministratorAPIErrorMessage } from '../utils/administrator-error';

const routeApi = getRouteApi('/administrators/$administratorId');

export function AdministratorDetailPage() {
  const { t } = useTranslation('page');
  const { t: tMessage } = useTranslation('message');
  const { t: tCommon } = useTranslation('common');
  const { t: tForm } = useTranslation('form');
  const { administratorId } = routeApi.useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const { data: administrator, isLoading } = useAdministratorDetailQuery(administratorId);
  const updateMutation = useUpdateAdministratorMutation(administratorId);
  const updatePasswordMutation = useUpdateAdministratorPasswordMutation(administratorId);

  const handlePasswordSubmit = (values: AdministratorUpdatePasswordFormValues) => {
    updatePasswordMutation.mutate(values, {
      onSuccess: () => {
        toast.success(tMessage('administrators.password_update.success'));
        setIsPasswordDialogOpen(false);
      },
      onError: (error) => {
        toast.error(getAdministratorAPIErrorMessage(error, tMessage('administrators.password_update.error')));
      },
    });
  };

  const handleSubmit = (values: AdministratorFormValues) => {
    updateMutation.mutate(values, {
      onSuccess: () => {
        toast.success(tMessage('administrators.edit.success'));
        setIsEditing(false);
      },
      onError: (error) => {
        toast.error(getAdministratorAPIErrorMessage(error, tMessage('administrators.edit.error')));
      },
    });
  };

  return (
    <PageContainer>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>{t(isEditing ? 'administrators.edit.title' : 'administrators.detail.title')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('administrators.edit.description')}</p> */}
        </div>

        <div className='flex items-center gap-2'>
          <Button asChild variant='outline' size='sm' className='gap-1.5'>
            <Link to='/administrators'>
              <ArrowLeft className='size-4' />
              {tCommon('action.back')}
            </Link>
          </Button>
          {administrator && !isEditing ? (
            <Button size='sm' className='gap-1.5' onClick={() => setIsEditing(true)}>
              <Pencil className='size-4' />
              {tCommon('action.edit')}
            </Button>
          ) : null}
          {isEditing ? (
            <>
              <Button type='button' variant='outline' size='sm' onClick={() => setIsEditing(false)} disabled={updateMutation.isPending}>
                {tCommon('action.cancel')}
              </Button>
              <AppButton type='submit' form={ADMINISTRATOR_FORM_ID} size='sm' isLoading={updateMutation.isPending}>
                {tForm('administrators.actions.save_changes')}
              </AppButton>
            </>
          ) : null}
        </div>
      </div>

      <Separator />

      <div className='rounded-md border p-6'>
        {isLoading ? (
          <div className='space-y-6'>
            <div className='grid gap-4 md:grid-cols-2'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='space-y-2'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-10 w-full' />
                </div>
              ))}
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-10 w-full' />
            </div>
          </div>
        ) : !administrator ? (
          <div className='text-muted-foreground py-8 text-center'>{t('administrators.edit.not_found')}</div>
        ) : (
          <AdministratorForm
            // remount on toggle so cancelling discards unsaved edits
            key={isEditing ? 'edit' : 'view'}
            mode={FormMode.EDIT}
            administrator={administrator}
            isPending={updateMutation.isPending}
            readOnly={!isEditing}
            onChangePassword={() => setIsPasswordDialogOpen(true)}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      <AdministratorUpdatePasswordDialog
        open={isPasswordDialogOpen}
        isPending={updatePasswordMutation.isPending}
        onOpenChange={setIsPasswordDialogOpen}
        onSubmit={handlePasswordSubmit}
      />
    </PageContainer>
  );
}
