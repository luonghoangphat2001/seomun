import { getRouteApi, Link } from '@tanstack/react-router';
import { ArrowLeft, Download, Loader2, Pencil, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppDialogModal } from '@/components/shared/app-dialog-modal';
import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { parseDateOnly } from '@/utils/format-date';

import {
  useCreateEquipmentLogMutation,
  useDeleteEquipmentLogMutation,
  useEquipmentDetailQuery,
  useEquipmentLogsQuery,
  useUpdateEquipmentLogMutation,
  useUpdateEquipmentMutation,
} from '../api/equipment.query';
import type { EquipmentLogRESP } from '../api/equipment.response';
import { EquipmentDetailSummary } from '../components/EquipmentDetailSummary';
import { EquipmentForm } from '../components/EquipmentForm';
import { EquipmentLogFormDialog } from '../components/EquipmentLogFormDialog';
import { EquipmentLogTable } from '../components/EquipmentLogTable';
import { useEquipmentLogsExport } from '../hooks/useEquipmentLogsExport';
import type { EquipmentFormValues } from '../schemas/equipment-form.schema';
import type { EquipmentLogFormValues } from '../schemas/equipment-log-form.schema';

const routeApi = getRouteApi('/orders/equipment/$equipmentId');

export function EquipmentDetailPage() {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { equipmentId } = routeApi.useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const detailQuery = useEquipmentDetailQuery(equipmentId);
  const logsQuery = useEquipmentLogsQuery(equipmentId);

  const equipment = detailQuery.data;
  const formDefaults = useMemo<EquipmentFormValues | undefined>(
    () =>
      equipment
        ? {
            company_name: equipment.company_name,
            name: equipment.name,
            machine_type: equipment.machine_type ?? undefined,
            maintenance_company: equipment.maintenance_company ?? '',
            manager_name: equipment.manager_name ?? '',
            manager_phone: equipment.manager_phone ?? '',
            introduced_at: parseDateOnly(equipment.introduced_at),
            work_process: equipment.work_process,
            status: equipment.status,
            notes: equipment.notes ?? '',
            image: equipment.image ?? null,
          }
        : undefined,
    [equipment],
  );

  const updateMutation = useUpdateEquipmentMutation(equipmentId, {
    onSuccess: () => {
      toast.success(t('orders.equipment.form.update_success', 'Equipment updated.'));
      setIsEditing(false);
    },
    onError: () => toast.error(t('orders.equipment.form.update_error', 'Failed to update equipment.')),
  });

  const handleUpdate = (values: EquipmentFormValues) => updateMutation.mutate(values);

  const [editLogTarget, setEditLogTarget] = useState<EquipmentLogRESP | null>(null);

  const closeLogDialog = () => {
    setIsLogDialogOpen(false);
    setEditLogTarget(null);
  };

  const createLogMutation = useCreateEquipmentLogMutation(equipmentId, {
    onSuccess: () => {
      toast.success(t('orders.equipment.detail.log.form.success', 'Memo added.'));
      closeLogDialog();
    },
    onError: () => toast.error(t('orders.equipment.detail.log.form.error', 'Failed to add memo.')),
  });

  const updateLogMutation = useUpdateEquipmentLogMutation(equipmentId, {
    onSuccess: () => {
      toast.success(t('orders.equipment.detail.log.form.update_success', 'Memo updated.'));
      closeLogDialog();
    },
    onError: () => toast.error(t('orders.equipment.detail.log.form.update_error', 'Failed to update memo.')),
  });

  const handleSubmitLog = (values: EquipmentLogFormValues) =>
    editLogTarget ? updateLogMutation.mutate({ logId: editLogTarget.id, values }) : createLogMutation.mutate(values);

  const handleEditLog = (log: EquipmentLogRESP) => {
    setEditLogTarget(log);
    setIsLogDialogOpen(true);
  };

  const [deleteLogTarget, setDeleteLogTarget] = useState<EquipmentLogRESP | null>(null);
  const deleteLogMutation = useDeleteEquipmentLogMutation(equipmentId, {
    onSuccess: () => {
      toast.success(t('orders.equipment.detail.log.delete.success', 'Memo deleted.'));
      setDeleteLogTarget(null);
    },
    onError: () => toast.error(t('orders.equipment.detail.log.delete.error', 'Failed to delete memo.')),
  });

  const { isExporting, startExport } = useEquipmentLogsExport(equipmentId);

  return (
    <PageContainer>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold'>{t('orders.equipment.detail.title', 'Equipment Detail')}</h1>
          {/* <p className='text-muted-foreground mt-0.5 text-sm'>
            {t('orders.equipment.detail.description', 'Review equipment information and maintenance history in one page.')}
          </p> */}
        </div>

        <div className='flex items-center gap-2'>
          <Button asChild variant='outline' size='sm' className='gap-1.5'>
            <Link to='/orders/equipment'>
              <ArrowLeft className='size-4' />
              {t('orders.equipment.detail.back_to_list', 'Back to List')}
            </Link>
          </Button>
          {equipment && !isEditing ? (
            <Button variant='outline' size='sm' className='gap-1.5' onClick={() => setIsEditing(true)}>
              <Pencil className='size-4' />
              {t('orders.equipment.form.edit', 'Edit')}
            </Button>
          ) : null}
          <Button variant='outline' size='sm' className='gap-1.5' onClick={() => void startExport()} disabled={isExporting}>
            {isExporting ? <Loader2 className='size-4 animate-spin' /> : <Download className='size-4' />}
            {tCommon('export.button')}
          </Button>
        </div>
      </div>

      <Separator />

      {detailQuery.isLoading ? (
        <div className='text-muted-foreground text-sm'>{t('orders.equipment.detail.loading', 'Loading equipment detail...')}</div>
      ) : !equipment ? (
        <div className='text-muted-foreground text-sm'>{t('orders.equipment.detail.not_found', 'Equipment not found.')}</div>
      ) : (
        <div className='space-y-6'>
          {isEditing ? (
            <section className='rounded-xl border p-5'>
              <EquipmentForm
                mode='edit'
                defaultValues={formDefaults}
                isPending={updateMutation.isPending}
                onCancel={() => setIsEditing(false)}
                onSubmit={handleUpdate}
              />
            </section>
          ) : (
            <EquipmentDetailSummary equipment={equipment} />
          )}

          <section className='space-y-4 rounded-xl border p-5'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <h2 className='text-base font-semibold'>{t('orders.equipment.detail.log.title', 'Equipment Log')}</h2>
                <p className='text-muted-foreground text-sm'>
                  {t('orders.equipment.detail.log.description', 'Maintenance memos recorded for this equipment.')}
                </p>
              </div>

              <Button
                variant='outline'
                size='sm'
                className='gap-1.5'
                onClick={() => {
                  setEditLogTarget(null);
                  setIsLogDialogOpen(true);
                }}
              >
                <Plus className='size-4' />
                {t('orders.equipment.detail.log.add_memo', 'Add Memo')}
              </Button>
            </div>
            <EquipmentLogTable logs={logsQuery.data ?? []} isLoading={logsQuery.isLoading} onEdit={handleEditLog} onDelete={setDeleteLogTarget} />
          </section>

          <EquipmentLogFormDialog
            open={isLogDialogOpen}
            onOpenChange={(open) => (open ? setIsLogDialogOpen(true) : closeLogDialog())}
            isPending={createLogMutation.isPending || updateLogMutation.isPending}
            onSubmit={handleSubmitLog}
            log={editLogTarget}
          />

          <AppDialogModal
            isOpen={deleteLogTarget !== null}
            setIsOpen={(open) => !open && setDeleteLogTarget(null)}
            title={t('orders.equipment.detail.log.delete.title', 'Delete Memo')}
            onOk={() => deleteLogTarget && deleteLogMutation.mutate(deleteLogTarget.id)}
            okText={t('orders.equipment.detail.log.delete.confirm', 'Delete')}
            cancelText={t('orders.equipment.detail.log.delete.cancel', 'Cancel')}
            confirmLoading={deleteLogMutation.isPending}
            width={480}
          >
            <p className='text-muted-foreground py-3 text-sm'>
              {t('orders.equipment.detail.log.delete.description', 'Are you sure you want to delete this memo? This cannot be undone.')}
            </p>
          </AppDialogModal>
        </div>
      )}
    </PageContainer>
  );
}
