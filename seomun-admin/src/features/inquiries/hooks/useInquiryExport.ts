import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { downloadFileFromUrl } from '@/utils/download-file';

import { checkInquiryExportStatus, exportInquiries } from '../api';
import type { ExportInquiryREQ, InquiryFilterREQ } from '../api';
import { InquiryExportType } from '../enums';

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 120_000;
const TOAST_ID = 'inquiry-export';

type UseInquiryExportOptions = {
  filters: InquiryFilterREQ;
  selectedIds?: string[];
};

export function useInquiryExport({ filters, selectedIds }: UseInquiryExportOptions) {
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
    async (exportType: ExportInquiryREQ['export_type']): Promise<void> => {
      setIsExporting(true);
      toast.loading(t('page.inquiries.messages.export_processing'), { id: TOAST_ID });

      const { page, per_page, ...filterFields } = filters;

      const payload: ExportInquiryREQ = {
        ...filterFields,
        export_type: exportType,
        ...(exportType === InquiryExportType.CURRENT_PAGE ? { current_page: page, per_page } : {}),
        ...(exportType === InquiryExportType.SELECTED ? { selected_ids: selectedIds ?? [] } : {}),
      };

      try {
        const exportRes = await exportInquiries(payload);
        const historyId = exportRes.data.history.id;

        await new Promise<void>((resolve, reject) => {
          timeoutRef.current = setTimeout(() => {
            stopPolling();
            setIsExporting(false);
            reject(new Error(t('page.inquiries.messages.export_error')));
          }, POLL_TIMEOUT_MS);

          pollingRef.current = setInterval(async () => {
            try {
              const statusRes = await checkInquiryExportStatus(historyId);
              const { status, file_path } = statusRes.data.history;

              if (status === 'completed') {
                stopPolling();
                setIsExporting(false);
                if (!file_path) {
                  reject(new Error(t('page.inquiries.messages.export_error')));
                  return;
                }
                try {
                  const prefix = t('page.inquiries.export_dialog.file_name_prefix');
                  await downloadFileFromUrl(file_path, `${prefix}_${Date.now()}.xlsx`);
                  toast.success(t('page.inquiries.messages.export_success'), { id: TOAST_ID });
                  resolve();
                } catch (downloadErr) {
                  reject(downloadErr);
                }
              } else if (status === 'failed') {
                stopPolling();
                setIsExporting(false);
                reject(new Error(t('page.inquiries.messages.export_error')));
              }
            } catch (err) {
              stopPolling();
              setIsExporting(false);
              reject(err);
            }
          }, POLL_INTERVAL_MS);
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t('page.inquiries.messages.export_error'), { id: TOAST_ID });
        setIsExporting(false);
        throw err;
      }
    },
    [filters, selectedIds, stopPolling, t],
  );

  return { isExporting, startExport };
}
