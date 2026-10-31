import MyCashReceipt from '@/components/ui/my/cash-receipt';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('cash_receipt.title'), description: t('cash_receipt.description') };
}

const MyCashReceiptPage = () => {
  return <MyCashReceipt />;
};

export default MyCashReceiptPage;
