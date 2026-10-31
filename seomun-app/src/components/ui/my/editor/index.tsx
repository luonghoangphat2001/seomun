'use client';

import { useTranslations } from 'next-intl';
import EditorCategoryTabs from './EditorCategoryTabs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Select } from '@/components/common';
import EditorCardList from './EditorCardList';
import { useMediaQuery } from '@/hooks';
import PageTitle from '../components/PageTitle';
import { useDesignAvailableSizesQuery, useDesignsListQuery } from '@/apis/my/designs/designs.query';
import { DesignItemRESP } from '@/apis/my/designs/designs.response';
import { MyEditorType } from '@/types';
import Loading from '@/components/common/loading';
import { DesignSourceType } from '@/enums/common';
import { formatDate } from '@/lib/utils';
import { DATE_FORMAT } from '@/constants/common';

const transformDesignToEditor = (design: DesignItemRESP): MyEditorType => ({
  id: design.id,
  name: design.title || design.design_title || `#${design.id}`,
  thumbnailUrl:
    design.preview?.front?.preview_path ||
    design.artworks?.front?.preview_image_path ||
    design.preview?.back?.preview_path ||
    design.artworks?.back?.preview_image_path ||
    design.preview?.front?.preview_url ||
    design.logo?.front?.logo_url ||
    design.preview?.back?.preview_url ||
    design.logo?.back?.logo_url ||
    '',
  categoryId: 0,
  created_at: formatDate(design.created_at, DATE_FORMAT.DATE_HOUR_MINUTE),
  productSlug: design.product_slug,
  productName: design.product_name?.ko,
  designGroupId: String(design.id),
  sourceType: design.source_type,
  upload_artwork: design.upload_artwork,
});

const MyEditorComponent = () => {
  const t = useTranslations();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [sourceType, setSourceType] = useState<DesignSourceType | 'all'>('all');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useDesignsListQuery({
    sort_by: 'created_at',
    sort_order: 'desc',
    per_page: 15,
    page: 1,
    size_id: sourceType === DesignSourceType.UPLOAD_FILE ? undefined : selectedSize || undefined,
    ...(sourceType === 'all' ? {} : { source_type: sourceType }),
  });
  const { data: availableSizes } = useDesignAvailableSizesQuery();

  const designResponse = data?.pages.flatMap((page) => page.data.designs) ?? [];

  const dataDesign = useMemo(() => {
    return designResponse.map(transformDesignToEditor);
  }, [designResponse]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        fetchNextPage();
      }
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div>
      <PageTitle title={t('sidebar.items.editor')} containerClassName='mb-3 md:mb-6' />
      <EditorCategoryTabs sourceType={sourceType} onChangeSourceType={setSourceType} />
      {sourceType !== DesignSourceType.UPLOAD_FILE && (
        <div className='mt-3 flex items-center gap-3 md:mt-12'>
          <Select
            options={[{ label: t('common.entire'), value: '' }, ...(availableSizes ?? [])]}
            value={selectedSize}
            onChange={(value) => setSelectedSize(String(value))}
            label={t('common.specification')}
            labelPlacement={isDesktop ? 'left' : 'top'}
            className='max-w-140.75'
            placeholder='-'
            labelClassname='body-16'
          />
        </div>
      )}
      {isLoading ? <Loading /> : <EditorCardList designs={dataDesign} />}
      {hasNextPage && (
        <div ref={loadMoreRef} className='h-px w-full'>
          {isFetchingNextPage && <Loading />}
        </div>
      )}
    </div>
  );
};

export default MyEditorComponent;
