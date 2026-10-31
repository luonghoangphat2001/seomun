import { useTranslation } from 'react-i18next';

import type { AppSelectOption } from '@/components/shared/app-select';
import { AppLabel } from '@/components/shared/app-label';
import { AppSelect } from '@/components/shared/app-select';

import type { CustomerApprovalRequestType } from '../../enums';
import type { CustomerApprovalStatusFilter } from '../api/customer-approvals.request';

type CustomerApprovalToolbarProps = {
  requestType?: CustomerApprovalRequestType;
  requestTypeOptions: AppSelectOption<CustomerApprovalRequestType>[];
  onRequestTypeChange: (value?: CustomerApprovalRequestType) => void;
  approvalStatus?: CustomerApprovalStatusFilter;
  approvalStatusOptions?: AppSelectOption<CustomerApprovalStatusFilter>[];
  onApprovalStatusChange?: (value?: CustomerApprovalStatusFilter) => void;
};

export function CustomerApprovalToolbar({
  requestType,
  requestTypeOptions,
  onRequestTypeChange,
  approvalStatus,
  approvalStatusOptions,
  onApprovalStatusChange,
}: CustomerApprovalToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className='flex flex-wrap gap-4'>
      <div className='w-full max-w-sm space-y-2'>
        <AppLabel label={t('page.customers.approvals.filters.request_type')} />
        <AppSelect
          value={requestType}
          onValueChange={onRequestTypeChange}
          options={requestTypeOptions}
          placeholder={t('page.customers.approvals.filters.all_request_types')}
          clearable
        />
      </div>

      {approvalStatusOptions && onApprovalStatusChange ? (
        <div className='w-full max-w-sm space-y-2'>
          <AppLabel label={t('page.customers.approvals.filters.approval_status')} />
          <AppSelect
            value={approvalStatus}
            onValueChange={onApprovalStatusChange}
            options={approvalStatusOptions}
            placeholder={t('page.customers.approvals.filters.all_approval_statuses')}
            clearable
          />
        </div>
      ) : null}
    </div>
  );
}
