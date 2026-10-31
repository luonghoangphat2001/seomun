import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { downloadFileFromUrl } from '@/utils/download-file';

import { checkExportProgressStatusAPI, exportPaymentsExcelAPI } from '../api';
import type { PaymentExportExcelREQ, PaymentListREQ } from '../api';
import { PaymentExportExcelType } from '../enums';
import { useExportMessages } from './useExportMessages';

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 120_000;
const TOAST_ID = 'payment-export';

type UsePaymentExportOptions = {
  filters: Omit<PaymentListREQ, 'page' | 'per_page'>;
  page: number;
  perPage: number;
  totalCount: number;
  selectedIds?: string[];
};

export function usePaymentExport({ filters, page, perPage, totalCount, selectedIds }: UsePaymentExportOptions) {
  const { getSuccessMessage, messages } = useExportMessages();
  const { t } = useTranslation('page');

  const [isExporting, setIsExporting] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const buildPayload = useCallback(
    (type: PaymentExportExcelType): PaymentExportExcelREQ => {
      const base: PaymentExportExcelREQ = {
        export_type: type,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
        search_term: filters.search_term,
        order_date_from: filters.order_date_from,
        order_date_to: filters.order_date_to,
        status: filters.status,
        start_date: filters.start_date,
        end_date: filters.end_date,
      };

      if (type === PaymentExportExcelType.CURRENT_PAGE) {
        return { ...base, current_page: page, per_page: perPage };
      }

      if (type === PaymentExportExcelType.SELECTED) {
        return { ...base, selected_ids: selectedIds ?? [] };
      }

      return base;
    },
    [filters, page, perPage, selectedIds],
  );

  const startExport = useCallback(
    async (type: PaymentExportExcelType): Promise<void> => {
      setIsExporting(true);
      toast.loading(messages.processing, { id: TOAST_ID });

      const count =
        type === PaymentExportExcelType.ALL ? totalCount : type === PaymentExportExcelType.CURRENT_PAGE ? perPage : (selectedIds?.length ?? 0);

      try {
        const exportRes = await exportPaymentsExcelAPI(buildPayload(type));
        const historyId = exportRes.data.history.id;

        await new Promise<void>((resolve, reject) => {
          timeoutRef.current = setTimeout(() => {
            stopPolling();
            setIsExporting(false);
            reject(new Error(messages.error));
          }, POLL_TIMEOUT_MS);

          pollingRef.current = setInterval(async () => {
            try {
              const statusRes = await checkExportProgressStatusAPI(historyId, { historyId });
              const { status, file_path } = statusRes.data.history;

              if (status === 'completed') {
                stopPolling();
                setIsExporting(false);
                if (!file_path) {
                  reject(new Error(messages.error));
                  return;
                }
                try {
                  const prefix = t('payments.list.export_dialog.file_name_prefix');
                  const timestamp = new Date().toISOString().replace('T', '_').replace(/:/g, '-').slice(0, 19);
                  const customFileName = `${prefix}_${timestamp}.xlsx`;
                  await downloadFileFromUrl(file_path, customFileName);
                  toast.success(getSuccessMessage(type, count), { id: TOAST_ID });
                  resolve();
                } catch (downloadErr) {
                  reject(downloadErr);
                }
              } else if (status === 'failed') {
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
        toast.error(err instanceof Error ? err.message : messages.error, { id: TOAST_ID });
        setIsExporting(false);
        throw err;
      }
    },
    [buildPayload, getSuccessMessage, messages, stopPolling, totalCount, perPage, selectedIds, t],
  );

  return { isExporting, startExport };
}
