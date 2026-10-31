import type { ColumnDef } from '@tanstack/react-table';
import type { TFunction } from 'i18next';

import type { CustomerApprovalHistoryItem, CustomerApprovalRequest } from '../../types/customer.type';
import { getCustomerApprovalRequestTypeLabel, getCustomerApprovalStatusLabel, translateCustomerApprovalReason } from '../../utils/i18n';

export function getCustomerApprovalRequestColumns(t: TFunction): ColumnDef<CustomerApprovalRequest>[] {
  return [
    { accessorKey: 'companyName', header: t('page.customers.approvals.columns.company_name') },
    {
      accessorKey: 'requestType',
      header: t('page.customers.approvals.columns.request_type'),
      cell: ({ row }) => (row.original.requestType ? getCustomerApprovalRequestTypeLabel(t, row.original.requestType.value) : '-'),
    },
    { accessorKey: 'requester', header: t('page.customers.approvals.columns.requester') },
    { accessorKey: 'contactName', header: t('page.customers.approvals.columns.contact_name') },
    {
      accessorKey: 'requestedAt',
      header: t('page.customers.approvals.columns.requested_at'),
      cell: ({ row }) => new Date(row.original.requestedAt).toLocaleString(),
    },
    {
      accessorKey: 'approvalStatus',
      header: t('page.customers.approvals.columns.approval'),
      cell: ({ row }) => getCustomerApprovalStatusLabel(t, row.original.approvalStatus.value),
    },
  ];
}

export function getCustomerApprovalHistoryColumns(t: TFunction): ColumnDef<CustomerApprovalHistoryItem>[] {
  return [
    { accessorKey: 'companyName', header: t('page.customers.approvals.columns.company_name') },
    {
      accessorKey: 'requestType',
      header: t('page.customers.approvals.columns.request_type'),
      cell: ({ row }) => (row.original.requestType ? getCustomerApprovalRequestTypeLabel(t, row.original.requestType.value) : '-'),
    },
    { accessorKey: 'requester', header: t('page.customers.approvals.columns.requester') },
    { accessorKey: 'approver', header: t('page.customers.approvals.columns.approver') },
    {
      accessorKey: 'processedAt',
      header: t('page.customers.approvals.columns.processed_at'),
      cell: ({ row }) => new Date(row.original.processedAt).toLocaleString(),
    },
    {
      accessorKey: 'reason',
      header: t('page.customers.approvals.columns.reason'),
      cell: ({ row }) => translateCustomerApprovalReason(t, row.original.reason),
    },
    {
      accessorKey: 'result',
      header: t('page.customers.approvals.columns.result'),
      cell: ({ row }) => getCustomerApprovalStatusLabel(t, row.original.result.value),
    },
  ];
}
