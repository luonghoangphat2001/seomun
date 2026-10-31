import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared/data-table';

import type { PrintingPrice, UnitPriceSectionKey } from '../../api';
import { UnitPriceQueryErrorState } from '../UnitPriceQueryErrorState';
import { UnitPriceQueryRefreshBanner } from '../UnitPriceQueryRefreshBanner';
import { getPrintingPriceColumns } from './PrintingPriceColumns';
import { PrintingPriceSearchFilters } from './PrintingPriceSearchFilters';

type PrintingPriceSectionProps = {
  activeSection: UnitPriceSectionKey;
  onSectionChange: (section: UnitPriceSectionKey) => void;
  rows: PrintingPrice[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  hasData: boolean;
  onRetry: () => void;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  pageCount: number;
  rowCount: number;
  onEdit: (item: PrintingPrice) => void;
  onDelete: (item: PrintingPrice) => void;
};

export function PrintingPriceSection({
  activeSection,
  onSectionChange,
  rows,
  isLoading,
  isFetching,
  isError,
  hasData,
  onRetry,
  pagination,
  onPaginationChange,
  pageCount,
  rowCount,
  onEdit,
  onDelete,
}: PrintingPriceSectionProps) {
  const { t } = useTranslation();
  const columns = useMemo(() => getPrintingPriceColumns(t, onEdit, onDelete), [t, onEdit, onDelete]);

  const shouldShowInitialError = isError && !hasData;
  const shouldShowRefreshError = isError && hasData;

  return (
    <>
      <PrintingPriceSearchFilters section={activeSection} onSectionChange={onSectionChange} />

      {shouldShowInitialError ? (
        <UnitPriceQueryErrorState onRetry={onRetry} isFetching={isFetching} />
      ) : (
        <>
          {shouldShowRefreshError ? <UnitPriceQueryRefreshBanner onRetry={onRetry} isFetching={isFetching} /> : null}

          <DataTable
            data={rows}
            columns={columns}
            state={{ pagination, sorting: [] }}
            pageInfo={{ pageCount, rowCount }}
            onPaginationChange={onPaginationChange}
            onSortingChange={() => {}}
            isLoading={isLoading}
            enableRowSelection={false}
            emptyMessage={t('page.products.unit_price_settings.messages.empty')}
            getRowId={(row) => String(row.id)}
          />
        </>
      )}
    </>
  );
}
