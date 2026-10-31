import { Announcement } from '@/components/ui/customer-service/annoucement';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('announcement.title'), description: t('announcement.description') };
}

const AnnouncementPage = () => {
  return <Announcement />;
};

export default AnnouncementPage;
