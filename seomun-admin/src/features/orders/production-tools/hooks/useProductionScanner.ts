import { useCallback, useEffect, useMemo, useState, type RefObject } from 'react';
import toast from 'react-hot-toast';

import { useOrdersQuery } from '@/features/orders/api';
import { useBarcodeScanMutation } from '../api';
import type { ProductionOrder, ScanHistoryItem, ScanResultState } from '../types/production-tools.type';
import { DEFAULT_RESULT, PRODUCTION_STATUS_ORDER, SCAN_OPERATOR_NAME } from '../constants';
import {
  formatTimestamp,
  getErrorMessage,
  getStatusLabel,
  mapOrderStatusToProductionStatus,
  playSuccessTone,
  toProductionOrder,
} from '../utils/production-tools.utils';

export function useProductionScanner(inputRef: RefObject<HTMLInputElement | null>) {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [barcodeValue, setBarcodeValue] = useState('');
  const [scanResult, setScanResult] = useState<ScanResultState>(DEFAULT_RESULT);
  const [recentScans, setRecentScans] = useState<ScanHistoryItem[]>([]);
  const [previewOrder, setPreviewOrder] = useState<ProductionOrder | null>(null);

  const {
    data: response,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useOrdersQuery({
    page: 1,
    per_page: 100,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [inputRef]);

  const [prevResponseData, setPrevResponseData] = useState(response?.data);
  if (response?.data !== prevResponseData) {
    setPrevResponseData(response?.data);
    if (response?.data) {
      setOrders(response.data.orders.map(toProductionOrder).filter((order): order is ProductionOrder => order !== null));
    }
  }

  const summaryCounts = useMemo(
    () =>
      PRODUCTION_STATUS_ORDER.map((status) => ({
        status,
        count: orders.filter((order) => order.production_status === status).length,
      })),
    [orders],
  );

  const scanMutation = useBarcodeScanMutation({
    onSuccess: async (scanResponse) => {
      const scannedAt = formatTimestamp();
      const { order_number, status_before, status_after, status_after_label_ko } = scanResponse.data;

      const mappedStatusAfter = mapOrderStatusToProductionStatus(status_after) ?? status_after;
      const matchedOrder = orders.find((o) => o.order_number.toLowerCase() === order_number.toLowerCase());

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.order_number.toLowerCase() === order_number.toLowerCase()
            ? {
                ...order,
                production_status: mappedStatusAfter,
                production_status_label: getStatusLabel(status_after, status_after_label_ko),
                last_scanned_at: scannedAt,
                last_operator: SCAN_OPERATOR_NAME,
              }
            : order,
        ),
      );

      const scannedOrderDetails: ProductionOrder = matchedOrder
        ? {
            ...matchedOrder,
            production_status: mappedStatusAfter,
            production_status_label: getStatusLabel(status_after, status_after_label_ko),
            last_scanned_at: scannedAt,
            last_operator: SCAN_OPERATOR_NAME,
          }
        : ({
            id: order_number,
            order_number,
            status: status_after,
            production_status: mappedStatusAfter,
            production_status_label: getStatusLabel(status_after, status_after_label_ko),
            last_scanned_at: scannedAt,
            last_operator: SCAN_OPERATOR_NAME,
            orderer_name: 'Walk-in Customer',
            member_name: 'Retail Customer',
            product_summary: 'Scanned Production Item',
            payment_amount: 0,
          } as unknown as ProductionOrder);

      setPreviewOrder(scannedOrderDetails);

      setRecentScans((history) =>
        [
          {
            id: `${order_number}-${Date.now()}`,
            order_number,
            status_before,
            status_after,
            status_after_label: status_after_label_ko,
            scanned_at: scannedAt,
            scanned_by: SCAN_OPERATOR_NAME,
            message: scanResponse.message,
            order_details: matchedOrder
              ? {
                  id: String(matchedOrder.id),
                  orderer_name: matchedOrder.user.name,
                  product_summary: matchedOrder.product.name,
                  payment_amount: Number(matchedOrder.totals.total),
                }
              : undefined,
          },
          ...history,
        ].slice(0, 8),
      );

      setScanResult({
        kind: 'success',
        title: 'Scan Successful',
        description: scanResponse.message,
        order_number,
        status_before,
        status_after,
        status_after_label: status_after_label_ko,
      });

      toast.success(scanResponse.message);
      playSuccessTone();
      setBarcodeValue('');

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      await refetch();
    },
    onError: (error) => {
      const message = getErrorMessage(error, 'Barcode scan failed.');
      setScanResult({
        kind: 'error',
        title: 'Scan Failed',
        description: message,
      });
      toast.error(message);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    },
  });

  const handleScan = useCallback(() => {
    const barcode = barcodeValue.trim();

    if (!barcode) {
      setScanResult({
        kind: 'error',
        title: 'Barcode Required',
        description: 'Please scan a barcode or enter an order number first.',
      });
      inputRef.current?.focus();
      return;
    }

    scanMutation.mutate({ barcode });
  }, [barcodeValue, scanMutation, inputRef]);

  const handleSelectRecentScan = useCallback((scan: ScanHistoryItem) => {
    const mappedStatusAfter = mapOrderStatusToProductionStatus(scan.status_after) ?? scan.status_after;
    setPreviewOrder({
      id: scan.order_details?.id ?? scan.order_number,
      order_number: scan.order_number,
      status: scan.status_after,
      production_status: mappedStatusAfter,
      production_status_label: getStatusLabel(scan.status_after, scan.status_after_label),
      last_scanned_at: scan.scanned_at,
      last_operator: scan.scanned_by,
      orderer_name: scan.order_details?.orderer_name ?? 'Walk-in Customer',
      member_name: '',
      product_summary: scan.order_details?.product_summary ?? 'Scanned Production Item',
      payment_amount: scan.order_details?.payment_amount ?? 0,
    } as unknown as ProductionOrder);
  }, []);

  return {
    // State
    barcodeValue,
    setBarcodeValue,
    scanResult,
    recentScans,
    previewOrder,
    summaryCounts,

    // Status
    isLoading,
    isError,
    isFetching,
    isProcessingScan: scanMutation.isPending,

    // Actions
    refetch,
    handleScan,
    handleSelectRecentScan,
  };
}
