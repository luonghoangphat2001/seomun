import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared/data-table';
import { ErpOptionGroupType, useAdminErpOptionGroupsQuery } from '@/features/products/options';

import type { PostProcessingPrice, UnitPriceSectionKey } from '../../api';
import { UnitPriceQueryErrorState } from '../UnitPriceQueryErrorState';
import { UnitPriceQueryRefreshBanner } from '../UnitPriceQueryRefreshBanner';
import { getPostProcessingPriceColumns } from './PostProcessingPriceColumns';
import { PostProcessingPriceSearchFilters } from './PostProcessingPriceSearchFilters';

type PostProcessingPriceSectionProps = {
  activeSection: UnitPriceSectionKey;
  onSectionChange: (section: UnitPriceSectionKey) => void;
  rows: PostProcessingPrice[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  hasData: boolean;
  onRetry: () => void;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  pageCount: number;
  rowCount: number;
  onEdit: (item: PostProcessingPrice) => void;
  onDelete: (item: PostProcessingPrice) => void;
};

export function PostProcessingPriceSection({
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
}: PostProcessingPriceSectionProps) {
  const { t } = useTranslation();

  const erpOptionGroupsQuery = useAdminErpOptionGroupsQuery({ type: ErpOptionGroupType.POST_PROCESSING, current_page: 1, per_page: 100 });
  const groupLabelById = useMemo<Record<number, string>>(
    () => Object.fromEntries((erpOptionGroupsQuery.data?.data.erp_option_groups ?? []).map((group) => [group.id, group.code])),
    [erpOptionGroupsQuery.data],
  );

  const columns = useMemo(() => getPostProcessingPriceColumns(t, groupLabelById, onEdit, onDelete), [t, groupLabelById, onEdit, onDelete]);

  const shouldShowInitialError = isError && !hasData;
  const shouldShowRefreshError = isError && hasData;

  return (
    <>
      <PostProcessingPriceSearchFilters section={activeSection} onSectionChange={onSectionChange} />

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
