'use client';

import { SafeImage } from '@/components/common';
import { DesignSourceType } from '@/enums/common';
import { Link } from '@/i18n/navigation';
import { handleFileDownload } from '@/lib/utils';
import { ROUTES } from '@/routes';
import { MyEditorType } from '@/types';

type EditorCardListProps = {
  designs: MyEditorType[];
};

const EditorCardList = ({ designs }: EditorCardListProps) => {
  const handleCardClick = (design: MyEditorType) => {
    if (design.sourceType === DesignSourceType.WEB_EDITOR && design.productSlug && design.designGroupId) {
      const params = new URLSearchParams({
        product: design.productSlug,
        design_group_id: design.designGroupId,
      });
      window.open(`${ROUTES.WEB_EDITOR.INDEX}?${params.toString()}`, '_blank', 'noopener,noreferrer');
      return;
    }

    if (design.sourceType === DesignSourceType.UPLOAD_FILE && design.upload_artwork) {
      void handleFileDownload(design.upload_artwork.url, design.upload_artwork.name);
    }
  };

  return (
    <div className='mt-6 grid grid-cols-2 gap-x-3 gap-y-4 md:mt-12 md:gap-6 lg:grid-cols-3 xl:grid-cols-4'>
      {designs.map((design) => {
        const isClickable =
          (design.sourceType === DesignSourceType.WEB_EDITOR && Boolean(design.productSlug && design.designGroupId)) ||
          (design.sourceType === DesignSourceType.UPLOAD_FILE && Boolean(design.upload_artwork));

        return (
          <div key={design.id}>
            <button
              type='button'
              onClick={() => handleCardClick(design)}
              disabled={!isClickable}
              className={isClickable ? 'w-full cursor-pointer text-left' : 'w-full cursor-default text-left'}>
              <div className='border-border-soft flex h-27.5 w-full items-center justify-center border md:h-47'>
                <SafeImage
                  src={design.thumbnailUrl}
                  width={188}
                  height={283}
                  alt={design.name}
                  className='h-3/4 w-3/4 object-contain'
                />
              </div>
              <p className='title-16 mt-2 underline'>{design.name}</p>
            </button>
            {design.productName && design.productSlug && (
              <Link
                href={ROUTES.PRODUCT.DETAIL(design.productSlug)}
                className='body-14 text-text-brand block w-fit hover:underline'>
                {design.productName}
              </Link>
            )}
            <p className='body-14 text-text-secondary'>{design.created_at}</p>
          </div>
        );
      })}
    </div>
  );
};

export default EditorCardList;
