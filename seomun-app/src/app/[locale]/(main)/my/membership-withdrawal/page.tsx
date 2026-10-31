import MyMembershipWithdrawal from '@/components/ui/my/membership-withdrawal';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('membership_withdrawal.title'), description: t('membership_withdrawal.description') };
}

const MyMembershipWithdrawalPage = () => {
  return <MyMembershipWithdrawal />;
};

export default MyMembershipWithdrawalPage;
