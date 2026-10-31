import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { AppSelect } from '@/components/shared/app-select';
import { PermissionUsageStatus, usePermissionsQuery } from '@/features/permissions';

import { ADMINISTRATOR_STATUS_OPTIONS } from '../constants';
import { AdministratorBulkAction } from '../enums';

interface AdministratorBulkActionDialogProps {
  action: AdministratorBulkAction | null;
  selectedCount: number;
  value?: string;
  isPending: boolean;
  onValueChange: (value?: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function AdministratorBulkActionDialog({
  action,
  selectedCount,
  value,
  isPending,
  onValueChange,
  onClose,
  onConfirm,
}: AdministratorBulkActionDialogProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const isDelete = action === AdministratorBulkAction.DELETE;
  const { data: permissionsResponse } = usePermissionsQuery(
    { usage_status: PermissionUsageStatus.ACTIVE, page: 1, per_page: 100 },
    { enabled: action === AdministratorBulkAction.PERMISSION },
  );

  const options = useMemo(() => {
    if (action === AdministratorBulkAction.STATUS) {
      return ADMINISTRATOR_STATUS_OPTIONS.map((option) => ({
        value: option.value as string,
        label: t(`administrators.enums.statuses.${option.value}`, String(option.label ?? '')),
      }));
    }

    return (permissionsResponse?.data?.permissions ?? []).map((permission) => ({ value: String(permission.id), label: permission.name }));
  }, [action, permissionsResponse, t]);

  return (
    <AppDialogModal
      isOpen={action !== null}
      setIsOpen={(open) => {
        if (!open && !isPending) {
          onClose();
        }
      }}
      title={action ? t(`administrators.bulk.${action}.title`) : ''}
      onOk={onConfirm}
      okText={isDelete ? tCommon('action.delete') : tCommon('action.change')}
      cancelText={tCommon('action.cancel')}
      confirmLoading={isPending}
      okDisabled={!isDelete && !value}
      width={480}
    >
      <div className='space-y-3 py-3'>
        <p className='text-muted-foreground text-sm'>
          {t(isDelete ? 'administrators.bulk.delete.message' : 'administrators.bulk.apply_message', { count: selectedCount })}
        </p>
        {action && !isDelete ? (
          <AppSelect
            value={value}
            onValueChange={onValueChange}
            options={options}
            placeholder={t(`administrators.bulk.${action}.placeholder`)}
            size='md'
          />
        ) : null}
      </div>
    </AppDialogModal>
  );
}
