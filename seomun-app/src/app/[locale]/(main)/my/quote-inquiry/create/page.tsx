import { QuoteInquiryCreate } from '@/components/ui/my/quote-inquiry/QuoteInquiryCreate';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('quote_inquiry.title'), description: t('quote_inquiry.description') };
}

const QuoteInquiryCreatePage = () => {
  return <QuoteInquiryCreate />;
};

export default QuoteInquiryCreatePage;
