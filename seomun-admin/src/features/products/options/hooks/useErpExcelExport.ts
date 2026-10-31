import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

import { downloadFileFromUrl } from '@/utils/download-file';

import type { ErpExportRESP } from '../api/option.response';
import { ErpExportType } from '../enums';
import { useExportMessages } from './useExportMessages';

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 120_000;

type ErpExportPayload<TFilters> = {
  export_type: ErpExportType;
  current_page?: number;
  per_page?: number;
  selected_ids?: number[];
  group_code?: string;
  filters: TFilters;
};

type UseErpExcelExportOptions<TFilters extends object> = {
  filters: TFilters;
  page: number;
  perPage: number;
  totalCount: number;
  selectedIds?: number[];
  groupCode?: string;
  filePrefix: string;
  exportFn: (params: ErpExportPayload<TFilters>) => Promise<ErpExportRESP>;
  checkStatusFn: (historyId: number) => Promise<ErpExportRESP>;
};

export function useErpExcelExport<TFilters extends object>({
  filters,
  page,
  perPage,
  totalCount,
  selectedIds,
  groupCode,
  filePrefix,
  exportFn,
  checkStatusFn,
}: UseErpExcelExportOptions<TFilters>) {
  const { getSuccessMessage, messages } = useExportMessages();
  const [isExporting, setIsExporting] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastId = `erp-export-${filePrefix}`;

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
    (type: ErpExportType): ErpExportPayload<TFilters> => {
      const base: ErpExportPayload<TFilters> = {
        export_type: type,
        filters,
        ...(groupCode ? { group_code: groupCode } : {}),
      };

      if (type === ErpExportType.CURRENT_PAGE) {
        return { ...base, current_page: page, per_page: perPage };
      }

      if (type === ErpExportType.SELECTED) {
        return { ...base, selected_ids: selectedIds ?? [] };
      }

      return base;
    },
    [filters, groupCode, page, perPage, selectedIds],
  );

  const startExport = useCallback(
    async (type: ErpExportType): Promise<void> => {
      setIsExporting(true);
      toast.loading(messages.processing, { id: toastId });

      const count = type === ErpExportType.ALL ? totalCount : type === ErpExportType.CURRENT_PAGE ? perPage : (selectedIds?.length ?? 0);

      try {
        const exportRes = await exportFn(buildPayload(type));
        const historyId = exportRes.data.history.id;

        await new Promise<void>((resolve, reject) => {
          timeoutRef.current = setTimeout(() => {
            stopPolling();
            setIsExporting(false);
            reject(new Error(messages.error));
          }, POLL_TIMEOUT_MS);

          pollingRef.current = setInterval(async () => {
            try {
              const statusRes = await checkStatusFn(historyId);
              const { status, file_path } = statusRes.data.history;

              if (status === 'completed') {
                stopPolling();
                setIsExporting(false);
                if (!file_path) {
                  reject(new Error(messages.error));
                  return;
                }
                try {
                  const timestamp = new Date().toISOString().replace('T', '_').replace(/:/g, '-').slice(0, 19);
                  await downloadFileFromUrl(file_path, `${filePrefix}_${timestamp}.xlsx`);
                  toast.success(getSuccessMessage(type, count), { id: toastId });
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
        toast.error(err instanceof Error ? err.message : messages.error, { id: toastId });
        setIsExporting(false);
        throw err;
      }
    },
    [buildPayload, checkStatusFn, exportFn, filePrefix, getSuccessMessage, messages, perPage, selectedIds, stopPolling, toastId, totalCount],
  );

  return { isExporting, startExport };
}
