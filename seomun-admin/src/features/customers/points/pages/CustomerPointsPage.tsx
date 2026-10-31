import { getRouteApi } from '@tanstack/react-router';
import { useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';

import { hasRequiredRole, SUPER_MANAGER_ROLES, type UserRole } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth-store';
import { getApiErrorMessage } from '@/utils/api-error';
import { formatDateOnly, subtractDays } from '@/utils/format-date';
import { PolicyNotesSection } from '../../components/PolicyNotesSection';
import { getPointPolicySections } from '../../utils/policy-notes';
import {
  usePointHistoryQuery,
  usePointManualAdjustmentMutation,
  usePointSettingsQuery,
  usePointSettingsUpdateMutation,
} from '../api/customer-points.query';
import { mapPointSettingsToFormValues } from '../api/customer-points.service';
import { PointAdminActions } from '../components/PointAdminActions';
import { PointHistoryTable } from '../components/PointHistoryTable';
import { PointManagementFilters } from '../components/PointManagementFilters';
import { PointSettingsForm } from '../components/PointSettingsForm';
import type { CustomerPointsSearch, PointManagementFilterFormValues, PointManualAdjustmentFormValues, PointSettingsFormValues } from '../schemas';

type PointManagementTab = 'usage-history' | 'point-setting';

const customerPointsRouteApi = getRouteApi('/customers/points');

function createDefaultFilters(search: CustomerPointsSearch): PointManagementFilterFormValues {
  return {
    page: search.page ?? 1,
    per_page: search.per_page ?? 10,
    category: search.category ?? '',
    detail_category: search.detail_category ?? '',
    order_number: search.order_number ?? '',
    name: search.name ?? '',
    contact: search.contact ?? '',
    email: search.email ?? '',
    issue_date_preset: search.issue_date_preset ?? '',
    date_from: search.date_from ?? '',
    date_to: search.date_to ?? '',
  };
}

export function CustomerPointsPage() {
  const { t } = useTranslation();
  const search = customerPointsRouteApi.useSearch();
  const navigate = customerPointsRouteApi.useNavigate();
  const activeTab: PointManagementTab = search.tab ?? 'usage-history';
  const filters = useMemo(() => createDefaultFilters(search), [search]);

  const role = useAuthStore((state) => state.user?.role);
  const canManageAdminActions = role ? hasRequiredRole(role as UserRole, SUPER_MANAGER_ROLES) : false;
  const historyQuery = usePointHistoryQuery(filters);
  const settingsQuery = usePointSettingsQuery();
  const settingsMutation = usePointSettingsUpdateMutation();
  const adjustmentMutation = usePointManualAdjustmentMutation();

  const settingsFormValues = useMemo(() => mapPointSettingsToFormValues(settingsQuery.data?.data.settings), [settingsQuery.data]);
  const policySections = useMemo(() => getPointPolicySections(settingsQuery.data?.data.policy_sections ?? []), [settingsQuery.data]);

  const handleHistoryFilterChange = (nextFilters: PointManagementFilterFormValues) => {
    navigate({
      search: (prev: CustomerPointsSearch) => ({
        ...prev,
        page: nextFilters.page,
        per_page: nextFilters.per_page,
        category: nextFilters.category || undefined,
        detail_category: nextFilters.detail_category || undefined,
        order_number: nextFilters.order_number || undefined,
        name: nextFilters.name || undefined,
        contact: nextFilters.contact || undefined,
        email: nextFilters.email || undefined,
        issue_date_preset: nextFilters.issue_date_preset || undefined,
        date_from: nextFilters.date_from || undefined,
        date_to: nextFilters.date_to || undefined,
      }),
    });
  };

  const handlePresetChange = (preset: PointManagementFilterFormValues['issue_date_preset'], current: PointManagementFilterFormValues) => {
    if (!preset || preset === 'custom') {
      handleHistoryFilterChange({
        ...current,
        page: 1,
        issue_date_preset: '',
        date_from: '',
        date_to: '',
      });
      return;
    }

    const nowDate = new Date();
    const today = formatDateOnly(nowDate) ?? '';
    const yesterday = formatDateOnly(subtractDays(nowDate, 1)) ?? '';

    const presetRangeMap: Record<
      Exclude<NonNullable<PointManagementFilterFormValues['issue_date_preset']>, '' | 'custom'>,
      { dateFrom: string; dateTo: string }
    > = {
      today: { dateFrom: today, dateTo: today },
      yesterday: { dateFrom: yesterday, dateTo: yesterday },
      '1w': { dateFrom: formatDateOnly(subtractDays(nowDate, 6)) ?? '', dateTo: today },
      '1m': { dateFrom: formatDateOnly(subtractDays(nowDate, 29)) ?? '', dateTo: today },
      '3m': { dateFrom: formatDateOnly(subtractDays(nowDate, 89)) ?? '', dateTo: today },
      '6m': { dateFrom: formatDateOnly(subtractDays(nowDate, 179)) ?? '', dateTo: today },
    };

    const range = presetRangeMap[preset];
    handleHistoryFilterChange({
      ...current,
      page: 1,
      issue_date_preset: preset,
      date_from: range.dateFrom,
      date_to: range.dateTo,
    });
  };

  const handleSettingsSubmit = (values: PointSettingsFormValues) => {
    settingsMutation.mutate(values, {
      onSuccess: () => toast.success(t('page.customers.points.messages.settings_save_success')),
      onError: (error) => toast.error(getApiErrorMessage(error, t('page.customers.points.messages.settings_save_failed'))),
    });
  };

  const handlePointAdjustmentSubmit = async (values: PointManualAdjustmentFormValues) => {
    try {
      await adjustmentMutation.mutateAsync(values);
      toast.success(t('page.customers.points.messages.manual_action_success'));
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('page.customers.points.messages.manual_action_failed')));
      throw error;
    }
  };

  return (
    <PageContainer>
      <div>
        <h1 className='text-xl font-semibold'>{t('page.customers.points.title')}</h1>
        <p className='text-muted-foreground text-sm'>{t('page.customers.points.description')}</p>
      </div>

      <Separator />

      <div className='flex flex-wrap gap-2'>
        <AppButton
          type='button'
          variant={activeTab === 'usage-history' ? 'default' : 'outline'}
          onClick={() => navigate({ search: (prev: CustomerPointsSearch) => ({ ...prev, tab: 'usage-history' }) })}
        >
          {t('page.customers.points.tabs.usage_history')}
        </AppButton>
        <AppButton
          type='button'
          variant={activeTab === 'point-setting' ? 'default' : 'outline'}
          onClick={() => navigate({ search: (prev: CustomerPointsSearch) => ({ ...prev, tab: 'point-setting' }) })}
        >
          {t('page.customers.points.tabs.point_setting')}
        </AppButton>
      </div>

      {activeTab === 'usage-history' ? (
        <>
          <PointManagementFilters value={filters} onChange={handleHistoryFilterChange} onPresetChange={handlePresetChange} />

          <section className='space-y-3'>
            <h2 className='text-sm font-semibold'>{t('page.customers.points.usage_history_title')}</h2>
            <PointHistoryTable
              items={historyQuery.data?.data.items ?? []}
              filters={filters}
              isLoading={historyQuery.isLoading}
              totalPage={historyQuery.data?.data.pagination.total_page ?? 0}
              totalItem={historyQuery.data?.data.pagination.total_item ?? 0}
              onChange={handleHistoryFilterChange}
            />
          </section>
        </>
      ) : (
        <>
          <PointSettingsForm
            settings={settingsQuery.data?.data.settings}
            key={JSON.stringify(settingsFormValues)}
            isPending={settingsMutation.isPending}
            onSubmit={handleSettingsSubmit}
          />

          {canManageAdminActions ? (
            <PointAdminActions isAdjustmentPending={adjustmentMutation.isPending} onAdjustmentSubmit={handlePointAdjustmentSubmit} />
          ) : null}

          <PolicyNotesSection
            sections={policySections}
            title={t('page.customers.points.policy.title')}
            description={t('page.customers.points.policy.description')}
          />
        </>
      )}
    </PageContainer>
  );
}
