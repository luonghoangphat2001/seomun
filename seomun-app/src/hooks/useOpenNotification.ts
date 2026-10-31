'use client';

import { useNotificationReadMutation } from '@/apis/my/notification/notification.query';
import { usePathname, useRouter } from '@/i18n/navigation';
import { NotificationItem } from '@/types/notification';

// Marks the item as read, then follows its link
export const useOpenNotification = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { mutateAsync: markAsRead } = useNotificationReadMutation();

  return (item: NotificationItem) => {
    const read = item.isRead
      ? Promise.resolve()
      : markAsRead(item.id).then(
          () => undefined,
          () => undefined,
        );
    const { link } = item;

    if (!link) return;
    if (link.startsWith('http')) {
      void read.then(() => window.location.assign(link));
      return;
    }
    if (link === pathname) {
      void read.then(() => window.location.reload());
      return;
    }
    router.push(link);
  };
};
