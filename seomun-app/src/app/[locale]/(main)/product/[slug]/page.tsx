import { ProductApi } from '@/apis/product/product.api';
import { ProductDetail } from '@/components/ui/product';
import { ImportantNotes } from '@/components/ui/product/ImportantNotes';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  try {
    const response = await ProductApi.getProductDetail(slug);
    const product = response.data.product;
    const productName = product.name[locale as keyof typeof product.name] || product.name.ko || product.name.en;
    const productDescription = product.short_description || t('product.description');

    return { title: productName, description: productDescription };
  } catch {
    return { title: t('product.title'), description: t('product.description') };
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  let productData;

  try {
    const response = await ProductApi.getProductDetail(slug);
    productData = response.data.product;
  } catch (error) {
    console.error('Error fetching product:', error);
    notFound();
  }

  if (!productData) {
    notFound();
  }

  return (
    <main className='space-y-3 bg-gray-50 pb-3 md:space-y-20 md:bg-white md:pt-4 md:pb-30'>
      <ProductDetail product={productData} />
      <ImportantNotes productSlug={productData.slug} />
    </main>
  );
}
