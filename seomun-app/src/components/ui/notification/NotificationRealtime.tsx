'use client';

import { NOTIFICATION_QUERY_KEYS } from '@/apis/my/notification/notification.query';
import { NotificationCreatedEventRESP } from '@/apis/my/notification/notification.response';
import { transformNotificationRESPToItem } from '@/apis/my/notification/notification.service';
import { isEchoEnabled, setupEcho, teardownEcho } from '@/config/echo';
import { useAuthStore, useOpenNotification } from '@/hooks';
import { NotificationItem } from '@/types/notification';
import { useConnectionStatus, useEcho } from '@laravel/echo-react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

interface NotificationToastProps {
  item: NotificationItem;
  onView: () => void;
}

const NotificationToast = ({ item, onView }: NotificationToastProps) => {
  const t = useTranslations('notification');

  return (
    <div className='flex items-start gap-3'>
      <div className='min-w-0'>
        <p className='text-text-main font-semibold'>{item.title}</p>
        <p className='text-text-secondary line-clamp-2'>{item.message}</p>
      </div>
      {item.link && (
        <button
          type='button'
          onClick={onView}
          className='text-text-brand hover:text-primary-600 shrink-0 cursor-pointer font-semibold transition-colors'>
          {t('view')}
        </button>
      )}
    </div>
  );
};

const NotificationListener = ({ userId }: { userId: number }) => {
  setupEcho();

  const queryClient = useQueryClient();
  const openNotification = useOpenNotification();
  //reads the latest router/pathname through a ref
  const openRef = useRef(openNotification);
  useEffect(() => {
    openRef.current = openNotification;
  });

  useEcho<NotificationCreatedEventRESP>(`member.notifications.${userId}`, '.notification.created', ({ notification }) => {
    const item = transformNotificationRESPToItem({ ...notification, is_read: notification.read_at !== null });

    toast(
      (currentToast) => (
        <NotificationToast
          item={item}
          onView={() => {
            toast.dismiss(currentToast.id);
            openRef.current(item);
          }}
        />
      ),
      {
        id: item.id,
        duration: 5000,
        style: {
          background: '#fff',
          color: 'var(--color-text-main)',
          border: '1px solid var(--color-border-soft)',
          borderLeft: '4px solid var(--color-primary-500)',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        },
      },
    );
    void queryClient.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEYS.LIST] });
  });

  const status = useConnectionStatus();
  const hasConnected = useRef(false);
  useEffect(() => {
    if (status !== 'connected') return;
    if (hasConnected.current) void queryClient.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEYS.LIST] });
    hasConnected.current = true;
  }, [status, queryClient]);

  return null;
};

export const NotificationRealtime = () => {
  const userId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    if (!userId) teardownEcho();
  }, [userId]);

  if (!userId || !isEchoEnabled) return null;

  return <NotificationListener key={userId} userId={userId} />;
};
