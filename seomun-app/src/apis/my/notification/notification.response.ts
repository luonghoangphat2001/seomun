export type NotificationDataRESP = {
  title: string;
  message: string;
  link?: string | null;
  payload?: Record<string, unknown>;
};

export type NotificationRESP = {
  id: string;
  type: string;
  data: NotificationDataRESP;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

export type NotificationCreatedEventRESP = {
  notification_id: string;
  notification: Omit<NotificationRESP, 'is_read'>;
  unread_count: number;
};

export type NotificationListRESP = {
  notifications: NotificationRESP[];
  unread_count: number;
};

export type NotificationReadRESP = {
  notification: NotificationRESP;
  unread_count: number;
};

export type NotificationReadAllRESP = {
  updated_count: number;
  unread_count: number;
};
