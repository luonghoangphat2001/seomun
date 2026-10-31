'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/common';
import { cn, formatCurrency } from '@/lib/utils';
import { DailyTransaction, TransactionHistory } from '@/types/transaction-history';
import { useTranslations } from 'next-intl';
import React from 'react';
import Loading from '@/components/common/loading';

type TransactionHistoryTableProps = {
  data: TransactionHistory[];
  isLoading?: boolean;
};

type TransactionBodyKey = keyof DailyTransaction | 'totalAmount' | 'vat';

const getTransactionTotalAmount = (transaction: DailyTransaction) =>
  transaction.orderAmount + (transaction.shippingFee ?? 0) - (transaction.discountAmount ?? 0);

const getTransactionSupplyAmount = (transaction: DailyTransaction) => Math.round(getTransactionTotalAmount(transaction) / 1.1);

const getTransactionVat = (transaction: DailyTransaction) =>
  getTransactionTotalAmount(transaction) - getTransactionSupplyAmount(transaction);

const getBodyValue = (transaction: DailyTransaction, key: TransactionBodyKey) => {
  if (key === 'totalAmount') return getTransactionTotalAmount(transaction);
  if (key === 'supplyAmount') return getTransactionSupplyAmount(transaction);
  if (key === 'vat') return getTransactionVat(transaction);
  return transaction[key];
};

const getMonthTotalInTransaction = (days: DailyTransaction[]) => ({
  orderAmount: days.reduce((total, transaction) => total + transaction.orderAmount, 0),
  shippingFee: days.reduce((total, transaction) => total + (transaction.shippingFee ?? 0), 0),
  discountAmount: days.reduce((total, transaction) => total + (transaction.discountAmount ?? 0), 0),
  totalAmount: days.reduce((total, transaction) => total + getTransactionTotalAmount(transaction), 0),
  supplyAmount: days.reduce((total, transaction) => total + getTransactionSupplyAmount(transaction), 0),
  vat: days.reduce((total, transaction) => total + getTransactionVat(transaction), 0),
  depositAmount: days.reduce((total, transaction) => total + transaction.depositAmount, 0),
  depositSettlement: days.reduce((total, transaction) => total + transaction.depositSettlement, 0),
  balance: days.reduce((total, transaction) => total + (transaction.balance ?? 0), 0),
  outStandingAmount: days.reduce((total, transaction) => total + (transaction.outStandingAmount ?? 0), 0),
  refund: days.reduce((total, transaction) => total + (transaction.refund ?? 0), 0),
});

const formatBodyAmount = (value: number | null | undefined) => {
  if (value === null || value === undefined || value === 0) return '-';

  return formatCurrency(value, false);
};

const headCellClassName = 'title-14 border-text-third h-11 border-r px-3 text-center whitespace-nowrap';
const bodyCellClassName = 'body-16 border-border-soft border-r border-b p-3 text-center whitespace-nowrap';
const summaryCellClassName = 'border-b-border-brand border-r-border-soft body-16 border-r border-b-2 p-3 text-center';

const TransactionHistoryTable = ({ data, isLoading }: TransactionHistoryTableProps) => {
  const t = useTranslations();
  console.log('data', data);

  const headers = [
    { label: t('common.month'), className: 'w-25' },
    { label: t('common.day'), className: 'w-22.5' },
    { label: t('my.order_cost'), className: 'w-22.5' },
    { label: t('common.shipping_fee'), className: 'w-22.5' },
    { label: t('order.discount_amount'), className: 'w-22.5' },
    { label: t('my.total_amount'), className: 'w-22.5' },
    { label: t('my.supply_price'), className: 'w-22.5' },
    { label: t('product.vat'), className: 'w-22.5' },
    { label: t('common.deposit_amount'), className: 'w-22.5' },
    { label: t('common.deposit_settlement'), className: 'w-22.5' },
    { label: t('common.balance'), className: 'w-22.5' },
    { label: t('common.unpaid_amount'), className: 'w-22.5' },
    { label: t('common.refund'), className: 'w-22.5' },
  ];

  const bodys: TransactionBodyKey[] = [
    'day',
    'orderAmount',
    'shippingFee',
    'discountAmount',
    'totalAmount',
    'supplyAmount',
    'vat',
    'depositAmount',
    'depositSettlement',
    'balance',
    'outStandingAmount',
    'refund',
  ];

  return (
    <div className='relative grid grid-cols-1'>
      {isLoading && (
        <div className='absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]'>
          <Loading />
        </div>
      )}
      <div className='w-full overflow-x-auto'>
        <Table className='min-w-max table-auto'>
          {/* HEADER */}
          <TableHeader className='bg-fill-soft border-text-third border p-3'>
            <TableRow className='bg-muted border-text-third'>
              {headers.map((header, index) => (
                <TableHead key={index} className={cn(headCellClassName, header.className)}>
                  {header.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          {/* BODY */}
          <TableBody>
            {data.map((month) => {
              const total = getMonthTotalInTransaction(month.days);

              return (
                <React.Fragment key={month.month}>
                  {month.days.map((day, index) => (
                    <TableRow key={`${month.month}-${day.day}`} className='group h-10'>
                      {/* ROWSPAN */}
                      {index === 0 && (
                        <TableCell
                          rowSpan={month.days.length}
                          className='border-border-soft body-16 border text-center align-middle'>
                          {month.month}
                          {t('common.month')}
                        </TableCell>
                      )}
                      {bodys.map((body) => {
                        const value = getBodyValue(day, body);

                        return (
                          <TableCell key={body} className={cn(bodyCellClassName)}>
                            {formatBodyAmount(value)}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}

                  {/* TOTAL ROW */}
                  <TableRow className='bg-primary-100 group h-10'>
                    <TableCell className='border-border-brand title-16 border-b-2 border-l p-3 text-center'>
                      {month.month}
                      {t('common.month')} {t('common.total')}
                    </TableCell>
                    {bodys.map((body) => {
                      if (body === 'day') return <TableCell key={body} className={cn(summaryCellClassName)}></TableCell>;
                      return (
                        <TableCell key={body} className={cn(summaryCellClassName)}>
                          {formatCurrency(total[body], false)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionHistoryTable;
