import type { PaginationRequest, SortRequest } from '@/types/api';

import type { NotificationType } from '../../enums';
import type { NotificationTemplateSortField, NotificationTriggerType, NotificationUsageStatus } from '../enums';

export interface NotificationTemplateListREQ extends PaginationRequest, SortRequest<NotificationTemplateSortField> {
  template_name?: string;
  template_number?: string;
  notification_type?: NotificationType;
  usage_status?: NotificationUsageStatus;
  registrant_id?: number;
}

export interface NotificationTemplateEmailConfigREQ {
  title: string;
  body: string;
  sender_email_address: string;
  variables: string[];
}

export interface NotificationTemplateSmsConfigREQ {
  content: string;
  sender_number: string;
  variables: string[];
}

export interface NotificationTemplateNotificationTalkConfigREQ {
  content: string;
  sender_number: string;
  variables: string[];
}

export interface NotificationTemplateChannelConfigsREQ {
  email?: NotificationTemplateEmailConfigREQ;
  sms?: NotificationTemplateSmsConfigREQ;
  notification_talk?: NotificationTemplateNotificationTalkConfigREQ;
}

export interface NotificationTemplateCreateREQ {
  name: string;
  template_number: string;
  trigger_event: NotificationTriggerType;
  usage_status: NotificationUsageStatus;
  channel_configs: NotificationTemplateChannelConfigsREQ;
}

export type NotificationTemplateUpdateREQ = Partial<NotificationTemplateCreateREQ>;

export interface NotificationTemplateToggleStatusREQ {
  usage_status: NotificationUsageStatus;
}
