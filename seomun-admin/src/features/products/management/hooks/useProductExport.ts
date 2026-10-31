import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { downloadFileFromUrl } from '@/utils/download-file';
import { formatDateOnly } from '@/utils/format-date';

import { checkProductExportStatus, exportProductsExcel } from '../api';
import type { ExportProductListREQ, ProductListREQ } from '../api';
import { ProductExportType } from '../enums';

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 120_000;
const TOAST_ID = 'product-export';

type UseProductExportOptions = {
  filters: ProductListREQ;
  selectedIds?: string[];
};

export function useProductExport({ filters, selectedIds }: UseProductExportOptions) {
  const { t } = useTranslation();

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
    async (exportType: ProductExportType): Promise<void> => {
      setIsExporting(true);
      toast.loading(t('page.products.management.messages.export_processing'), { id: TOAST_ID });

      const { page, per_page, ...filterFields } = filters;

      const payload: ExportProductListREQ = {
        ...filterFields,
        export_type: exportType,
        ...(exportType === ProductExportType.CURRENT_PAGE ? { current_page: page, per_page } : {}),
        ...(exportType === ProductExportType.SELECTED ? { selected_ids: selectedIds ?? [] } : {}),
      };

      try {
        const exportRes = await exportProductsExcel(payload);
        const historyId = exportRes.data.history.id;

        await new Promise<void>((resolve, reject) => {
          timeoutRef.current = setTimeout(() => {
            stopPolling();
            setIsExporting(false);
            reject(new Error(t('page.products.management.messages.export_error')));
          }, POLL_TIMEOUT_MS);

          pollingRef.current = setInterval(async () => {
            try {
              const statusRes = await checkProductExportStatus(historyId);
              const { status, file_path } = statusRes.data.history;

              if (status === 'completed') {
                stopPolling();
                setIsExporting(false);
                if (!file_path) {
                  reject(new Error(t('page.products.management.messages.export_error')));
                  return;
                }
                try {
                  const prefix = t('page.products.management.export_dialog.file_name_prefix');
                  await downloadFileFromUrl(file_path, `${prefix}_${formatDateOnly(new Date())}.xlsx`);
                  toast.success(t('page.products.management.messages.export_success'), { id: TOAST_ID });
                  resolve();
                } catch (downloadErr) {
                  reject(downloadErr);
                }
              } else if (status === 'failed') {
                stopPolling();
                setIsExporting(false);
                reject(new Error(t('page.products.management.messages.export_error')));
              }
            } catch (err) {
              stopPolling();
              setIsExporting(false);
              reject(err);
            }
          }, POLL_INTERVAL_MS);
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t('page.products.management.messages.export_error'), { id: TOAST_ID });
        setIsExporting(false);
        throw err;
      }
    },
    [filters, selectedIds, stopPolling, t],
  );

  return { isExporting, startExport };
}
