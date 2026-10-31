'use client';

import { useBoardNoticeConfigQuery } from '@/apis/board-notice-config/board-notice-config.query';
import { RichText } from '@/components/common';
import { mySidebarMenu } from '@/constants/sidebar';
import { useTranslations } from 'next-intl';
import { useParams, usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';
import NoticeCollapse from './NoticeCollapse';

const myMenuItems = mySidebarMenu.flatMap((group) => group.items);

// Rich-text editors leave empty markup (e.g. '<p></p>') when a message is cleared; treat that like null.
const hasNoticeContent = (html: string | null): html is string =>
  !!html && html.replace(/<[^>]*>/g, '').replace(/&nbsp;|\s/g, '').length > 0;

/** Renders the admin-configured notice below the page when the current board has it enabled. */
const BoardNoticeGate = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations();
  // '/ko/my/cart' → '/my/cart'
  const strippedPath = pathname.replace(`/${locale}`, '') || '/';
  const boardType = myMenuItems.find((item) => strippedPath.startsWith(item.link))?.boardType;
  const { data: config } = useBoardNoticeConfigQuery(boardType);

  return (
    <>
      {children}
      {config?.notice_enabled && hasNoticeContent(config.notice_message) && (
        <div className='mt-4'>
          <NoticeCollapse title={t('common.notice')}>
            <RichText content={config.notice_message} className='body-14' />
          </NoticeCollapse>
        </div>
      )}
    </>
  );
};

export default BoardNoticeGate;
