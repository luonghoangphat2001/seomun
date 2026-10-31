import type { TFunction } from 'i18next';

import { AccessLogEventType } from '../enums';

export function buildAccessLogEventLabels(t: TFunction<'page'>): Record<AccessLogEventType, string> {
  return {
    [AccessLogEventType.LOGIN]: t('system_logs.access.event_type.login'),
    [AccessLogEventType.LOGOUT]: t('system_logs.access.event_type.logout'),
    [AccessLogEventType.LOGIN_FAILED]: t('system_logs.access.event_type.login_failed'),
  };
}
