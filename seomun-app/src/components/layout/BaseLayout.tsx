import { IntErrorProvider } from '@/providers';
import ReactQueryClientProvider from '@/providers/ReactQueryClientProvider';
import { getMessages, getTimeZone } from 'next-intl/server';
import { ReactNode } from 'react';
import { NavigationScrollTop, Toaster } from '../common';
import { NotificationRealtime } from '../ui/notification';

export interface LayoutProps {
  children: ReactNode;
  locale: string;
}

export const BaseLayout = async ({ children, locale }: Readonly<LayoutProps>) => {
  const messages = await getMessages();
  const timeZone = await getTimeZone();

  return (
    <IntErrorProvider timeZone={timeZone} locale={locale} messages={messages}>
      <ReactQueryClientProvider>
        <NavigationScrollTop />
        <NotificationRealtime />
        {children}
      </ReactQueryClientProvider>
      <Toaster />
    </IntErrorProvider>
  );
};
