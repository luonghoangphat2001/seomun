import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { downloadFileFromUrl } from '@/utils/download-file';

import { checkDirectShippingExportProgressStatusAPI, exportDirectShippingsExcelAPI } from '../api/direct-shipping.api';
import type { DirectShippingListREQ } from '../api/direct-shipping.request';
import { DirectShippingExportExcelType } from '../enums';

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 120_000;
const TOAST_ID = 'direct-shipping-export';

type UseDirectShippingExportOptions = {
  filters: Omit<DirectShippingListREQ, 'page' | 'per_page'>;
  page: number;
  perPage: number;
  totalCount: number;
  selectedIds?: number[];
};

export function useDirectShippingExport({ filters, page, perPage, totalCount, selectedIds }: UseDirectShippingExportOptions) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

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

  const startExport = useCallback(
    async (type: DirectShippingExportExcelType): Promise<void> => {
      setIsExporting(true);
      toast.loading(tCommon('export.processing'), { id: TOAST_ID });

      const count =
        type === DirectShippingExportExcelType.ALL
          ? totalCount
          : type === DirectShippingExportExcelType.CURRENT_PAGE
            ? perPage
            : (selectedIds?.length ?? 0);

      try {
        const exportRes = await exportDirectShippingsExcelAPI({
          export_type: type,
          search_term: filters.search_term,
          user_id: filters.user_id,
          status: filters.status,
          date_from: filters.date_from,
          date_to: filters.date_to,
          ...(type === DirectShippingExportExcelType.CURRENT_PAGE && { current_page: page, per_page: perPage }),
          ...(type === DirectShippingExportExcelType.SELECTED && { selected_ids: selectedIds ?? [] }),
        });

        const historyId = exportRes.data.history.id;

        await new Promise<void>((resolve, reject) => {
          timeoutRef.current = setTimeout(() => {
            stopPolling();
            setIsExporting(false);
            reject(new Error(tCommon('export.error')));
          }, POLL_TIMEOUT_MS);

          pollingRef.current = setInterval(async () => {
            try {
              const statusRes = await checkDirectShippingExportProgressStatusAPI(historyId);
              const { status, file_path } = statusRes.data.history;

              if (status === 'completed') {
                stopPolling();
                setIsExporting(false);
                if (!file_path) {
                  reject(new Error(tCommon('export.error')));
                  return;
                }
                try {
                  const prefix = t('delivery.direct_shipping.export_dialog.file_name_prefix');
                  const timestamp = new Date().toISOString().replace('T', '_').replace(/:/g, '-').slice(0, 19);
                  await downloadFileFromUrl(file_path, `${prefix}_${timestamp}.xlsx`);
                  const successKey =
                    type === DirectShippingExportExcelType.ALL
                      ? 'export.success_all'
                      : type === DirectShippingExportExcelType.CURRENT_PAGE
                        ? 'export.success_current'
                        : 'export.success_selected';
                  toast.success(tCommon(successKey, { count }), { id: TOAST_ID });
                  resolve();
                } catch (downloadErr) {
                  reject(downloadErr);
                }
              } else if (status === 'failed') {
                stopPolling();
                setIsExporting(false);
                reject(new Error(tCommon('export.error')));
              }
            } catch (err) {
              stopPolling();
              setIsExporting(false);
              reject(err);
            }
          }, POLL_INTERVAL_MS);
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : tCommon('export.error'), { id: TOAST_ID });
        setIsExporting(false);
        throw err;
      }
    },
    [filters, page, perPage, selectedIds, stopPolling, t, tCommon, totalCount],
  );

  return { isExporting, startExport };
}
