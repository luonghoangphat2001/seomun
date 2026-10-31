import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { downloadFileFromUrl } from '@/utils/download-file';

import { checkAccessLogExportStatusAPI, exportAccessLogsExcelAPI } from '../api';
import type { AccessLogExportREQ } from '../api';

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 120_000;
const TOAST_ID = 'access-log-export';

export function useAccessLogExport() {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const [isExporting, setIsExporting] = useState(false);

  /** Resolves true once the file has been downloaded. */
  const startExport = useCallback(
    async (payload: AccessLogExportREQ, successMessage: string) => {
      setIsExporting(true);
      toast.loading(tCommon('export.processing'), { id: TOAST_ID });

      try {
        const historyId = (await exportAccessLogsExcelAPI(payload)).data.history.id;
        const deadline = Date.now() + POLL_TIMEOUT_MS;

        while (Date.now() < deadline) {
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
          const { status, file_path } = (await checkAccessLogExportStatusAPI(historyId)).data.history;

          if (status === 'completed') {
            await downloadFileFromUrl(file_path, `${t('system_logs.access.title')}_${Date.now()}.xlsx`);
            toast.success(successMessage, { id: TOAST_ID });
            return true;
          }
          if (status === 'failed') break;
        }

        toast.error(tCommon('export.error'), { id: TOAST_ID });
      } catch {
        toast.error(tCommon('export.error'), { id: TOAST_ID });
      } finally {
        setIsExporting(false);
      }
      return false;
    },
    [t, tCommon],
  );

  return { isExporting, startExport };
}
