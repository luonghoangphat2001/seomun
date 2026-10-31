'use client';

import { useNotificationListQuery, useNotificationReadAllMutation } from '@/apis/my/notification/notification.query';
import { Skeleton } from '@/components/common';
import { useAuthStore, useOpenNotification } from '@/hooks';
import { Headset, Notification, Order } from '@/icons';
import { cn } from '@/lib/utils';
import { NotificationCategory, NotificationItem } from '@/types/notification';
import { useFormatter, useNow, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

type NotificationTab = 'ALL' | NotificationCategory;

const TABS: NotificationTab[] = ['ALL', 'ORDER', 'INQUIRY'];

const LIST_PARAMS = { page: 1, per_page: 50 };

const CATEGORY_STYLES: Record<NotificationCategory, { icon: typeof Order; className: string }> = {
  ORDER: { icon: Order, className: 'bg-[#2176EF]/10 text-[#2176EF]' },
  INQUIRY: { icon: Headset, className: 'bg-text-brand-soft text-text-brand' },
  SYSTEM: { icon: Notification, className: 'bg-gray-100 text-text-secondary' },
};

interface NotificationRowProps {
  item: NotificationItem;
  now: Date;
  onClick: () => void;
}

const NotificationRow = ({ item, now, onClick }: NotificationRowProps) => {
  const format = useFormatter();
  const { icon: Icon, className } = CATEGORY_STYLES[item.category];

  return (
    <li>
      <button
        type='button'
        onClick={onClick}
        className={cn(
          'flex w-full cursor-pointer gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50',
          !item.isRead && 'bg-text-brand-soft/30',
        )}>
        <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', className)}>
          <Icon className='size-5' />
        </span>
        <span className='min-w-0 flex-1'>
          <span className='flex items-center gap-1.5'>
            <span className='title-14 text-text-main truncate'>{item.title}</span>
            {!item.isRead && <span className='bg-error size-1.5 shrink-0 rounded-full' />}
          </span>
          <span className='body-14 text-text-secondary line-clamp-2'>{item.message}</span>
          <span className='caption-12 text-text-third'>{format.relativeTime(new Date(item.createdAt), now)}</span>
        </span>
      </button>
    </li>
  );
};

interface NotificationPanelProps {
  list: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  onClose: () => void;
}

const NotificationPanel = ({ list, unreadCount, isLoading, onClose }: NotificationPanelProps) => {
  const t = useTranslations('notification');
  const now = useNow({ updateInterval: 60_000 });
  const [tab, setTab] = useState<NotificationTab>('ALL');
  const { mutate: readAll, isPending } = useNotificationReadAllMutation();
  const openNotification = useOpenNotification();

  const items = tab === 'ALL' ? list : list.filter((item) => item.category === tab);
  const hasUnread = (key: NotificationTab) =>
    key === 'ALL' ? unreadCount > 0 : list.some((item) => !item.isRead && item.category === key);

  return (
    <div
      role='dialog'
      aria-label={t('title')}
      className='border-border-soft absolute top-full right-0 z-50 mt-2 w-95 overflow-hidden rounded-lg border bg-white shadow-xl ring-1 ring-black/5 max-sm:fixed max-sm:inset-x-4 max-sm:top-14 max-sm:w-auto'>
      <div className='flex items-center justify-between gap-2 px-4 pt-4 pb-3'>
        <p className='title-16 text-text-main'>
          {t('title')}
          {unreadCount > 0 && <span className='text-text-brand ml-1.5'>{unreadCount}</span>}
        </p>
        {unreadCount > 0 && (
          <button
            type='button'
            disabled={isPending}
            onClick={() => readAll()}
            className='body-14 text-text-secondary hover:text-primary cursor-pointer transition-colors disabled:opacity-50'>
            {t('read_all')}
          </button>
        )}
      </div>

      <div role='tablist' className='border-border-soft flex gap-1 border-b px-3'>
        {TABS.map((key) => (
          <button
            key={key}
            type='button'
            role='tab'
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              'body-14 relative -mb-px cursor-pointer border-b-2 px-2 py-2 transition-colors',
              tab === key ? 'border-primary text-text-main font-semibold' : 'text-text-secondary border-transparent',
            )}>
            {t(`tabs.${key}`)}
            {hasUnread(key) && <span className='bg-error absolute top-1.5 right-0.5 size-1.5 rounded-full' />}
          </button>
        ))}
      </div>

      <div className='max-h-105 overflow-y-auto' data-lenis-prevent>
        {isLoading ? (
          <div className='space-y-3 p-4'>
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className='flex gap-3'>
                <Skeleton className='size-9 shrink-0 rounded-full' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-2/3' />
                  <Skeleton className='h-3 w-full' />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className='body-14 text-text-secondary py-12 text-center'>{t('empty')}</p>
        ) : (
          <ul className='divide-border-soft divide-y'>
            {items.map((item) => (
              <NotificationRow
                key={item.id}
                item={item}
                now={now}
                onClick={() => {
                  onClose();
                  openNotification(item);
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

interface NotificationBellProps {
  className?: string;
  iconClassName?: string;
}

export const NotificationBell = ({ className, iconClassName }: NotificationBellProps) => {
  const t = useTranslations('notification');
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useNotificationListQuery(LIST_PARAMS, { enabled: isAuthenticated });
  const unreadCount = data?.unreadCount ?? 0;

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className='relative inline-flex'>
      <button
        type='button'
        aria-label={t('title')}
        aria-haspopup='dialog'
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={cn('hover:text-primary relative cursor-pointer p-2 transition-colors', className)}>
        <Notification className={iconClassName} />
        {unreadCount > 0 && (
          <span className='bg-error absolute top-0 right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold text-white'>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationPanel
          list={data?.list ?? []}
          unreadCount={unreadCount}
          isLoading={isLoading}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
