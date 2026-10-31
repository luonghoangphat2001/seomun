import { getRouteApi } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared/data-table';
import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';
import { useListPageState } from '@/hooks/useListPageState';

import { usePricingProfilesQuery, useTogglePricingProfileStatusMutation, type PricingProfile } from '../api';
import { getPricingProfileColumns, PricingProfileDetailDialog, PricingProfileSearchFilters } from '../components';
import type { PricingProfileFilterValues, PricingProfileListSearch } from '../schemas';

const routeApi = getRouteApi('/products/pricing-profiles');

function buildPricingProfileListParams(search: PricingProfileListSearch) {
  return {
    page: search.page ?? 1,
    per_page: search.per_page ?? 20,
    calculator_type: search.calculator_type,
    is_active: search.is_active === 'true' ? true : search.is_active === 'false' ? false : undefined,
  };
}

export function PricingProfileListPage() {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const [detailProfile, setDetailProfile] = useState<PricingProfile | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const list = useListPageState({
    search,
    navigate,
    buildQueryParams: buildPricingProfileListParams,
    mapSearchToFilters: (currentSearch): PricingProfileFilterValues => ({
      calculator_type: currentSearch.calculator_type,
      is_active: currentSearch.is_active,
    }),
    mapFiltersToSearch: (values) => ({
      calculator_type: values.calculator_type,
      is_active: values.is_active,
    }),
    resetSearch: (previous) => ({
      ...previous,
      page: undefined,
      calculator_type: undefined,
      is_active: undefined,
    }),
  });

  const profilesQuery = usePricingProfilesQuery();
  const toggleMutation = useTogglePricingProfileStatusMutation();

  const handleToggleStatus = useCallback(
    (profile: PricingProfile) => {
      setTogglingId(profile.id);
      toggleMutation.mutate(
        {
          id: profile.id,
          payload: {
            code: profile.code,
            name: profile.name,
            calculator_type: profile.calculator_type,
            is_active: !profile.is_active,
          },
        },
        {
          onSuccess: () => toast.success(t('products.pricing_profiles.messages.status_success')),
          onError: () => toast.error(t('products.pricing_profiles.messages.status_error')),
          onSettled: () => setTogglingId(null),
        },
      );
    },
    [t, toggleMutation],
  );
  const profiles = profilesQuery.data?.data.pricing_profiles ?? [];
  const filteredProfiles = useMemo(() => {
    const { calculator_type: calculatorType, is_active: isActive } = list.appliedFilters;

    return profiles.filter(
      (profile) =>
        (!calculatorType || profile.calculator_type === calculatorType) && (isActive === undefined || profile.is_active === (isActive === 'true')),
    );
  }, [list.appliedFilters, profiles]);

  const columns = useMemo(
    () =>
      getPricingProfileColumns({
        t,
        tCommon,
        togglingId,
        onView: setDetailProfile,
        onToggleStatus: handleToggleStatus,
      }),
    [handleToggleStatus, t, tCommon, togglingId],
  );

  return (
    <PageContainer>
      <div>
        <div>
          <h1 className='text-xl font-semibold'>{t('products.pricing_profiles.list.title')}</h1>
          <p className='text-muted-foreground mt-0.5 text-sm'>{t('products.pricing_profiles.list.description')}</p>
        </div>
      </div>
      <Separator />
      <div className='space-y-4'>
        <PricingProfileSearchFilters initialValues={list.appliedFilters} onSearch={list.applyFilters} onReset={list.resetFilters} />
        <DataTable
          data={filteredProfiles}
          columns={columns}
          isLoading={profilesQuery.isLoading}
          hasPagination={false}
          enableRowSelection={false}
          getRowId={(row) => String(row.id)}
          state={list.tableState}
          pageInfo={{
            pageCount: 1,
            rowCount: filteredProfiles.length,
          }}
          onPaginationChange={list.onPaginationChange}
          onSortingChange={list.onSortingChange}
        />
      </div>

      <PricingProfileDetailDialog profile={detailProfile} onClose={() => setDetailProfile(null)} />
    </PageContainer>
  );
}
