import MyProofConfirmComponent from '@/components/ui/my/proof-confirm';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('proof_confirm.title'), description: t('proof_confirm.description') };
}

const MyProofConfirmPage = () => {
  return <MyProofConfirmComponent />;
};

export default MyProofConfirmPage;
