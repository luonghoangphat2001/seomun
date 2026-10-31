import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { FormMode } from '@/enums/form.enum';
import type { OutsourcingRESP } from '@/features/outsourcing/api';
import { useOutsourcingDetailQuery } from '@/features/outsourcing/api';
import { OutsourcingForm } from '@/features/outsourcing/components/OutsourcingForm';

// === Types ===

type OutsourcingFormPageProps = {
  mode: FormMode;
  outsourcingId?: number;
  listPath: string;
  onCancel: () => void;
  /** Create goes back to the list, edit goes to the detail page. */
  onSubmitSuccess: () => void;
};

export function OutsourcingFormPage({ mode, outsourcingId, listPath, onCancel, onSubmitSuccess }: OutsourcingFormPageProps) {
  // === Hooks ===
  const { t } = useTranslation('page');

  // === Variables ===
  const isEditMode = mode === FormMode.EDIT;
  const hasValidOutsourcingId = outsourcingId !== undefined && Number.isFinite(outsourcingId) && outsourcingId > 0;

  const { data: outsourcingResponse, isLoading } = useOutsourcingDetailQuery(outsourcingId ?? 0, {
    enabled: isEditMode && hasValidOutsourcingId,
  });
  const outsourcing = outsourcingResponse?.data.outsourcing_company;

  // === JSX ===
  if (isEditMode && isLoading) {
    return (
      <PageContainer>
        <div className='space-y-2'>
          <Skeleton className='h-7 w-64' />
          <Skeleton className='h-4 w-96' />
        </div>

        <Separator />

        <Skeleton className='h-64 w-full rounded-xl' />
        <Skeleton className='h-40 w-full rounded-xl' />
      </PageContainer>
    );
  }

  if (isEditMode && (!hasValidOutsourcingId || !outsourcing)) {
    return (
      <PageContainer>
        <div className='space-y-4'>
          <div>
            <h1 className='text-xl font-semibold'>{t('outsourcing.not_found.title')}</h1>
            <p className='text-muted-foreground mt-0.5 text-sm'>{t('outsourcing.not_found.description')}</p>
          </div>
          <Button asChild variant='outline' className='gap-1.5'>
            <Link to={listPath}>
              <ArrowLeft className='size-4' />
              {t('outsourcing.not_found.back_to_list')}
            </Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0'>
          <div className='flex flex-wrap items-center gap-2'>
            <h1 className='text-xl font-semibold'>{isEditMode ? t('outsourcing.edit.title') : t('outsourcing.create.title')}</h1>
            {isEditMode && outsourcing ? (
              <Badge variant={outsourcing.is_active ? 'default' : 'secondary'}>
                {outsourcing.is_active ? t('outsourcing.status.active') : t('outsourcing.status.inactive')}
              </Badge>
            ) : null}
          </div>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>
            {isEditMode ? t('outsourcing.edit.description') : t('outsourcing.create.description')}
          </p> */}
        </div>

        <Button asChild variant='outline' size='sm' className='shrink-0 gap-1.5'>
          <Link to={listPath}>
            <ArrowLeft className='size-4' />
            {t('outsourcing.not_found.back_to_list')}
          </Link>
        </Button>
      </div>

      <Separator />

      <OutsourcingForm mode={mode} outsourcing={outsourcing as OutsourcingRESP | undefined} onCancel={onCancel} onSubmitSuccess={onSubmitSuccess} />
    </PageContainer>
  );
}
