export type NotificationCategory = 'ORDER' | 'INQUIRY' | 'SYSTEM';

export type NotificationItem = {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
};
