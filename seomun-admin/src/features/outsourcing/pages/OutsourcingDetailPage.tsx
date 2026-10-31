import { Link } from '@tanstack/react-router';
import { ArrowLeft, FileText, Pencil } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useOutsourcingDetailQuery } from '@/features/outsourcing/api';
import { CertificateThumbnail } from '@/features/outsourcing/components/CertificateThumbnail';
import { cn } from '@/utils/cn';
import { formatKoreanDateTime } from '@/utils/format-date';
import { formatPhoneNumber } from '@/utils/format-phone';

// === Types ===

type OutsourcingDetailPageProps = {
  outsourcingId?: number;
  listPath: string;
  editPath: string;
};

// === Functions ===

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='rounded-xl border'>
      <div className='border-b px-5 py-4'>
        <h2 className='text-sm font-semibold'>{title}</h2>
      </div>
      <dl className='grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2'>{children}</dl>
    </section>
  );
}

function CertificatePreview({ url, openLabel }: { url: string; openLabel: string }) {
  const fileName = url.split('?')[0].split('#')[0].split('/').pop() ?? url;
  const isPdf = fileName.split('.').pop()?.toLowerCase() === 'pdf';

  return (
    <div className='flex items-center gap-3'>
      <a href={url} target='_blank' rel='noreferrer' className='transition-opacity hover:opacity-80' aria-label={openLabel}>
        <CertificateThumbnail url={url} mimeType={isPdf ? 'application/pdf' : 'image/*'} name={fileName} size={80} />
      </a>

      <a href={url} target='_blank' rel='noreferrer' className='text-primary inline-flex min-w-0 items-center gap-1.5 hover:underline'>
        <FileText className='size-4 shrink-0' />
        <span className='truncate'>{openLabel}</span>
      </a>
    </div>
  );
}

function DetailItem({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={cn('min-w-0', wide && 'sm:col-span-2')}>
      <dt className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>{label}</dt>
      <dd className='mt-1.5 text-sm font-medium wrap-break-word whitespace-pre-wrap'>{children}</dd>
    </div>
  );
}

export function OutsourcingDetailPage({ outsourcingId, listPath, editPath }: OutsourcingDetailPageProps) {
  // === Hooks ===
  const { t } = useTranslation('page');

  const hasValidOutsourcingId = outsourcingId !== undefined && Number.isFinite(outsourcingId) && outsourcingId > 0;

  const { data: outsourcingResponse, isLoading } = useOutsourcingDetailQuery(outsourcingId ?? 0, {
    enabled: hasValidOutsourcingId,
  });
  const outsourcing = outsourcingResponse?.data.outsourcing_company;

  // === JSX ===
  if (isLoading) {
    return (
      <PageContainer>
        <div className='space-y-2'>
          <Skeleton className='h-7 w-64' />
          <Skeleton className='h-4 w-96' />
        </div>

        <Separator />

        <Skeleton className='h-56 w-full rounded-xl' />
        <Skeleton className='h-56 w-full rounded-xl' />
      </PageContainer>
    );
  }

  if (!hasValidOutsourcingId || !outsourcing) {
    return (
      <PageContainer>
        <div className='space-y-4'>
          <div>
            <h1 className='text-xl font-semibold'>{t('outsourcing.not_found.title')}</h1>
            <p className='text-muted-foreground mt-0.5 text-sm'>{t('outsourcing.not_found.description')}</p>
          </div>
          <Button asChild variant='outline'>
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
            <h1 className='truncate text-xl font-semibold'>{outsourcing.name}</h1>
            <Badge variant={outsourcing.is_active ? 'default' : 'secondary'}>
              {outsourcing.is_active ? t('outsourcing.status.active') : t('outsourcing.status.inactive')}
            </Badge>
          </div>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('outsourcing.detail.description')}</p> */}
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          <Button asChild variant='outline' size='sm' className='gap-1.5'>
            <Link to={listPath}>
              <ArrowLeft className='size-4' />
              {t('outsourcing.not_found.back_to_list')}
            </Link>
          </Button>
          <Button asChild size='sm' className='gap-1.5'>
            <Link to={editPath}>
              <Pencil className='size-4' />
              {t('outsourcing.actions.edit')}
            </Link>
          </Button>
        </div>
      </div>

      <Separator />

      <DetailSection title={t('outsourcing.detail.sections.basic_info')}>
        <DetailItem label={t('outsourcing.columns.company_name')}>{outsourcing.name}</DetailItem>
        <DetailItem label={t('outsourcing.columns.representative')}>{outsourcing.representative_name}</DetailItem>
        <DetailItem label={t('outsourcing.columns.registration_number')}>
          {outsourcing.registration_number || <span className='text-muted-foreground'>-</span>}
        </DetailItem>
        <DetailItem label={t('outsourcing.detail.registration_certificate')}>
          {outsourcing.registration_certificate ? (
            <CertificatePreview url={outsourcing.registration_certificate} openLabel={t('outsourcing.detail.open_certificate')} />
          ) : (
            <span className='text-muted-foreground'>-</span>
          )}
        </DetailItem>
        <DetailItem label={t('outsourcing.detail.created_at')}>{formatKoreanDateTime(outsourcing.created_at)}</DetailItem>
        <DetailItem label={t('outsourcing.detail.updated_at')}>{formatKoreanDateTime(outsourcing.updated_at)}</DetailItem>
      </DetailSection>

      <DetailSection title={t('outsourcing.detail.sections.contact')}>
        <DetailItem label={t('outsourcing.columns.email')}>
          <a href={`mailto:${outsourcing.email}`} className='text-primary hover:underline'>
            {outsourcing.email}
          </a>
        </DetailItem>
        <DetailItem label={t('outsourcing.columns.contact')}>
          <a href={`tel:${outsourcing.contact}`} className='text-primary hover:underline'>
            {formatPhoneNumber(outsourcing.contact) || outsourcing.contact}
          </a>
        </DetailItem>
        <DetailItem label={t('outsourcing.columns.address')} wide>
          {outsourcing.address}
        </DetailItem>
      </DetailSection>

      <DetailSection title={t('outsourcing.detail.sections.work')}>
        <DetailItem label={t('outsourcing.columns.work_details')} wide>
          {outsourcing.work_details}
        </DetailItem>
        <DetailItem label={t('outsourcing.detail.memo')} wide>
          {outsourcing.memo?.trim() || <span className='text-muted-foreground'>-</span>}
        </DetailItem>
      </DetailSection>
    </PageContainer>
  );
}
