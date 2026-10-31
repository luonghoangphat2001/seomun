'use client';

import { ReactNode } from 'react';

import { AbstractIntlMessages, IntlError, NextIntlClientProvider } from 'next-intl';

export const IntErrorProvider = ({
  children,
  locale,
  timeZone,
  messages,
}: {
  children: ReactNode;
  locale: string;
  timeZone: string;
  messages: AbstractIntlMessages;
}) => {
  const onError = (error: IntlError) => {
    if (error.code === 'MISSING_MESSAGE') return;
    console.error(error);
  };
  return (
    <NextIntlClientProvider timeZone={timeZone} locale={locale} messages={messages} onError={onError}>
      {children}
    </NextIntlClientProvider>
  );
};
