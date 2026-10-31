import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { downloadFileFromUrl } from '@/utils/download-file';

import { checkDeliveryTrackingExportStatusAPI, exportDeliveryTrackingAPI } from '../api/tracking.api';
import type { DeliveryTrackingExportREQ, DeliveryTrackingListREQ } from '../api/tracking.request';
import { DeliveryTrackingExportExcelType } from '../../enums';

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 120_000;
const TOAST_ID = 'tracking-export';

type UseDeliveryTrackingExportOptions = {
  filters: Omit<DeliveryTrackingListREQ, 'page' | 'per_page'>;
  page: number;
  perPage: number;
  totalCount: number;
  selectedIds?: number[];
};

export function useDeliveryTrackingExport({ filters, page, perPage, totalCount, selectedIds }: UseDeliveryTrackingExportOptions) {
  const { t } = useTranslation();
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

  const buildPayload = useCallback(
    (type: DeliveryTrackingExportExcelType): DeliveryTrackingExportREQ => {
      const base: DeliveryTrackingExportREQ = {
        export_type: type,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
        search_term: filters.search_term,
        invoice_number: filters.invoice_number,
        order_number: filters.order_number,
        customer_name: filters.customer_name,
        product_name: filters.product_name,
        delivery_status: filters.delivery_status,
        waybill_registration_date_from: filters.waybill_registration_date_from,
        waybill_registration_date_to: filters.waybill_registration_date_to,
      };

      if (type === DeliveryTrackingExportExcelType.CURRENT_PAGE) {
        return { ...base, current_page: page, per_page: perPage };
      }

      if (type === DeliveryTrackingExportExcelType.SELECTED) {
        return { ...base, selected_ids: selectedIds ?? [] };
      }

      return base;
    },
    [filters, page, perPage, selectedIds],
  );

  const startExport = useCallback(
    async (type: DeliveryTrackingExportExcelType): Promise<void> => {
      setIsExporting(true);
      toast.loading(tCommon('export.processing'), { id: TOAST_ID });

      const count =
        type === DeliveryTrackingExportExcelType.ALL
          ? totalCount
          : type === DeliveryTrackingExportExcelType.CURRENT_PAGE
            ? perPage
            : (selectedIds?.length ?? 0);

      const successKeys = {
        [DeliveryTrackingExportExcelType.ALL]: 'export.success_all',
        [DeliveryTrackingExportExcelType.CURRENT_PAGE]: 'export.success_current',
        [DeliveryTrackingExportExcelType.SELECTED]: 'export.success_selected',
      } as const;

      try {
        const exportRes = await exportDeliveryTrackingAPI(buildPayload(type));
        const historyId = exportRes.data.history.id;

        await new Promise<void>((resolve, reject) => {
          timeoutRef.current = setTimeout(() => {
            stopPolling();
            setIsExporting(false);
            reject(new Error(tCommon('export.error')));
          }, POLL_TIMEOUT_MS);

          pollingRef.current = setInterval(async () => {
            try {
              const statusRes = await checkDeliveryTrackingExportStatusAPI(historyId);
              const { status, file_path } = statusRes.data.history;

              if (status === 'completed') {
                stopPolling();
                setIsExporting(false);
                if (!file_path) {
                  reject(new Error(tCommon('export.error')));
                  return;
                }
                try {
                  const prefix = t('page.delivery.tracking.export_dialog.file_name_prefix');
                  const timestamp = new Date().toISOString().replace('T', '_').replace(/:/g, '-').slice(0, 19);
                  const customFileName = `${prefix}_${timestamp}.xlsx`;
                  await downloadFileFromUrl(file_path, customFileName);
                  toast.success(tCommon(successKeys[type], { count }), { id: TOAST_ID });
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
    [buildPayload, t, tCommon, stopPolling, totalCount, perPage, selectedIds],
  );

  return { isExporting, startExport };
}
