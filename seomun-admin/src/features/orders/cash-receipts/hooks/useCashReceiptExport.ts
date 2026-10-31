import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { downloadFileFromUrl } from '@/utils/download-file';

import { checkCashReceiptExportStatus, exportCashReceiptsExcel } from '../api';
import type { CashReceiptListREQ } from '../api';

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 120_000;
const TOAST_ID = 'cash-receipt-export';

type UseCashReceiptExportOptions = {
  params: CashReceiptListREQ;
};

export function useCashReceiptExport({ params }: UseCashReceiptExportOptions) {
  // === Hooks ===
  const { t } = useTranslation('page');

  // === State ===
  const [isExporting, setIsExporting] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // === Functions ===
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

  const startExport = useCallback(async (): Promise<void> => {
    setIsExporting(true);
    toast.loading(t('orders.cash_receipts.messages.export_processing'), { id: TOAST_ID });

    try {
      const exportRes = await exportCashReceiptsExcel(params);
      const historyId = exportRes.data.history.id;

      await new Promise<void>((resolve, reject) => {
        timeoutRef.current = setTimeout(() => {
          stopPolling();
          setIsExporting(false);
          reject(new Error(t('orders.cash_receipts.messages.export_error')));
        }, POLL_TIMEOUT_MS);

        pollingRef.current = setInterval(async () => {
          try {
            const statusRes = await checkCashReceiptExportStatus(historyId);
            const { status, file_path } = statusRes.data.history;

            if (status === 'completed') {
              stopPolling();
              await downloadFileFromUrl(file_path, `현금영수증_${Date.now()}.xlsx`);
              setIsExporting(false);
              toast.success(t('orders.cash_receipts.messages.export_success'), { id: TOAST_ID });
              resolve();
            } else if (status === 'failed') {
              stopPolling();
              setIsExporting(false);
              reject(new Error(t('orders.cash_receipts.messages.export_error')));
            }
          } catch (err) {
            stopPolling();
            setIsExporting(false);
            reject(err);
          }
        }, POLL_INTERVAL_MS);
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('orders.cash_receipts.messages.export_error'), { id: TOAST_ID });
      setIsExporting(false);
      throw err;
    }
  }, [params, stopPolling, t]);

  return { isExporting, startExport };
}
