import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import {
  inquiryDetailQueryOptions,
  useAssignManager,
  useCreateInternalMemo,
  useInquiryDetail,
  useInquirySearchFilters,
  useUpdateInquiryStatus,
} from '../api';
import {
  InquiryAuditLogSection,
  InquiryDetailHeader,
  InquiryInfoCard,
  InquiryProductCard,
  InquiryReplySection,
  InternalMemoSection,
  RelatedInquiryList,
} from '../components/detail';
import { AssignManagerDialog, InternalMemoDialog, UpdateStatusDialog } from '../components/modal';

type InquiryDetailPageProps = {
  inquiryId: string;
  onBackToList: () => void;
};

export { inquiryDetailQueryOptions };

export function InquiryDetailPage({ inquiryId, onBackToList }: InquiryDetailPageProps) {
  const { t: tRaw } = useTranslation();
  const t = tRaw as (key: string, options?: Record<string, unknown>) => string;
  const { data: inquiry, isLoading, error } = useInquiryDetail(inquiryId, { enabled: Boolean(inquiryId) });
  const { data: filterResponse } = useInquirySearchFilters();
  const assignMutation = useAssignManager();
  const statusMutation = useUpdateInquiryStatus();
  const memoMutation = useCreateInternalMemo();
  const [assignOpen, setAssignOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [memoOpen, setMemoOpen] = useState(false);

  if (isLoading) {
    return (
      <PageContainer>
        <div className='grid animate-pulse gap-6 lg:grid-cols-3'>
          <div className='bg-muted h-96 rounded-xl lg:col-span-2' />
          <div className='bg-muted h-80 rounded-xl' />
        </div>
      </PageContainer>
    );
  }

  if (error || !inquiry) {
    return (
      <PageContainer>
        <div className='flex flex-col items-center justify-center gap-4 py-20 text-center'>
          <div>
            <h1 className='text-xl font-semibold'>{t('page.inquiries.detail.not_found_title')}</h1>
            <p className='text-muted-foreground mt-1 text-sm'>{t('page.inquiries.detail.not_found_description')}</p>
          </div>
          <Button variant='outline' onClick={onBackToList}>
            {t('page.inquiries.actions.back_to_list')}
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='space-y-6 lg:col-span-2'>
          <InquiryDetailHeader
            data={inquiry}
            onBack={onBackToList}
            onAssignManager={() => setAssignOpen(true)}
            onChangeStatus={() => setStatusOpen(true)}
          />
          <InquiryReplySection inquiryId={String(inquiry.id)} />
          <InternalMemoSection inquiryId={String(inquiry.id)} onCreate={() => setMemoOpen(true)} />
          <InquiryAuditLogSection inquiryId={String(inquiry.id)} />
        </div>
        <div className='space-y-6 lg:self-start'>
          <InquiryInfoCard data={inquiry} />
          <InquiryProductCard data={inquiry} />
          <RelatedInquiryList inquiryId={String(inquiry.id)} />
        </div>
      </div>

      <AssignManagerDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        managers={filterResponse?.data.filters.assigned_to_options ?? []}
        defaultPersonInCharge={inquiry.assigned_to ? String(inquiry.assigned_to.id) : undefined}
        isLoading={assignMutation.isPending}
        onSubmit={(values) => {
          assignMutation.mutate(
            { id: String(inquiry.id), data: values },
            {
              onSuccess: () => {
                toast.success(t('page.inquiries.messages.assign_success'));
                setAssignOpen(false);
              },
            },
          );
        }}
      />

      <UpdateStatusDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        currentStatus={inquiry.status}
        isLoading={statusMutation.isPending}
        onSubmit={(values) => {
          statusMutation.mutate(
            { id: String(inquiry.id), data: values },
            {
              onSuccess: () => {
                toast.success(t('page.inquiries.messages.status_update_success'));
                setStatusOpen(false);
              },
            },
          );
        }}
      />

      <InternalMemoDialog
        open={memoOpen}
        onOpenChange={setMemoOpen}
        isLoading={memoMutation.isPending}
        onSubmit={(values) => {
          memoMutation.mutate(
            { id: String(inquiry.id), data: values },
            {
              onSuccess: () => {
                toast.success(t('page.inquiries.messages.memo_saved_success'));
                setMemoOpen(false);
              },
            },
          );
        }}
      />
    </PageContainer>
  );
}
