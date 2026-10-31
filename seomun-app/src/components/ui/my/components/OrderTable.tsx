'use client';

import { useDownloadQuotationPDFMutation, useDownloadTransactionStatementPDFMutation } from '@/apis/my/order/order.query';
import { OrderHistoryOptionRESP, OrderHistoryOrderItemRESP, OrderHistoryRESP } from '@/apis/my/order/order.response';
import { Button, ModalHandle, MyDataTable, MyPagination } from '@/components/common';
import OrderStatusBage from '@/components/common/badge/OrderStatusBage';
import { DATE_FORMAT } from '@/constants/common';
import { DesignSourceType } from '@/enums/common';
import { OrderHistoryStatus } from '@/enums/order';
import { useRouter } from '@/i18n/navigation';
import { formatCurrency, formatDate, handleBlobDownload } from '@/lib/utils';
import { ROUTES } from '@/routes';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  OnChangeFn,
  PaginationState,
  useReactTable,
} from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRef, useState } from 'react';
import OrderCardList from './OrderCardList';
import { OrderTrackingDeliveryModal } from '../order/OrderTrackingDeliveryModal';

type OrderTableProps = {
  orders: OrderHistoryRESP[];
  showPagination?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  isLoading?: boolean;
  totalPage?: number;
  totalRecord?: number;
};

const getOrderItems = (order: OrderHistoryRESP) => order.items ?? [];

const getOrderItemName = (item: OrderHistoryOrderItemRESP) =>
  item.product_snapshot?.name || item.configuration?.product_name || item.title;

const getOrderItemImage = (item: OrderHistoryOrderItemRESP, fallbackImage: string | null) => {
  const isWebEditor = item.configuration?.design?.design_group?.source_type === DesignSourceType.WEB_EDITOR;

  if (!isWebEditor && item.product_snapshot?.first_image) return item.product_snapshot.first_image;

  return (
    item.design?.front?.preview_image_path ||
    item.design?.back?.preview_image_path ||
    item.configuration?.design_preview ||
    fallbackImage
  );
};

const getOrderItemQuantity = (item: OrderHistoryOrderItemRESP) => `${item.quantity}매 x ${item.multiplier}건`;

const getOrderOptionValues = (options: (OrderHistoryOptionRESP | null | undefined)[]) =>
  options
    .map((item) => item?.option?.label?.trim() || item?.option?.value?.trim() || '')
    .filter((value): value is string => Boolean(value))
    .join(' / ');

const TRANSACTION_STATEMENT_AVAILABLE_STATUSES: readonly OrderHistoryStatus[] = [
  OrderHistoryStatus.TYPESETTING,
  OrderHistoryStatus.OUTPUT_OF_POWER,
  OrderHistoryStatus.PRINT,
  OrderHistoryStatus.POST_PROCESSING,
  OrderHistoryStatus.PRODUCTION_DONE,
  OrderHistoryStatus.READY_TO_SHIP,
  OrderHistoryStatus.SHIPPING,
  OrderHistoryStatus.SHIPPED,
  OrderHistoryStatus.DELIVERY_COMPLETED,
  OrderHistoryStatus.COMPLETED,
];

