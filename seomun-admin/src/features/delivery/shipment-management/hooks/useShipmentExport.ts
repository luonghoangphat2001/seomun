import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { downloadFileFromUrl } from '@/utils/download-file';

import { checkShipmentExportProgressStatusAPI, exportShipmentsExcelAPI } from '../api/shipment.api';
import type { ShipmentListREQ } from '../api/shipment.request';
import { ShipmentExportExcelType } from '../../enums';

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 120_000;
const TOAST_ID = 'shipment-export';

type UseShipmentExportOptions = {
  filters: Omit<ShipmentListREQ, 'page' | 'per_page'>;
  page: number;
  perPage: number;
  totalCount: number;
  selectedIds?: number[];
};

export function useShipmentExport({ filters, page, perPage, totalCount, selectedIds }: UseShipmentExportOptions) {
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
    async (type: ShipmentExportExcelType): Promise<void> => {
      setIsExporting(true);
      toast.loading(tCommon('export.processing'), { id: TOAST_ID });

      const count =
        type === ShipmentExportExcelType.ALL ? totalCount : type === ShipmentExportExcelType.CURRENT_PAGE ? perPage : (selectedIds?.length ?? 0);

      try {
        const exportRes = await exportShipmentsExcelAPI({
          export_type: type,
          sort_by: filters.sort_by,
          sort_order: filters.sort_order,
          search_term: filters.search_term,
          order_number: filters.order_number,
          customer_name: filters.customer_name,
          product_name: filters.product_name,
          shipping_manager_id: filters.shipping_manager_id,
          shipment_status: filters.shipment_status,
          shipment_type: filters.shipment_type,
          shipping_method: filters.shipping_method,
          shipment_date_from: filters.shipment_date_from,
          shipment_date_to: filters.shipment_date_to,
          ...(type === ShipmentExportExcelType.CURRENT_PAGE && { current_page: page, per_page: perPage }),
          ...(type === ShipmentExportExcelType.SELECTED && { selected_ids: selectedIds ?? [] }),
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
              const statusRes = await checkShipmentExportProgressStatusAPI(historyId, { historyId });
              const { status, file_path } = statusRes.data.history;

              if (status === 'completed') {
                stopPolling();
                setIsExporting(false);
                if (!file_path) {
                  reject(new Error(tCommon('export.error')));
                  return;
                }
                try {
                  const prefix = t('delivery.shipments.export_dialog.file_name_prefix');
                  const timestamp = new Date().toISOString().replace('T', '_').replace(/:/g, '-').slice(0, 19);
                  const customFileName = `${prefix}_${timestamp}.xlsx`;
                  await downloadFileFromUrl(file_path, customFileName);
                  const successKey =
                    type === ShipmentExportExcelType.ALL
                      ? 'export.success_all'
                      : type === ShipmentExportExcelType.CURRENT_PAGE
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
