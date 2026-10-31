import type { BaseResponse, NumberOptions, PaginationMeta, StringOptions } from '@/types/api';

import type { NotificationType } from '../../enums';
import type { NotificationTriggerType, NotificationUsageStatus } from '../enums';

export interface NotificationTemplateSearchFiltersDataRESP {
  filters: {
    template_name_options: StringOptions[];
    template_number_options: StringOptions[];
    notification_type_options: {
      value: NotificationType;
      label: string;
    }[];
    usage_status_options: {
      value: NotificationUsageStatus;
      label: string;
    }[];
    registrant_options: NumberOptions[];
  };
}

export type NotificationTemplateSearchFiltersRESP = BaseResponse<NotificationTemplateSearchFiltersDataRESP>;

export interface NotificationTemplateUsageStatusRESP {
  value: NotificationUsageStatus;
  label: string;
}

export interface NotificationTemplateRegistrantRESP {
  id: number;
  username: string;
  name: string;
}

export interface NotificationTemplateEmailConfigRESP {
  title: string;
  body: string;
  sender_email_address: string;
  variables?: string[];
}

export interface NotificationTemplateSmsConfigRESP {
  content: string;
  sender_number: string;
  variables?: string[];
}

export interface NotificationTemplateNotificationTalkConfigRESP {
  content: string;
  sender_number: string;
  variables?: string[];
}

export interface NotificationTemplateChannelConfigsRESP {
  email?: NotificationTemplateEmailConfigRESP | null;
  sms?: NotificationTemplateSmsConfigRESP | null;
  notification_talk?: NotificationTemplateNotificationTalkConfigRESP | null;
}

export interface NotificationTemplateRESP {
  id: number;
  name: string;
  template_number: string;
  trigger_event: NotificationTriggerType | null;
  trigger_event_label: string | null;
  channel_types: NotificationType[];
  channel_configs: NotificationTemplateChannelConfigsRESP;
  usage_status: NotificationTemplateUsageStatusRESP;
  registrant: NotificationTemplateRegistrantRESP;
  created_at: string;
  updated_at: string;
}

export type NotificationTemplateListRESP = BaseResponse<{
  templates: NotificationTemplateRESP[];
  pagination: PaginationMeta;
}>;

export type NotificationTemplateDetailRESP = BaseResponse<{
  template: NotificationTemplateRESP;
}>;

export type CreateNotificationTemplateRESP = BaseResponse<{
  template: NotificationTemplateRESP;
}>;

export type UpdateNotificationTemplateRESP = BaseResponse<{
  template: NotificationTemplateRESP;
}>;

export type DeleteNotificationTemplateRESP = BaseResponse<{
  message: string;
}>;

export type ToggleNotificationTemplateStatusRESP = BaseResponse<{
  template: NotificationTemplateRESP;
}>;

export type CopyNotificationTemplateRESP = BaseResponse<{
  template: NotificationTemplateRESP;
}>;