const OrderTable = ({
  orders,
  showPagination = true,
  pagination: controlledPagination,
  onPaginationChange,
  isLoading,
  totalPage,
  totalRecord,
}: OrderTableProps) => {
  const router = useRouter();
  const t = useTranslations();
  const { mutateAsync: downloadQuotationPDF } = useDownloadQuotationPDFMutation();
  const { mutateAsync: downloadTransactionStatementPDF } = useDownloadTransactionStatementPDFMutation();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [downloadingQuotationOrderNumbers, setDownloadingQuotationOrderNumbers] = useState<Set<string>>(() => new Set());
  const [downloadingTransactionStatementOrderNumbers, setDownloadingTransactionStatementOrderNumbers] = useState<Set<string>>(
    () => new Set(),
  );
  const [trackingInvoiceNumber, setTrackingInvoiceNumber] = useState<string>();
  const trackingDeliveryModalRef = useRef<ModalHandle>(null);

  const goToOrderDetail = (orderNumber: string) => {
    router.push(ROUTES.MY_PAGE.ORDER_DETAIL(orderNumber));
  };

  const openTrackingDeliveryModal = (invoiceNumber: string | null) => {
    if (!invoiceNumber) return;

    setTrackingInvoiceNumber(invoiceNumber);
    trackingDeliveryModalRef.current?.open();
  };

  const handleDownloadQuotation = async (orderNumber: string) => {
    setDownloadingQuotationOrderNumbers((prev) => new Set(prev).add(orderNumber));

    try {
      const blob = await downloadQuotationPDF(orderNumber);
      handleBlobDownload(blob, `견적서_${orderNumber}.pdf`);
    } catch (error) {
      console.error('Failed to download quotation PDF:', error);
    } finally {
      setDownloadingQuotationOrderNumbers((prev) => {
        const next = new Set(prev);
        next.delete(orderNumber);

        return next;
      });
    }
  };

  const handleDownloadTransactionStatement = async (orderNumber: string) => {
    setDownloadingTransactionStatementOrderNumbers((prev) => new Set(prev).add(orderNumber));

    try {
      const blob = await downloadTransactionStatementPDF(orderNumber);
      handleBlobDownload(blob, `거래명세서_${orderNumber}.pdf`);
    } catch (error) {
      console.error('Failed to download transaction statement PDF:', error);
    } finally {
      setDownloadingTransactionStatementOrderNumbers((prev) => {
        const next = new Set(prev);
        next.delete(orderNumber);

        return next;
      });
    }
  };

  const columns: ColumnDef<OrderHistoryRESP>[] = [
    {
      header: t('my.order.order_date_and_number'),
      accessorKey: 'ordered_at',
      cell: (info) => (
        <div>
          <div className='body-16' style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
            {formatDate(info.getValue() as string, DATE_FORMAT.DATE_HOUR_MINUTE)}
          </div>
          <p className='body-14 text-text-brand mt-1 truncate'>{info.row.original.order_number}</p>
          <div className='mt-3 flex flex-col items-center space-y-1.5'>
            <Button
              variant='outline'
              size='xs'
              className='w-34'
              loading={downloadingQuotationOrderNumbers.has(info.row.original.order_number)}
              onClick={(event) => {
                event.stopPropagation();
                void handleDownloadQuotation(info.row.original.order_number);
              }}>
              {t('order.quotation')}
            </Button>
            <Button
              variant='outline'
              size='xs'
              className='w-34'
              loading={downloadingTransactionStatementOrderNumbers.has(info.row.original.order_number)}
              disabled={!TRANSACTION_STATEMENT_AVAILABLE_STATUSES.includes(info.row.original.status)}
              onClick={(event) => {
                event.stopPropagation();
                void handleDownloadTransactionStatement(info.row.original.order_number);
              }}>
              {t('order.transaction_statement')}
            </Button>
          </div>
        </div>
      ),
      meta: { width: '190px', align: 'center' },
    },
    {
      header: t('my.order.title'),
      accessorKey: 'product_name',
      cell: (info) => {
        const order = info.row.original;
        const items = getOrderItems(order);

        return (
          <div className='text-left break-all whitespace-normal'>
            {items.length ? (
              items.map((item, index) => {
                const imageUrl = getOrderItemImage(item, order.thumbnail_url);
                const designGroupTitle = item.configuration?.design?.design_group?.title;

                return (
                  <div key={item.id} className={index > 0 ? 'border-border-soft mt-3 border-t border-dashed pt-3' : undefined}>
                    <div className='flex gap-4'>
                      {imageUrl && (
                        <div className='relative size-20 shrink-0'>
                          <Image src={imageUrl} alt={getOrderItemName(item)} fill className='object-cover' />
                        </div>
                      )}
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-x-2 gap-y-1'>
                          <p className='title-16 truncate font-semibold'>{getOrderItemName(item)}</p>
                          {designGroupTitle && (
                            <>
                              <div className='size-1 shrink-0 rounded-full bg-[#917965]'></div>
                              <p className='body-14 text-text-brand truncate'>{designGroupTitle}</p>
                            </>
                          )}
                        </div>
                        {index === 0 && order.review.has_review && (
                          <p>
                            <span className='caption-12 text-text-third ml-1.5'>[{t('common.review_completed')}]</span>
                          </p>
                        )}
                        <p className='body-14 mt-1.5'>{getOrderOptionValues(item.options)}</p>
                        <p className='body-14 mt-1.5 font-medium'>{getOrderItemQuantity(item)}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className='flex gap-4'>
                {order.thumbnail_url && (
                  <div className='relative size-20 shrink-0'>
                    <Image src={order.thumbnail_url} alt={order.product_name} fill className='object-cover' />
                  </div>
                )}
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-x-3 gap-y-1'>
                    <p className='title-16 truncate font-semibold'>{order.product_name}</p>
                  </div>
                  {order.review.has_review && (
                    <p>
                      <span className='caption-12 text-text-third ml-1.5'>[{t('common.review_completed')}]</span>
                    </p>
                  )}
                  <p className='body-14 mt-1.5'>{getOrderOptionValues(order.product_spec.options)}</p>
                  <p className='body-14 mt-1.5 font-bold'>{order.quantity ? `${order.quantity}매 x 1건` : '-'}</p>
                </div>
              </div>
            )}
          </div>
        );
      },
      // meta: { width: '400px' },
    },
    {
      header: t('my.order.order_amount'),
      accessorKey: 'amount',
      cell: (value) => <div>{formatCurrency(value.getValue() as number | string)}</div>,
      meta: { width: '120px', align: 'center' },
    },
    {
      header: t('my.order.order_status'),
      accessorKey: 'status',
      cell: (info) => (
        <div className='flex justify-center'>
          <OrderStatusBage status={info.row.original.status} label={info.row.original.status_label} />
        </div>
      ),
      meta: { width: '120px', align: 'center' },
    },
    {
      id: 'fileStatus',
      header: '',
      cell: ({ row }) => {
        const orderStatus = row.original.status;
        const reviewStatus = row.original.review.has_review;
        const isResubmitFile =
          orderStatus === OrderHistoryStatus.AWAITING_PAYMENT ||
          orderStatus === OrderHistoryStatus.CONFIRMED ||
          orderStatus === OrderHistoryStatus.PURCHASE_CONFIRMED ||
          orderStatus === OrderHistoryStatus.PENDING_RECEPTION ||
          orderStatus === OrderHistoryStatus.FILE_ERROR ||
          orderStatus === OrderHistoryStatus.PENDING_CORRECTION;
        const isConfirmDraft = orderStatus === OrderHistoryStatus.DESIGN_CONFIRMATION_REQUESTED;
        const reviewEnable = orderStatus === OrderHistoryStatus.PRODUCTION_DONE || orderStatus === OrderHistoryStatus.COMPLETED;

        return (
          <div className='flex flex-col items-center gap-1.5'>
            {isResubmitFile && (
              <Button
                size={'sm'}
                variant={'outline-primary'}
                className='body-14 w-full px-1'
                onClick={(e) => {
                  e.stopPropagation();
                  goToOrderDetail(row.original.order_number);
                }}>
                {t('order.resubmit_file')}
              </Button>
            )}
            {isConfirmDraft && (
              <Button
                size={'sm'}
                className='body-14 w-full px-1'
                onClick={(e) => {
                  e.stopPropagation();
                  goToOrderDetail(row.original.order_number);
                }}>
                {t('order.confirm_draft')}
              </Button>
            )}
            {(isResubmitFile || isConfirmDraft) && (
              <Button
                size={'sm'}
                variant='outline'
                className='body-14 w-full px-1'
                onClick={(e) => {
                  e.stopPropagation();
                  goToOrderDetail(row.original.order_number);
                }}>
                {t('order.proofreading_confirm')}
              </Button>
            )}
            {reviewEnable &&
              (reviewStatus ? (
                <Button
                  size='sm'
                  variant='outline'
                  className='body-14 px-4'
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(ROUTES.MY_PAGE.REVIEW);
                  }}>
                  {t('common.view_review')}
                </Button>
              ) : (
                <Button
                  size='sm'
                  variant='outline'
                  className='body-14 px-4'
                  onClick={(e) => {
                    e.stopPropagation();
                    goToOrderDetail(row.original.order_number);
                  }}>
                  {t('sidebar.items.write_review')}
                </Button>
              ))}
          </div>
        );
      },
      meta: { width: '120px', align: 'center' },
    },
    {
      header: t('my.order.shipping'),
      accessorKey: 'invoice_number',
      cell: ({ row }) => (
        <div className='space-y-1.5'>
          <p className='body-16 leading-9'>{row.original.invoice_number || '-'}</p>
          {row.original.can_track_delivery && row.original.invoice_number && (
            <Button
              size={'sm'}
              variant='outline'
              className='body-14'
              onClick={(e) => {
                e.stopPropagation();
                openTrackingDeliveryModal(row.original.invoice_number);
              }}>
              {t('common.track_order')}
            </Button>
          )}
        </div>
      ),
      meta: { width: '140px', align: 'center' },
    },
  ];

  const tablePagination = controlledPagination ?? pagination;
  const isManualPagination = Boolean(controlledPagination && onPaginationChange);

  const table = useReactTable({
    data: orders,
    columns,
    state: {
      pagination: tablePagination,
    },
    onPaginationChange: onPaginationChange ?? setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: isManualPagination,
    pageCount: totalPage,
  });

  return (
    <div className='grid grid-cols-1'>
      <div className='hidden md:block'>
        <MyDataTable
          table={table}
          columns={columns}
          isLoading={isLoading}
          onRowClick={(row) => router.push(ROUTES.MY_PAGE.ORDER_DETAIL(row.order_number))}
        />
      </div>
      {/* Mobile Card List */}
      <OrderCardList orders={orders} />
      <OrderTrackingDeliveryModal ref={trackingDeliveryModalRef} invoiceNumber={trackingInvoiceNumber} />
      {/* Pagination */}
      {showPagination && (
        <MyPagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPage={table.getPageCount()}
          onPageChange={(page: number) => table.setPageIndex(page - 1)}
          pageSize={table.getState().pagination.pageSize}
          onPageSizeChange={(size: number) => table.setPageSize(size)}
          totalRecords={totalRecord ?? orders.length}
          className='mt-3 hidden px-6 md:flex'
        />
      )}
    </div>
  );
};

export default OrderTable;
