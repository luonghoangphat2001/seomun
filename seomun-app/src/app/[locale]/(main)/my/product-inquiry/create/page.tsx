import { ProductInquiryCreate } from '@/components/ui/my/product-inquiry/ProductInquiryCreate';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('product_inquiry.title'), description: t('product_inquiry.description') };
}

const ProductInquiryCreatePage = () => {
  return <ProductInquiryCreate />;
};

export default ProductInquiryCreatePage;
