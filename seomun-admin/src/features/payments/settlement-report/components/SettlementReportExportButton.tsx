import { useCallback, useEffect } from 'react';
import { CheckCircle2, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { downloadFileFromUrl } from '@/utils/download-file';

import type { ReportExportExcelREQ } from '../api';
import { useSettlementReportExport } from '../hooks/useSettlementReportExport';

type Props = {
  open: boolean;
  onClose: () => void;
  filters: Partial<ReportExportExcelREQ>;
};

export function SettlementReportExportDialog({ open, onClose, filters }: Props) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const { isExporting, result, startExport, reset } = useSettlementReportExport(filters);

  useEffect(() => {
    if (open) startExport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleDownload = useCallback(() => {
    if (result) void downloadFileFromUrl(result.fileUrl, result.fileName);
  }, [result]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent showCloseButton={false} className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>{tCommon('export.title')}</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col items-center gap-3 py-6 text-center'>
          {isExporting ? (
            <>
              <div className='flex size-14 items-center justify-center rounded-full border-2 border-blue-200 bg-blue-50'>
                <Spinner className='text-primary size-6' />
              </div>
              <p className='text-sm font-medium'>{t('payments.settlement_report.export.processing', 'Preparing your file...')}</p>
              <p className='text-muted-foreground text-xs'>
                {t('payments.settlement_report.export.processing_hint', 'This may take a few moments.')}
              </p>
            </>
          ) : result ? (
            <>
              <CheckCircle2 className='size-12 text-green-500' />
              <p className='text-sm font-medium'>{t('payments.settlement_report.export.success', 'Export completed.')}</p>
              <p className='text-muted-foreground text-xs break-all'>{result.fileName}</p>
            </>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose}>
            {t('payments.settlement_report.export.close', 'Close')}
          </Button>
          {result && (
            <Button onClick={handleDownload} className='gap-2'>
              <Download className='size-4' />
              {t('payments.settlement_report.export.download', 'Download')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
