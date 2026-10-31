import type { AppSelectOption } from '@/components/shared/app-select';
import type { TFunction } from 'i18next';

import type { DashboardCustomerOption } from '../api';

export function buildCustomerOptions(customers: DashboardCustomerOption[] | undefined, t: TFunction): AppSelectOption<string>[] {
  return (customers ?? []).map((customer) => ({
    value: customer.id,
    label: customer.id === 'all' ? t('page.dashboard.filters.all_customers') : customer.name,
    description: customer.id === 'all' ? t('page.dashboard.filters.all_customer_manager') : customer.manager,
  }));
}
