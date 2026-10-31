import ChannelTalk from '@/components/common/channel-talk';
import { BaseLayout } from '@/components/layout';
import { routing } from '@/i18n/routing';
import { hasLocale } from 'next-intl';
import { getLocale, setRequestLocale } from 'next-intl/server';
import localFont from 'next/font/local';
import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';

const notoSans = localFont({
  src: [
    { path: '../../../public/fonts/NotoSans-Thin.ttf', weight: '100', style: 'normal' },
    { path: '../../../public/fonts/NotoSans-ThinItalic.ttf', weight: '100', style: 'italic' },
    { path: '../../../public/fonts/NotoSans-ExtraLight.ttf', weight: '200', style: 'normal' },
    { path: '../../../public/fonts/NotoSans-ExtraLightItalic.ttf', weight: '200', style: 'italic' },
    { path: '../../../public/fonts/NotoSans-Light.ttf', weight: '300', style: 'normal' },
    { path: '../../../public/fonts/NotoSans-LightItalic.ttf', weight: '300', style: 'italic' },
    { path: '../../../public/fonts/NotoSans-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../../../public/fonts/NotoSans-Italic.ttf', weight: '400', style: 'italic' },
    { path: '../../../public/fonts/NotoSans-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../../../public/fonts/NotoSans-MediumItalic.ttf', weight: '500', style: 'italic' },
    { path: '../../../public/fonts/NotoSans-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../../../public/fonts/NotoSans-SemiBoldItalic.ttf', weight: '600', style: 'italic' },
    { path: '../../../public/fonts/NotoSans-Bold.ttf', weight: '700', style: 'normal' },
    { path: '../../../public/fonts/NotoSans-BoldItalic.ttf', weight: '700', style: 'italic' },
    { path: '../../../public/fonts/NotoSans-ExtraBold.ttf', weight: '800', style: 'normal' },
    { path: '../../../public/fonts/NotoSans-ExtraBoldItalic.ttf', weight: '800', style: 'italic' },
    { path: '../../../public/fonts/NotoSans-Black.ttf', weight: '900', style: 'normal' },
    { path: '../../../public/fonts/NotoSans-BlackItalic.ttf', weight: '900', style: 'italic' },
  ],
  variable: '--font-noto-sans',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
//   const { locale } = await params;
//   const t = await getTranslations({ locale, namespace: 'meta' });

//   return {
//     title: t('product'),
//     description: t('description'),
//   };
// }

export default async function LocaleLayout({ children }: PropsWithChildren) {
  const locale = await getLocale();
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html className={`${notoSans.variable} scrollbar-custom h-dvh`} lang={locale}>
      <body className='min-h-screen'>
        <BaseLayout locale={locale}>{children}</BaseLayout>
        <ChannelTalk />
      </body>
    </html>
  );
}
