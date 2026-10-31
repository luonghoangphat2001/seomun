import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared/data-table';

import type { OtherUnitPrice, UnitPriceSectionKey } from '../../api';
import { UnitPriceQueryErrorState } from '../UnitPriceQueryErrorState';
import { UnitPriceQueryRefreshBanner } from '../UnitPriceQueryRefreshBanner';
import { getOtherPriceColumns } from './OtherPriceColumns';
import { OtherPriceSearchFilters, type OtherPriceFilterValues } from './OtherPriceSearchFilters';

type OtherPriceSectionProps = {
  activeSection: UnitPriceSectionKey;
  onSectionChange: (section: UnitPriceSectionKey) => void;
  filterValues: OtherPriceFilterValues;
  onSearch: (values: OtherPriceFilterValues) => void;
  onReset: () => void;
  rows: OtherUnitPrice[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  hasData: boolean;
  onRetry: () => void;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  pageCount: number;
  rowCount: number;
  onEdit: (item: OtherUnitPrice) => void;
  onDelete: (item: OtherUnitPrice) => void;
  onToggleStatus: (item: OtherUnitPrice) => void;
  togglingId: number | null;
};

export function OtherPriceSection({
  activeSection,
  onSectionChange,
  filterValues,
  onSearch,
  onReset,
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
  onToggleStatus,
  togglingId,
}: OtherPriceSectionProps) {
  const { t } = useTranslation();
  const columns = useMemo(
    () => getOtherPriceColumns(t, onEdit, onDelete, onToggleStatus, togglingId),
    [t, onEdit, onDelete, onToggleStatus, togglingId],
  );

  const shouldShowInitialError = isError && !hasData;
  const shouldShowRefreshError = isError && hasData;

  return (
    <>
      <OtherPriceSearchFilters
        section={activeSection}
        onSectionChange={onSectionChange}
        initialValues={filterValues}
        onSearch={onSearch}
        onReset={onReset}
      />

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
