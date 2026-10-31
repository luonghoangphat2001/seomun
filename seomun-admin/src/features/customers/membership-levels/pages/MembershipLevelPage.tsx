import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';
import { useDebounce } from '@/hooks/use-debounce';
import { getApiErrorMessage } from '@/utils/api-error';

import { useCustomerListInfiniteQuery } from '../../list';
import { PolicyNotesSection } from '../../components/PolicyNotesSection';
import { getCustomerPolicySections, getMembershipPolicySections } from '../../utils/policy-notes';
import { CustomerMembershipOverrideForm } from '../components/CustomerMembershipOverrideForm';
import { MembershipLevelCard } from '../components/MembershipLevelCard';
import { MembershipLevelSummaryTable } from '../components/MembershipLevelSummaryTable';
import {
  useCustomerMembershipOverrideMutation,
  useMembershipLevelUpdateMutation,
  useMembershipLevelsQuery,
} from '../api/customer-membership-levels.query';
import type { CustomerMembershipOverrideFormValues } from '../schemas';
import type { MembershipLevelFormValues } from '../schemas';

export function MembershipLevelPage() {
  const { t } = useTranslation();
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const debouncedCustomerSearchTerm = useDebounce(customerSearchTerm);
  const levelsQuery = useMembershipLevelsQuery();
  const customersQuery = useCustomerListInfiniteQuery({ per_page: 20, search_term: debouncedCustomerSearchTerm || undefined });
  const customers = customersQuery.data?.pages.flatMap((page) => page.data.members) ?? [];
  const updateLevelMutation = useMembershipLevelUpdateMutation();
  const overrideMutation = useCustomerMembershipOverrideMutation();
  const policySections = getMembershipPolicySections(getCustomerPolicySections());

  const handleLevelSubmit = (levelId: number, values: MembershipLevelFormValues) => {
    updateLevelMutation.mutate(
      {
        level_id: levelId,
        name: values.name,
        condition_amount: values.promotion_threshold,
        accrual_rate: values.accrual_rate,
        free_shipping: values.free_shipping,
        is_active: values.is_active,
      },
      {
        onSuccess: () => toast.success(t('message.customers.membership_levels.update.success')),
        onError: (error) => toast.error(getApiErrorMessage(error, t('message.customers.membership_levels.update.error'))),
      },
    );
  };

  const handleOverrideSubmit = (values: CustomerMembershipOverrideFormValues) => {
    const tier = levelsQuery.data?.data.levels.find((level) => String(level.id) === values.tier_id);

    overrideMutation.mutate(
      {
        user_id: Number(values.customer_id),
        tier_id: Number(values.tier_id),
      },
      {
        onSuccess: () => toast.success(t('message.customers.membership_levels.override.success', { level: tier?.name ?? values.tier_id })),
        onError: (error) => toast.error(getApiErrorMessage(error, t('message.customers.membership_levels.override.error'))),
      },
    );
  };

  return (
    <PageContainer>
      <div>
        <h1 className='text-xl font-semibold'>{t('page.customers.membership_levels.title')}</h1>
        <p className='text-muted-foreground text-sm'>{t('page.customers.membership_levels.description')}</p>
      </div>

      <Separator />

      <div className='grid gap-4 xl:grid-cols-2'>
        {(levelsQuery.data?.data.levels ?? []).map((level) => (
          <MembershipLevelCard
            key={level.id}
            level={level}
            isPending={updateLevelMutation.isPending}
            onSubmit={(values) => handleLevelSubmit(level.id, values)}
          />
        ))}
      </div>

      <CustomerMembershipOverrideForm
        customers={customers}
        levels={levelsQuery.data?.data.levels ?? []}
        isCustomersFetching={customersQuery.isFetching}
        isCustomerFetchingNextPage={customersQuery.isFetchingNextPage}
        isPending={overrideMutation.isPending}
        onCustomerSearchValueChange={setCustomerSearchTerm}
        onCustomerReachEnd={() => {
          if (customersQuery.hasNextPage && !customersQuery.isFetchingNextPage) void customersQuery.fetchNextPage();
        }}
        onSubmit={handleOverrideSubmit}
      />

      <MembershipLevelSummaryTable levels={levelsQuery.data?.data.levels ?? []} />

      <PolicyNotesSection
        sections={policySections}
        title={t('page.customers.membership_levels.policy.title')}
        description={t('page.customers.membership_levels.policy.description')}
      />
    </PageContainer>
  );
}
