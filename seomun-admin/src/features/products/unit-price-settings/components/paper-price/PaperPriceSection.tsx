import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared/data-table';
import type { Paper } from '@/features/products/options';

import type { PaperPrice, PaperPriceSearchFilters as PaperPriceSearchFiltersData, UnitPriceSectionKey } from '../../api';
import { UnitPriceQueryErrorState } from '../UnitPriceQueryErrorState';
import { UnitPriceQueryRefreshBanner } from '../UnitPriceQueryRefreshBanner';
import { getPaperPriceColumns } from './PaperPriceColumns';
import { PaperPriceSearchFilters, type PaperPriceFilterValues } from './PaperPriceSearchFilters';

type PaperPriceSectionProps = {
  activeSection: UnitPriceSectionKey;
  onSectionChange: (section: UnitPriceSectionKey) => void;
  papers: Paper[];
  searchFilters: PaperPriceSearchFiltersData | undefined;
  filterValues: PaperPriceFilterValues;
  onSearch: (values: PaperPriceFilterValues) => void;
  onReset: () => void;
  rows: PaperPrice[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  hasData: boolean;
  onRetry: () => void;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  pageCount: number;
  rowCount: number;
  onEdit: (item: PaperPrice) => void;
  onDelete: (item: PaperPrice) => void;
};

export function PaperPriceSection({
  activeSection,
  onSectionChange,
  papers,
  searchFilters,
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
}: PaperPriceSectionProps) {
  const { t } = useTranslation();
  const columns = useMemo(() => getPaperPriceColumns(t, papers, onEdit, onDelete), [t, papers, onEdit, onDelete]);

  const shouldShowInitialError = isError && !hasData;
  const shouldShowRefreshError = isError && hasData;

  return (
    <>
      <PaperPriceSearchFilters
        section={activeSection}
        onSectionChange={onSectionChange}
        initialValues={filterValues}
        papers={papers}
        searchFilters={searchFilters}
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
