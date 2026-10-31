import { z } from 'zod';

import { SortOrder } from '@/enums';

import type { NotificationTemplateDetailRESP, NotificationTemplateRESP } from '../api';
import { NotificationType } from '../../enums';
import { NotificationTemplateSortField, NotificationTriggerType, NotificationUsageStatus } from '../enums';

export const notificationTemplateListSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  per_page: z.coerce.number().int().min(1).optional().catch(undefined),
  sort_by: z.enum(NotificationTemplateSortField).optional().catch(undefined),
  sort_order: z.enum(SortOrder).optional().catch(undefined),
  template_name: z.coerce.string().optional().catch(undefined),
  template_number: z.coerce.string().optional().catch(undefined),
  notification_type: z.enum(NotificationType).optional().catch(undefined),
  usage_status: z.enum(NotificationUsageStatus).optional().catch(undefined),
  registrant_id: z.coerce.number().int().positive().optional().catch(undefined),
});

export type NotificationTemplateListSearch = z.infer<typeof notificationTemplateListSearchSchema>;

export type NotificationTemplateSearchFilterValues = Pick<
  NotificationTemplateListSearch,
  'template_name' | 'template_number' | 'notification_type' | 'usage_status' | 'registrant_id'
>;

export const EMPTY_NOTIFICATION_TEMPLATE_SEARCH_FILTER_VALUES: NotificationTemplateSearchFilterValues = {
  template_name: undefined,
  template_number: undefined,
  notification_type: undefined,
  usage_status: undefined,
  registrant_id: undefined,
};

const notificationTemplateEmailConfigSchema = z.object({
  title: z.string().trim(),
  body: z.string().trim(),
  sender_email_address: z.string().trim(),
  variables_input: z.string().trim(),
});

const notificationTemplateSmsConfigSchema = z.object({
  content: z.string().trim(),
  sender_number: z.string().trim(),
  variables_input: z.string().trim(),
});

const notificationTemplateNotificationTalkConfigSchema = z.object({
  content: z.string().trim(),
  sender_number: z.string().trim(),
  variables_input: z.string().trim(),
});

export const notificationTemplateFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Template name is required.'),
    template_number: z.string().trim().min(1, 'Template number is required.'),
    trigger_type: z.enum(NotificationTriggerType),
    usage_status: z.enum(NotificationUsageStatus),
    channel_types: z.array(z.enum(NotificationType)).min(1, 'Select at least one channel.').max(3, 'Up to three channels can be enabled.'),
    channel_configs: z.object({
      email: notificationTemplateEmailConfigSchema,
      sms: notificationTemplateSmsConfigSchema,
      notification_talk: notificationTemplateNotificationTalkConfigSchema,
    }),
  })
  .superRefine((value, context) => {
    const uniqueChannelCount = new Set(value.channel_types).size;

    if (uniqueChannelCount !== value.channel_types.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Duplicate channels are not allowed.',
        path: ['channel_types'],
      });
    }

    if (value.channel_types.includes(NotificationType.EMAIL)) {
      if (!value.channel_configs.email.title) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Email title is required.',
          path: ['channel_configs', 'email', 'title'],
        });
      }

      if (!value.channel_configs.email.body) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Email body is required.',
          path: ['channel_configs', 'email', 'body'],
        });
      }

      if (!value.channel_configs.email.sender_email_address) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Sender email is required.',
          path: ['channel_configs', 'email', 'sender_email_address'],
        });
      } else if (!z.string().email().safeParse(value.channel_configs.email.sender_email_address).success) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Sender email must be a valid email address.',
          path: ['channel_configs', 'email', 'sender_email_address'],
        });
      }
    }

    if (value.channel_types.includes(NotificationType.SMS)) {
      if (!value.channel_configs.sms.content) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'SMS body is required.',
          path: ['channel_configs', 'sms', 'content'],
        });
      }

      if (!value.channel_configs.sms.sender_number) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Sender phone is required.',
          path: ['channel_configs', 'sms', 'sender_number'],
        });
      }
    }

    if (value.channel_types.includes(NotificationType.NOTIFICATION_TALK)) {
      if (!value.channel_configs.notification_talk.content) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Notification Talk body is required.',
          path: ['channel_configs', 'notification_talk', 'content'],
        });
      }

      if (!value.channel_configs.notification_talk.sender_number) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Sender number is required.',
          path: ['channel_configs', 'notification_talk', 'sender_number'],
        });
      }
    }
  });

export type NotificationTemplateFormValues = z.infer<typeof notificationTemplateFormSchema>;

export function createNotificationTemplateDefaultValues(): NotificationTemplateFormValues {
  return {
    name: '',
    template_number: '',
    trigger_type: NotificationTriggerType.MEMBERSHIP_LEVEL_UPGRADE,
    usage_status: NotificationUsageStatus.ENABLED,
    channel_types: [NotificationType.EMAIL],
    channel_configs: {
      email: {
        title: '',
        body: '',
        sender_email_address: '',
        variables_input: '',
      },
      sms: {
        content: '',
        sender_number: '',
        variables_input: '',
      },
      notification_talk: {
        content: '',
        sender_number: '',
        variables_input: '',
      },
    },
  };
}

export function mapNotificationTemplateToFormValues(template: NotificationTemplateRESP): NotificationTemplateFormValues {
  const defaults = createNotificationTemplateDefaultValues();

  return {
    name: template.name,
    template_number: template.template_number,
    trigger_type: template.trigger_event ?? defaults.trigger_type,
    usage_status: template.usage_status.value,
    channel_types: template.channel_types,
    channel_configs: {
      email: {
        title: template.channel_configs.email?.title ?? defaults.channel_configs.email.title,
        body: template.channel_configs.email?.body ?? defaults.channel_configs.email.body,
        sender_email_address: template.channel_configs.email?.sender_email_address ?? defaults.channel_configs.email.sender_email_address,
        variables_input: template.channel_configs.email?.variables?.join(', ') ?? defaults.channel_configs.email.variables_input,
      },
      sms: {
        content: template.channel_configs.sms?.content ?? defaults.channel_configs.sms.content,
        sender_number: template.channel_configs.sms?.sender_number ?? defaults.channel_configs.sms.sender_number,
        variables_input: template.channel_configs.sms?.variables?.join(', ') ?? defaults.channel_configs.sms.variables_input,
      },
      notification_talk: {
        content: template.channel_configs.notification_talk?.content ?? defaults.channel_configs.notification_talk.content,
        sender_number: template.channel_configs.notification_talk?.sender_number ?? defaults.channel_configs.notification_talk.sender_number,
        variables_input:
          template.channel_configs.notification_talk?.variables?.join(', ') ?? defaults.channel_configs.notification_talk.variables_input,
      },
    },
  };
}

export function mapNotificationTemplateDetailToFormValues(detail: NotificationTemplateDetailRESP): NotificationTemplateFormValues {
  return mapNotificationTemplateToFormValues(detail.data.template);
}
