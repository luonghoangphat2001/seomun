import ProductSearch from '@/components/ui/search';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('home.title'), description: t('home.description') };
}

const SearchPage = () => {
  return (
    <main className='md:pt-2'>
      <ProductSearch />
    </main>
  );
};

export default SearchPage;
