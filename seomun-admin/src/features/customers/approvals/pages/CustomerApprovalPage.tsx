import { getRouteApi } from '@tanstack/react-router';
import { functionalUpdate, type RowSelectionState, type SortingState } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { getApiErrorMessage } from '@/utils/api-error';
import { getCustomerApprovalRequestTypeOptions } from '../../constants';
import { CustomerApprovalStatus } from '../../enums';
import { CustomerApprovalToolbar } from '../components/CustomerApprovalToolbar';
import { getCustomerApprovalHistoryColumns, getCustomerApprovalRequestColumns } from '../components/CustomerApprovalColumns';
import {
  useCustomerApprovalDecisionMutation,
  useCustomerApprovalHistoryQuery,
  useCustomerApprovalRequestsQuery,
} from '../api/customer-approvals.query';
import type { CustomerApprovalStatusFilter } from '../api/customer-approvals.request';
import type { CustomerApprovalSearch } from '../schemas';

const customerApprovalsRouteApi = getRouteApi('/customers/approvals');

export function CustomerApprovalPage() {
  const { t } = useTranslation();
  const search = customerApprovalsRouteApi.useSearch();
  const navigate = customerApprovalsRouteApi.useNavigate();

  const requestFilter = {
    page: search.request_page ?? 1,
    per_page: search.request_per_page ?? 10,
    request_type: search.request_request_type,
  };
  const historyFilter = {
    page: search.history_page ?? 1,
    per_page: search.history_per_page ?? 10,
    request_type: search.history_request_type,
    approval_status: search.history_approval_status,
  };
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [decisionStatus, setDecisionStatus] = useState<CustomerApprovalStatus.APPROVED | CustomerApprovalStatus.REJECTED>(
    CustomerApprovalStatus.APPROVED,
  );
  const [decisionReason, setDecisionReason] = useState('');
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);

  const requestsQuery = useCustomerApprovalRequestsQuery(requestFilter);
  const historyQuery = useCustomerApprovalHistoryQuery(historyFilter);
  const decisionMutation = useCustomerApprovalDecisionMutation();

  const selectedRequestIds = useMemo(
    () =>
      Object.entries(rowSelection)
        .filter(([, selected]) => selected)
        .map(([id]) => Number(id)),
    [rowSelection],
  );
  const isBatchDecision = selectedRequestIds.length > 1;
  const approvalStatusOptions = [
    { value: 'accepted', label: t('page.customers.shared.approval_status.approved') },
    { value: 'rejected', label: t('page.customers.shared.approval_status.rejected') },
  ] satisfies Array<{ value: CustomerApprovalStatusFilter; label: string }>;

  const requestTableState = {
    pagination: { pageIndex: requestFilter.page - 1, pageSize: requestFilter.per_page },
    sorting: [] as SortingState,
  };
  const historyTableState = {
    pagination: { pageIndex: historyFilter.page - 1, pageSize: historyFilter.per_page },
    sorting: [] as SortingState,
  };

  const closeDecisionDialog = () => {
    setDecisionReason('');
    setIsDecisionOpen(false);
  };

  const resetDecisionState = () => {
    setRowSelection({});
    closeDecisionDialog();
  };

  const handleDecisionOpenChange = (open: boolean) => {
    if (open) {
      setIsDecisionOpen(true);
      return;
    }

    closeDecisionDialog();
  };

  return (
    <PageContainer>
      <div>
        <h1 className='text-xl font-semibold'>{t('page.customers.approvals.title')}</h1>
        <p className='text-muted-foreground text-sm'>{t('page.customers.approvals.description')}</p>
      </div>

      <Separator />

      <CustomerApprovalToolbar
        requestType={search.request_request_type}
        requestTypeOptions={getCustomerApprovalRequestTypeOptions(t)}
        onRequestTypeChange={(value) => {
          navigate({
            search: (prev: CustomerApprovalSearch) => ({
              ...prev,
              request_request_type: value,
              request_page: 1,
            }),
          });
        }}
      />

      {selectedRequestIds.length > 0 ? (
        <div className='rounded-xl border border-blue-200 bg-blue-50 p-4'>
          <p className='text-sm font-medium'>{t('page.customers.approvals.selected_count', { count: selectedRequestIds.length })}</p>
          <div className='mt-3 flex gap-2'>
            <AppButton
              type='button'
              onClick={() => {
                setDecisionStatus(CustomerApprovalStatus.APPROVED);
                setIsDecisionOpen(true);
              }}
            >
              {t(isBatchDecision ? 'page.customers.approvals.actions.batch_approve' : 'page.customers.approvals.actions.approve')}
            </AppButton>
            <AppButton
              type='button'
              variant='outline'
              onClick={() => {
                setDecisionStatus(CustomerApprovalStatus.REJECTED);
                setIsDecisionOpen(true);
              }}
            >
              {t(isBatchDecision ? 'page.customers.approvals.actions.batch_reject' : 'page.customers.approvals.actions.reject')}
            </AppButton>
          </div>
        </div>
      ) : null}

      <section className='space-y-3'>
        <h2 className='text-sm font-semibold'>{t('page.customers.approvals.request_list_title')}</h2>
        <DataTable
          data={requestsQuery.data?.data.requests ?? []}
          columns={getCustomerApprovalRequestColumns(t)}
          state={requestTableState}
          pageInfo={{
            pageCount: requestsQuery.data?.data.pagination.total_page ?? 0,
            rowCount: requestsQuery.data?.data.pagination.total_item ?? 0,
          }}
          onPaginationChange={(updater) => {
            const next = functionalUpdate(updater, requestTableState.pagination);
            navigate({
              search: (prev: CustomerApprovalSearch) => ({
                ...prev,
                request_page: next.pageIndex + 1,
                request_per_page: next.pageSize,
              }),
            });
          }}
          onSortingChange={() => undefined}
          isLoading={requestsQuery.isLoading}
          getRowId={(row) => String(row.id)}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
        />
      </section>

      <section className='space-y-3'>
        <h2 className='text-sm font-semibold'>{t('page.customers.approvals.history_title')}</h2>
        <CustomerApprovalToolbar
          requestType={search.history_request_type}
          requestTypeOptions={getCustomerApprovalRequestTypeOptions(t)}
          approvalStatus={search.history_approval_status}
          approvalStatusOptions={approvalStatusOptions}
          onRequestTypeChange={(value) => {
            navigate({
              search: (prev: CustomerApprovalSearch) => ({
                ...prev,
                history_request_type: value,
                history_page: 1,
              }),
            });
          }}
          onApprovalStatusChange={(value) => {
            navigate({
              search: (prev: CustomerApprovalSearch) => ({
                ...prev,
                history_approval_status: value,
                history_page: 1,
              }),
            });
          }}
        />
        <DataTable
          data={historyQuery.data?.data.histories ?? []}
          columns={getCustomerApprovalHistoryColumns(t)}
          state={historyTableState}
          pageInfo={{
            pageCount: historyQuery.data?.data.pagination.total_page ?? 0,
            rowCount: historyQuery.data?.data.pagination.total_item ?? 0,
          }}
          onPaginationChange={(updater) => {
            const next = functionalUpdate(updater, historyTableState.pagination);
            navigate({
              search: (prev: CustomerApprovalSearch) => ({
                ...prev,
                history_page: next.pageIndex + 1,
                history_per_page: next.pageSize,
              }),
            });
          }}
          onSortingChange={() => undefined}
          isLoading={historyQuery.isLoading}
          getRowId={(row) => String(row.id)}
          enableRowSelection={false}
        />
      </section>

      <Dialog open={isDecisionOpen} onOpenChange={handleDecisionOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decisionStatus === CustomerApprovalStatus.APPROVED
                ? t('page.customers.approvals.dialog.approve_title')
                : t('page.customers.approvals.dialog.reject_title')}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-2'>
            <p className='text-sm'>{t('page.customers.approvals.dialog.reason_hint')}</p>
            <Textarea
              value={decisionReason}
              onChange={(event) => setDecisionReason(event.target.value)}
              placeholder={t('page.customers.approvals.dialog.reason_placeholder')}
            />
          </div>
          <DialogFooter>
            <AppButton type='button' variant='outline' onClick={closeDecisionDialog} disabled={decisionMutation.isPending}>
              {t('common.action.cancel')}
            </AppButton>
            <AppButton
              type='button'
              isLoading={decisionMutation.isPending}
              disabled={!decisionReason.trim()}
              onClick={() =>
                decisionMutation.mutate(
                  {
                    customer_ids: selectedRequestIds,
                    approval_status: decisionStatus,
                    reason: decisionReason.trim(),
                  },
                  {
                    onSuccess: (result) => {
                      const processedCount = result.data?.processed_count ?? selectedRequestIds.length;
                      resetDecisionState();
                      toast.success(t('page.customers.approvals.messages.processed', { count: processedCount }));
                    },
                    onError: (error) => toast.error(getApiErrorMessage(error, t('page.customers.approvals.messages.process_failed'))),
                  },
                )
              }
            >
              {t('page.customers.approvals.actions.confirm')}
            </AppButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
