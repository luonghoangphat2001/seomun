import type { TFunction } from 'i18next';

import { NotificationSendingResult } from '../enums';

export function getNotificationTypeLabel(t: TFunction<'page'>, value: string) {
  const labels: Record<string, string> = {
    email: t('notifications.channel_type.email'),
    notification_talk: t('notifications.channel_type.notification_talk'),
    sms: t('notifications.channel_type.sms'),
  };
  return labels[value] ?? value;
}

export function getNotificationSendingResultLabel(t: TFunction<'page'>, value: string) {
  const labels: Record<NotificationSendingResult, string> = {
    [NotificationSendingResult.SUCCESS]: t('notifications.history.sending_result.success'),
    [NotificationSendingResult.FAILURE]: t('notifications.history.sending_result.failure'),
  };
  return labels[value as NotificationSendingResult] ?? value;
}
