import type { TFunction } from 'i18next';

import { UserLimitStatus } from '../enums';

export const USER_LIMIT_STATUS_LABELS: Record<UserLimitStatus, (t: TFunction<'page'>) => string> = {
  [UserLimitStatus.ACTIVE]: (t) => t('post_payment_limit.status.active', 'Active'),
  [UserLimitStatus.INACTIVE]: (t) => t('post_payment_limit.status.inactive', 'Inactive'),
};

export const USER_LIMIT_STATUS_STYLES: Record<UserLimitStatus, string> = {
  [UserLimitStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [UserLimitStatus.INACTIVE]: 'bg-gray-100 text-gray-700',
};
