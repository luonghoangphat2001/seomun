import { MyNotice } from '@/components/ui/my/notice';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('my_notice.title'), description: t('my_notice.description') };
}

const NoticePage = () => {
  return <MyNotice />;
};

export default NoticePage;
