import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AppDialogModal } from '@/components/shared/app-dialog-modal';

import type { PermissionRESP } from '../api/permission.response';

type PermissionDeleteDialogProps = {
  permission: PermissionRESP | null;
  open: boolean;
  isPending?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
};

export function PermissionDeleteDialog({ permission, open, isPending = false, onConfirm, onOpenChange }: PermissionDeleteDialogProps) {
  const { t } = useTranslation();

  if (!permission) return null;

  return (
    <AppDialogModal
      isOpen={open}
      setIsOpen={onOpenChange}
      title={t('page.permissions.list.dialog.delete_title')}
      onOk={onConfirm}
      okText={t('common.action.delete')}
      cancelText={t('common.action.cancel')}
      confirmLoading={isPending}
      width={480}
    >
      <div className='space-y-3 py-2'>
        <div className='text-destructive flex items-center gap-2 text-sm font-medium'>
          <AlertTriangle className='size-4' />
          {t('page.permissions.list.dialog.delete_warning')}
        </div>
        <p className='text-muted-foreground text-sm'>{t('page.permissions.list.dialog.delete_confirm', { name: permission.name })}</p>
      </div>
    </AppDialogModal>
  );
}
