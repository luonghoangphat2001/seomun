import type { BaseResponse, NumberOptions, PaginatedResponse, PaginationMeta, StringOptions } from '@/types/api';

import type { NotificationType } from '../../enums';
import type { NotificationSendingResult } from '../enums';

export interface NotificationDeliveryLogRESP {
  id: number;
  recipient_name: string;
  recipient_role: string;
  recipient_contact: string;
  message_title: string;
  notification_type: NotificationType;
  result: NotificationSendingResult;
  delivered_at: string;
  failure_reason: string | null;
}

export interface NotificationTemplate {
  id: number;
  name: string;
  template_number: string;
}

export interface NotificationSender {
  id: number;
  username: string;
  name: string;
}

export interface NotificationHistoryRESP {
  id: number;
  no: number;
  template: NotificationTemplate;
  notification_type: NotificationType;
  recipient_name: string;
  recipient_role: string;
  recipient_contact: string;
  sender_id: number;
  sender?: NotificationSender;
  sent_at: string;
  sending_result: NotificationSendingResult;
  message_title: string;
  total_recipients: number;
  success_count: number;
  failure_count: number;
  delivery_logs?: NotificationDeliveryLogRESP[];
}

export interface NotificationHistoryListDataWireRESP {
  histories: NotificationHistoryRESP[];
  pagination: PaginationMeta;
}

export type NotificationHistoryListWireRESP = BaseResponse<NotificationHistoryListDataWireRESP>;
export type NotificationHistoryListRESP = PaginatedResponse<NotificationHistoryRESP>;

export interface NotificationHistorySearchFiltersDataRESP {
  filters: {
    template_number_options: StringOptions[];
    notification_type_options: StringOptions[];
    recipient_name_options: StringOptions[];
    sending_result_options: StringOptions[];
    sender_options: NumberOptions[];
  };
}

export type NotificationHistorySearchFiltersRESP = BaseResponse<NotificationHistorySearchFiltersDataRESP>;

export interface NotificationHistoryResendRESP {
  success: boolean;
  message: string;
}
