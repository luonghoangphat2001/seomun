import MyTaxInvoice from '@/components/ui/my/tax-invoice';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('tax_invoice.title'), description: t('tax_invoice.description') };
}

const MyTaxInvoicePage = () => {
  return <MyTaxInvoice />;
};

export default MyTaxInvoicePage;
