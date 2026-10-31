import type { TFunction } from 'i18next';

import type { AppSelectOption } from '@/components/shared/app-select';
import { NotificationType } from '../../enums';
import { NotificationTriggerType, NotificationUsageStatus } from '../enums';

export function buildNotificationTemplateChannelLabels(t: TFunction<'page'>): Record<NotificationType, string> {
  return {
    [NotificationType.EMAIL]: t('notifications.channel_type.email'),
    [NotificationType.NOTIFICATION_TALK]: t('notifications.channel_type.notification_talk'),
    [NotificationType.SMS]: t('notifications.channel_type.sms'),
  };
}

export function buildNotificationTemplateUsageStatusLabels(t: TFunction<'page'>): Record<NotificationUsageStatus, string> {
  return {
    [NotificationUsageStatus.ENABLED]: t('notifications.templates.usage_status.enabled'),
    [NotificationUsageStatus.DISABLED]: t('notifications.templates.usage_status.disabled'),
  };
}

export function buildNotificationTemplateTriggerTypeLabels(t: TFunction<'page'>): Record<NotificationTriggerType, string> {
  return {
    [NotificationTriggerType.ORDER_PLACED]: t('notifications.templates.trigger_type.order_placed'),
    [NotificationTriggerType.ORDER_STATUS_CHANGED]: t('notifications.templates.trigger_type.order_status_changed'),
    [NotificationTriggerType.PAYMENT_COMPLETED]: t('notifications.templates.trigger_type.payment_completed'),
    [NotificationTriggerType.PAYMENT_FAILED]: t('notifications.templates.trigger_type.payment_failed'),
    [NotificationTriggerType.REFUND_PROCESSED]: t('notifications.templates.trigger_type.refund_processed'),
    [NotificationTriggerType.DESIGN_CONFIRMATION_REQUEST]: t('notifications.templates.trigger_type.design_confirmation_request'),
    [NotificationTriggerType.DESIGN_REJECTED]: t('notifications.templates.trigger_type.design_rejected'),
    [NotificationTriggerType.SHIPMENT_STARTED]: t('notifications.templates.trigger_type.shipment_started'),
    [NotificationTriggerType.MEMBERSHIP_LEVEL_UPGRADE]: t('notifications.templates.trigger_type.membership_level_upgrade'),
    [NotificationTriggerType.INQUIRY_ANSWERED]: t('notifications.templates.trigger_type.inquiry_answered'),
    [NotificationTriggerType.CUSTOMER_APPROVED]: t('notifications.templates.trigger_type.customer_approved'),
  };
}

export function getNotificationTemplateChannelOptions(t: TFunction<'page'>): AppSelectOption<NotificationType>[] {
  const labels = buildNotificationTemplateChannelLabels(t);
  return Object.values(NotificationType).map((value) => ({ value, label: labels[value] }));
}

const CHANNEL_TYPE_ORDER = Object.values(NotificationType);

export function sortNotificationChannelTypes(channels: NotificationType[]): NotificationType[] {
  return [...channels].sort((a, b) => CHANNEL_TYPE_ORDER.indexOf(a) - CHANNEL_TYPE_ORDER.indexOf(b));
}

export function getNotificationTemplateUsageStatusOptions(t: TFunction<'page'>): AppSelectOption<NotificationUsageStatus>[] {
  const labels = buildNotificationTemplateUsageStatusLabels(t);
  return Object.values(NotificationUsageStatus).map((value) => ({ value, label: labels[value] }));
}

export function getNotificationTemplateTriggerTypeOptions(t: TFunction<'page'>): AppSelectOption<NotificationTriggerType>[] {
  const labels = buildNotificationTemplateTriggerTypeLabels(t);
  return Object.values(NotificationTriggerType).map((value) => ({ value, label: labels[value] }));
}

export function getNotificationTemplateChannelLabel(t: TFunction<'page'>, value: NotificationType) {
  return buildNotificationTemplateChannelLabels(t)[value] ?? value;
}

export function getNotificationTemplateUsageStatusLabel(t: TFunction<'page'>, value: NotificationUsageStatus) {
  return buildNotificationTemplateUsageStatusLabels(t)[value] ?? value;
}
