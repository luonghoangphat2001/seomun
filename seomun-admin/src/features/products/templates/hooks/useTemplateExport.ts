import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { downloadFileFromUrl } from '@/utils/download-file';

import { checkTemplateExportProgressStatusAPI, exportTemplatesExcelAPI } from '../api';
import type { TemplateExportExcelREQ, TemplateListREQ } from '../api';
import { TemplateExportExcelType } from '../enums';

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 120_000;
const TOAST_ID = 'template-export';

type UseTemplateExportOptions = {
  filters: Omit<TemplateListREQ, 'page' | 'per_page'>;
  page: number;
  perPage: number;
  selectedIds?: number[];
};

export function useTemplateExport({ filters, page, perPage, selectedIds }: UseTemplateExportOptions) {
  const { t } = useTranslation('page');
  const errorMessage = t('products.templates.list.export_dialog.error', 'Failed to export templates.');

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
    (type: TemplateExportExcelType): TemplateExportExcelREQ => {
      const base: TemplateExportExcelREQ = {
        export_type: type,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
        template_name: filters.template_name,
        specification: filters.specification,
        status: filters.status,
        registrant: filters.registrant,
        last_modified_from: filters.last_modified_from,
        last_modified_to: filters.last_modified_to,
      };

      if (type === TemplateExportExcelType.CURRENT_PAGE) {
        return { ...base, current_page: page, per_page: perPage };
      }

      if (type === TemplateExportExcelType.SELECTED) {
        return { ...base, selected_ids: selectedIds ?? [] };
      }

      return base;
    },
    [filters, page, perPage, selectedIds],
  );

  const startExport = useCallback(
    async (type: TemplateExportExcelType): Promise<void> => {
      setIsExporting(true);
      toast.loading(t('products.templates.list.export_dialog.processing', 'Preparing export...'), { id: TOAST_ID });

      try {
        const exportRes = await exportTemplatesExcelAPI(buildPayload(type));
        const historyId = exportRes.data.history.id;

        await new Promise<void>((resolve, reject) => {
          timeoutRef.current = setTimeout(() => {
            stopPolling();
            setIsExporting(false);
            reject(new Error(errorMessage));
          }, POLL_TIMEOUT_MS);

          pollingRef.current = setInterval(async () => {
            try {
              const statusRes = await checkTemplateExportProgressStatusAPI(historyId);
              const { status, file_path } = statusRes.data.history;

              if (status === 'completed') {
                stopPolling();
                setIsExporting(false);
                if (!file_path) {
                  reject(new Error(errorMessage));
                  return;
                }
                try {
                  const timestamp = new Date().toISOString().replace('T', '_').replace(/:/g, '-').slice(0, 19);
                  await downloadFileFromUrl(file_path, `template-management_${timestamp}.xlsx`);
                  toast.success(t('products.templates.list.export_dialog.success', 'Templates exported successfully.'), { id: TOAST_ID });
                  resolve();
                } catch (downloadErr) {
                  reject(downloadErr);
                }
              } else if (status === 'failed') {
                stopPolling();
                setIsExporting(false);
                reject(new Error(errorMessage));
              }
            } catch (err) {
              stopPolling();
              setIsExporting(false);
              reject(err);
            }
          }, POLL_INTERVAL_MS);
        });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : errorMessage, { id: TOAST_ID });
        setIsExporting(false);
        throw err;
      }
    },
    [buildPayload, errorMessage, stopPolling, t],
  );

  return { isExporting, startExport };
}
