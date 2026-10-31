import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import type { ReportExportExcelREQ } from '../api';
import { useCheckSettlementReportExportStatusMutation, useExportSettlementReportMutation } from '../api';
import { useSettlementReportExportMessages } from './useSettlementReportExportMessages';

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 120_000;

export type SettlementExportResult = { fileName: string; fileUrl: string };

export function useSettlementReportExport({ start_date, end_date }: Partial<ReportExportExcelREQ>) {
  const messages = useSettlementReportExportMessages();
  const { t } = useTranslation('page');
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<SettlementExportResult | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { mutateAsync: exportExcel } = useExportSettlementReportMutation();
  const { mutateAsync: checkStatus } = useCheckSettlementReportExportStatusMutation();

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startExport = useCallback(async () => {
    setIsExporting(true);
    setResult(null);

    try {
      const exportRes = await exportExcel({ start_date, end_date });
      const historyId = exportRes.data.history.id;

      await new Promise<void>((resolve, reject) => {
        timeoutRef.current = setTimeout(() => {
          stopPolling();
          setIsExporting(false);
          reject(new Error(messages.error));
        }, POLL_TIMEOUT_MS);

        pollingRef.current = setInterval(async () => {
          try {
            const statusRes = await checkStatus(historyId);
            const { status, file_path } = statusRes.data.history;

            if (status.toLowerCase() === 'completed') {
              stopPolling();
              setIsExporting(false);
              if (!file_path) {
                reject(new Error(messages.error));
                return;
              }
              const prefix = t('payments.settlement_report.export.file_name_prefix');
              const timestamp = new Date().toISOString().replace('T', '_').replace(/:/g, '-').slice(0, 19);
              setResult({ fileName: `${prefix}_${timestamp}.xlsx`, fileUrl: file_path });
              resolve();
            } else if (status.toLowerCase() === 'failed') {
              stopPolling();
              setIsExporting(false);
              reject(new Error(messages.error));
            }
          } catch (err) {
            stopPolling();
            setIsExporting(false);
            reject(err);
          }
        }, POLL_INTERVAL_MS);
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : messages.error);
      setIsExporting(false);
    }
  }, [start_date, end_date, messages, stopPolling, exportExcel, checkStatus, t]);

  const reset = useCallback(() => {
    stopPolling();
    setResult(null);
    setIsExporting(false);
  }, [stopPolling]);

  return { isExporting, result, startExport, reset };
}
