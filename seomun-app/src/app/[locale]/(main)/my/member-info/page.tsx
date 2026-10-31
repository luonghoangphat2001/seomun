import MyMemberInfoComponent from '@/components/ui/my/member-info';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('member_info.title'), description: t('member_info.description') };
}

const MyMemberInfoPage = () => {
  return <MyMemberInfoComponent />;
};

export default MyMemberInfoPage;
