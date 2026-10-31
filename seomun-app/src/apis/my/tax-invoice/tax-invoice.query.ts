import { useMutation, useQuery, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ErrorRESP, PaginationRESP, PaginationResponse } from '@/types';
import { TaxInvoiceApi } from './tax-invoice.api';
import { TaxInvoiceExportExcelREQ, TaxInvoiceListREQ } from './tax-invoice.request';
import { TaxInvoiceExportExcelRESP, TaxInvoiceItemRESP, TaxInvoiceListRESP } from './tax-invoice.response';

export const TAX_INVOICE_QUERY_KEYS = {
  LIST: 'TAX_INVOICE_LIST',
};

export const useTaxInvoiceListQuery = (
  params?: TaxInvoiceListREQ,
  options?: Omit<
    UseQueryOptions<
      PaginationResponse<TaxInvoiceListRESP>,
      AxiosError<ErrorRESP>,
      { items: TaxInvoiceItemRESP[]; pagination: PaginationRESP }
    >,
    'queryKey' | 'queryFn'
  >,
) =>
  useQuery({
    queryKey: [TAX_INVOICE_QUERY_KEYS.LIST, params],
    queryFn: () => TaxInvoiceApi.list(params),
    select: (resp) => ({
      items: resp.data.items,
      pagination: resp.pagination,
    }),
    ...options,
  });

export const useTaxInvoiceExportExcelMutation = (
  options?: UseMutationOptions<TaxInvoiceExportExcelRESP, AxiosError<ErrorRESP>, TaxInvoiceExportExcelREQ>,
) =>
  useMutation({
    mutationFn: async (body) => {
      const response = await TaxInvoiceApi.exportExcel(body);
      return response.data;
    },
    ...options,
  });
