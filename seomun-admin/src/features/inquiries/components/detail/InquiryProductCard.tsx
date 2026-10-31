import { useTranslation } from 'react-i18next';

import { Separator } from '@/components/ui/separator';
import { getLocalizedText, useProductDetailQuery, type ProductListLocale } from '@/features/products/management';

import type { InquiryDetailDTO } from '../../types';

function normalizeLocale(language?: string): ProductListLocale {
  return language?.startsWith('ko') ? 'ko' : 'en';
}

export function InquiryProductCard({ data }: { data: InquiryDetailDTO }) {
  const { t: tRaw, i18n } = useTranslation();
  const t = tRaw as (key: string, options?: Record<string, unknown>) => string;

  // === Variables ===
  const product = data.product;

  const { data: detailResp } = useProductDetailQuery(String(product?.id ?? ''), { enabled: !!product?.id });
  const detail = detailResp?.data.product;
  const locale = normalizeLocale(i18n.language);
  const image = detail?.first_image || detail?.images?.[0] || null;

  // === JSX ===
  if (!product) return null;

  return (
    <section className='bg-card rounded-xl border'>
      <div className='px-6 py-4'>
        <h2 className='text-sm font-semibold'>{t('page.inquiries.detail.product_info')}</h2>
      </div>
      <Separator />
      <div className='space-y-3 p-6'>
        {image && (
          <div className='mb-1 flex justify-center'>
            <img src={image} alt={product.name} className='h-24 w-24 rounded-lg border object-cover' />
          </div>
        )}
        <Info label={t('page.inquiries.detail.product_code')} value={detail?.sku || product.sku || '-'} />
        <Info label={t('page.inquiries.detail.product_name')} value={detail ? getLocalizedText(detail.name, locale) : product.name} />
        <Info label={t('page.inquiries.detail.product_category')} value={detail ? getLocalizedText(detail.category?.name, locale) : '-'} />
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-start justify-between gap-3 text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='text-right font-medium'>{value}</span>
    </div>
  );
}
