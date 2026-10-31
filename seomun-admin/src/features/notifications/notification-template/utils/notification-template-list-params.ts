import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '@/constants/pagination';
import { SortOrder } from '@/enums';

import type { NotificationTemplateCreateREQ, NotificationTemplateListREQ, NotificationTemplateUpdateREQ } from '../api';
import { NotificationType } from '../../enums';
import type { NotificationTemplateFormValues, NotificationTemplateListSearch } from '../schemas';

export type NormalizedNotificationTemplateListParams = NotificationTemplateListREQ & Required<Pick<NotificationTemplateListREQ, 'page' | 'per_page'>>;

export function buildNotificationTemplateListParams(search: NotificationTemplateListSearch): NormalizedNotificationTemplateListParams {
  return {
    ...search,
    template_name: search.template_name,
    template_number: search.template_number,
    registrant_id: search.registrant_id,
    sort_order: search.sort_by ? (search.sort_order ?? SortOrder.ASC) : undefined,
    page: search.page ?? DEFAULT_PAGE,
    per_page: search.per_page ?? DEFAULT_PER_PAGE,
  };
}

function normalizeVariables(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildNotificationTemplateCreatePayload(values: NotificationTemplateFormValues): NotificationTemplateCreateREQ {
  return {
    name: values.name.trim(),
    template_number: values.template_number.trim(),
    trigger_event: values.trigger_type,
    usage_status: values.usage_status,
    channel_configs: {
      ...(values.channel_types.includes(NotificationType.EMAIL)
        ? {
            email: {
              title: values.channel_configs.email.title.trim(),
              body: values.channel_configs.email.body.trim(),
              sender_email_address: values.channel_configs.email.sender_email_address.trim(),
              variables: normalizeVariables(values.channel_configs.email.variables_input),
            },
          }
        : {}),
      ...(values.channel_types.includes(NotificationType.SMS)
        ? {
            sms: {
              content: values.channel_configs.sms.content.trim(),
              sender_number: values.channel_configs.sms.sender_number.trim(),
              variables: normalizeVariables(values.channel_configs.sms.variables_input),
            },
          }
        : {}),
      ...(values.channel_types.includes(NotificationType.NOTIFICATION_TALK)
        ? {
            notification_talk: {
              content: values.channel_configs.notification_talk.content.trim(),
              sender_number: values.channel_configs.notification_talk.sender_number.trim(),
              variables: normalizeVariables(values.channel_configs.notification_talk.variables_input),
            },
          }
        : {}),
    },
  };
}

export function buildNotificationTemplateUpdatePayload(values: NotificationTemplateFormValues): NotificationTemplateUpdateREQ {
  return buildNotificationTemplateCreatePayload(values);
}
