import { AlertCircle, CheckCircle2, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { downloadFileFromUrl } from '@/utils/download-file';

import { useExportHistoryQuery, type DashboardStatisticsExportHistory } from '../api';
import { ExportStatus } from '../enums';

type ExportResultDialogProps = {
  open: boolean;
  history: DashboardStatisticsExportHistory | null;
  onOpenChange: (open: boolean) => void;
};

export function ExportResultDialog({ open, history, onOpenChange }: ExportResultDialogProps) {
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: polled, isError } = useExportHistoryQuery(open ? history?.id : undefined);
  const current = polled ?? history;

  const isCompleted = current?.status === ExportStatus.COMPLETED;
  const isFailed = isError || current?.status === ExportStatus.FAILED;

  const handleDownload = useCallback(async () => {
    if (!current?.file_path || !current.file_name) return;

    setIsDownloading(true);
    try {
      await downloadFileFromUrl(current.file_path, current.file_name);
    } catch {
      toast.error(t('page.dashboard.statistics.export_not_ready'));
    } finally {
      setIsDownloading(false);
    }
  }, [current, t]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('common.export.title')}</DialogTitle>
        </DialogHeader>

        <div className='flex min-w-0 items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/60 p-4'>
          <FileSpreadsheet className='size-8 shrink-0 text-emerald-600' />

          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium' title={current?.file_name}>
              {current?.file_name}
            </p>

            <p className='text-muted-foreground mt-1 flex items-center gap-1.5 text-xs'>
              {isCompleted ? (
                <CheckCircle2 className='size-3.5 shrink-0 text-emerald-600' aria-hidden='true' />
              ) : isFailed ? (
                <AlertCircle className='text-destructive size-3.5 shrink-0' aria-hidden='true' />
              ) : (
                <Loader2 className='size-3.5 shrink-0 animate-spin' aria-hidden='true' />
              )}
              {isCompleted
                ? t('page.dashboard.statistics.export_status_completed')
                : isFailed
                  ? t('page.dashboard.statistics.export_status_failed')
                  : t('page.dashboard.statistics.export_status_processing')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <AppButton type='button' variant='outline' onClick={() => onOpenChange(false)}>
            {t('common.action.close')}
          </AppButton>
          {/* No spinner — the click just needs to stop repeating until the current download settles. */}
          <AppButton type='button' disabled={!isCompleted || isDownloading} onClick={() => void handleDownload()}>
            {t('page.dashboard.statistics.export_download')}
          </AppButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
