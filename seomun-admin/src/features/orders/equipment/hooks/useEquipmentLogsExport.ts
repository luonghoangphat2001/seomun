import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { formatDateOnly } from '@/utils/format-date';

import { checkEquipmentLogsExportStatus, downloadEquipmentLogsExcel, exportEquipmentLogsExcel } from '../api/equipment.service';

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 120_000;
const TOAST_ID = 'equipment-logs-export';

export function useEquipmentLogsExport(equipmentId: string) {
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

  const startExport = useCallback(async (): Promise<void> => {
    setIsExporting(true);
    toast.loading(t('orders.equipment.detail.log.export.processing', 'Exporting logs...'), { id: TOAST_ID });

    try {
      const history = await exportEquipmentLogsExcel(equipmentId);
      const historyId = history.id;

      await new Promise<void>((resolve, reject) => {
        timeoutRef.current = setTimeout(() => {
          stopPolling();
          setIsExporting(false);
          reject(new Error(t('orders.equipment.detail.log.export.error', 'Failed to export logs.')));
        }, POLL_TIMEOUT_MS);

        pollingRef.current = setInterval(async () => {
          try {
            const progress = await checkEquipmentLogsExportStatus(historyId);
            const status = progress.status.toLowerCase();

            if (status === 'completed') {
              stopPolling();
              const blob = await downloadEquipmentLogsExcel(historyId);
              const prefix = t('orders.equipment.detail.log.export.file_name_prefix');
              const fileName = `${prefix}_${formatDateOnly(new Date())}.xlsx`;
              const objectUrl = URL.createObjectURL(blob);
              const anchor = document.createElement('a');
              anchor.href = objectUrl;
              anchor.download = fileName;
              document.body.appendChild(anchor);
              anchor.click();
              anchor.remove();
              URL.revokeObjectURL(objectUrl);
              setIsExporting(false);
              toast.success(t('orders.equipment.detail.log.export.success', 'Logs exported.'), { id: TOAST_ID });
              resolve();
            } else if (status === 'failed') {
              stopPolling();
              setIsExporting(false);
              reject(new Error(t('orders.equipment.detail.log.export.error', 'Failed to export logs.')));
            }
          } catch (err) {
            stopPolling();
            setIsExporting(false);
            reject(err);
          }
        }, POLL_INTERVAL_MS);
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('orders.equipment.detail.log.export.error', 'Failed to export logs.'), { id: TOAST_ID });
      setIsExporting(false);
      throw err;
    }
  }, [equipmentId, stopPolling, t]);

  return { isExporting, startExport };
}
