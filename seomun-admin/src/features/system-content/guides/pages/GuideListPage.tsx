import { getRouteApi } from '@tanstack/react-router';
import { functionalUpdate, type OnChangeFn, type PaginationState, type SortingState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';

import { DataTable } from '@/components/shared/data-table';
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';
import { useGuidesFilterQuery, useGuidesQuery } from '../api';
import { getGuideColumns } from '../components/GuideColumns';
import { GuideSearchFilters } from '../components/GuideSearchFilters';
import type { GuideSortField } from '../enums';
import { EMPTY_GUIDE_SEARCH_FILTER_VALUES, type GuideListSearch, type GuideSearchFilterValues } from '../schemas';

const routeApi = getRouteApi('/system-content/guides/');

export function GuideListPage() {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const queryParams = {
    ...search,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };

  const { data: response, isLoading } = useGuidesQuery(queryParams);
  const { data: filterData } = useGuidesFilterQuery();

  const columns = getGuideColumns({ t, tCommon });

  const tableState = {
    pagination: {
      pageIndex: queryParams.page - DEFAULT_PAGE,
      pageSize: queryParams.per_page,
    } satisfies PaginationState,
    sorting: search.sort_by ? [{ id: search.sort_by, desc: search.sort_order === SortOrder.DESC }] : [],
  } satisfies {
    pagination: PaginationState;
    sorting: SortingState;
  };

  const pageInfo = {
    pageCount: response?.pagination?.total_page ?? 0,
    rowCount: response?.pagination?.total_item ?? 0,
  };

  const handleFilterSearch = (values: GuideSearchFilterValues) => {
    navigate({
      search: (prev: GuideListSearch) => ({
        ...prev,
        ...values,
        page: undefined,
      }),
    });
  };

  const handleFilterReset = () => {
    navigate({
      search: (prev: GuideListSearch) => ({
        ...EMPTY_GUIDE_SEARCH_FILTER_VALUES,
        per_page: prev.per_page,
        sort_by: prev.sort_by,
        sort_order: prev.sort_order,
        page: undefined,
      }),
    });
  };

  const handlePaginationChange: OnChangeFn<PaginationState> = (updaterOrValue) => {
    const next = functionalUpdate(updaterOrValue, tableState.pagination);

    navigate({
      search: (prev: GuideListSearch) => ({
        ...prev,
        page: next.pageIndex + 1 === DEFAULT_PAGE ? undefined : next.pageIndex + 1,
        per_page: next.pageSize === DEFAULT_PER_PAGE ? undefined : next.pageSize,
      }),
    });
  };

  const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    const next = functionalUpdate(updaterOrValue, tableState.sorting);
    const firstSort = next[0];

    navigate({
      search: (prev: GuideListSearch) => ({
        ...prev,
        sort_by: firstSort ? (firstSort.id as GuideSortField) : undefined,
        sort_order: firstSort ? (firstSort.desc ? SortOrder.DESC : SortOrder.ASC) : undefined,
        page: undefined,
      }),
    });
  };

  return (
    <PageContainer>
      <div>
        <h1 className='text-xl font-semibold'>{t('guides.list.title', 'Guide Content Management')}</h1>
        {/* <p className='text-muted-foreground mt-0.5 text-sm'>{t('guides.list.description', 'Manage guide content displayed on the storefront.')}</p> */}
      </div>

      <Separator />

      <div className='space-y-4'>
        <GuideSearchFilters
          initialValues={{
            search_term: search.search_term,
            author_id: search.author_id,
            exposure_status: search.exposure_status,
          }}
          filterData={filterData}
          onSearch={handleFilterSearch}
          onReset={handleFilterReset}
        />
        <DataTable
          data={response?.data?.guide_contents ?? []}
          columns={columns}
          state={tableState}
          pageInfo={pageInfo}
          onPaginationChange={handlePaginationChange}
          onSortingChange={handleSortingChange}
          isLoading={isLoading}
          getRowId={(row) => String(row.id)}
        />
      </div>
    </PageContainer>
  );
}
