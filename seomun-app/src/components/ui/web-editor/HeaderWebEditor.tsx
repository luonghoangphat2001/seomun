'use client';

import { Button, Input, ModalHandle } from '@/components/common';
import { useAuthStore, useWebEditorStore } from '@/hooks';
import { useRouter } from '@/i18n/navigation';
import { Pencil } from '@/icons';
import { ROUTES } from '@/routes';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useCreateDesignEditorMutation, useDesignDetailQuery, useUpdateDesignEditorMutation } from '@/apis/design/design.query';
import { useGetSizeOptionsByProductQuery, useProductBySlugQuery } from '@/apis/product/product.query';
import toast from 'react-hot-toast';
import { DesignFontWeight, DesignSide, DesignTextAlign, DesignType } from '@/enums/design';
import { ObjectType } from '@/enums/editor';
import { useUploadFileMutation } from '@/apis/file/file.query';
import { BackgroundObject, ErrorRESP } from '@/types';
import { DesignLayer } from '@/types/design';
import { AxiosError } from 'axios';
import { BannerSizeSelector } from './BannerSizeSelector';
import { ImportTemplateModal } from './ImportTemplateModal';

export const HeaderWebEditor = () => {
  const t = useTranslations('editor');
  const tCommon = useTranslations('common');

  const router = useRouter();
  const searchParams = useSearchParams();
  const product = searchParams.get('product');
  const designGroupId = Number(searchParams.get('design_group_id'));
  const hasDesignGroupId = Number.isInteger(designGroupId) && designGroupId > 0;
  const { data: productData } = useProductBySlugQuery(product ?? undefined);
  const { data: sizeOptions } = useGetSizeOptionsByProductQuery(productData?.id);
  const { data: designDetail } = useDesignDetailQuery(hasDesignGroupId ? designGroupId : undefined);
  const { user } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState<string>();
  const title = editedTitle ?? designDetail?.title ?? t('default_title');
  const importTemplateModalRef = useRef<ModalHandle>(null);

  const {
    openSlideshow,
    exportImages,
    isSlideshowLoading,
    templates,
    selectedTemplateId,
    selectedSizeOptionId,
    datas,
    bleedPx,
    customSizeMm,
    canvasSize,
  } = useWebEditorStore();
  const { mutateAsync: createDesignEditor, isPending: isCreating } = useCreateDesignEditorMutation();
  const { mutateAsync: updateDesignEditor, isPending: isUpdating } = useUpdateDesignEditorMutation();
  const { mutateAsync: uploadFile, isPending: isUploadingPreviews } = useUploadFileMutation();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasCanvasContent = datas.some(
    ({ objects, background }) =>
      objects.length > 0 || Boolean(background.backgroundImage) || background.backgroundColor.toLowerCase() !== '#ffffff',
  );

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    const params = new URLSearchParams();
    if (hasDesignGroupId) params.set('design_group_id', String(designGroupId));
    const query = params.toString();
    router.push(`${ROUTES.PRODUCT.DETAIL(product ?? '')}${query ? `?${query}` : ''}`);
  };

  const handleSave = async () => {
    const template = templates.find((item) => item.id === selectedTemplateId);
    if (!productData?.id || !user?.id || !product) {
      toast.error(t('save_requirements_missing'));
      return;
    }
    if (!hasCanvasContent) {
      toast.error(t('save_requires_canvas_content'));
      return;
    }
    try {
      const sides = datas.map((_, index) => (index === 0 ? DesignSide.FRONT : DesignSide.BACK));
      const originalLayersById = new Map(
        (designDetail?.artworks.flatMap((artwork) => artwork.layout_data.objects) ?? template?.layout_config?.layers ?? []).map(
          (layer) => [layer.id, layer],
        ),
      );
      const artworkLayers = datas.map((data, index) =>
        data.objects
          .slice()
          .sort((first, second) => first.zIndex - second.zIndex)
          .map((object) => toDesignLayer(object, sides[index], bleedPx, originalLayersById.get(object.id))),
      );
      const previews = await openSlideshow(false);
      if (!previews.length) {
        toast.error(t('preview_generation_failed'));
        return;
      }
      const cutlineImages = await exportImages(true);
      if (!cutlineImages.length) {
        toast.error(t('cutline_generation_failed'));
        return;
      }
      const artworkImagePaths = await Promise.all(
        sides.map(async (side, index) => {
          const preview = previews[index] ?? previews[0];
          const cutline = cutlineImages[index] ?? cutlineImages[0];
          const [previewBlob, cutlineBlob] = await Promise.all([
            fetch(preview).then((response) => response.blob()),
            fetch(cutline).then((response) => response.blob()),
          ]);
          const [previewResponse, cutlineResponse] = await Promise.all([
            uploadFile({
              type: 'designs',
              file: new File([previewBlob], `design-preview-${side}.png`, { type: previewBlob.type || 'image/png' }),
            }),
            uploadFile({
              type: 'designs',
              file: new File([cutlineBlob], `design-cutline-${side}.png`, { type: cutlineBlob.type || 'image/png' }),
            }),
          ]);

          return {
            previewImagePath: previewResponse.data.file.url,
            cutlineImageUrl: cutlineResponse.data.file.url,
          };
        }),
      );
      const artworkBackgrounds = await Promise.all(
        datas.map((data, index) => persistBackground(data.background, sides[index], uploadFile)),
      );
      const dpi = designDetail?.web_editor?.dpi || productData.web_editor?.dpi || template?.web_editor?.dpi || 200;
      const canvasWidthMm = ((canvasSize.width - bleedPx * 2) * 25.4) / dpi;
      const canvasHeightMm = ((canvasSize.height - bleedPx * 2) * 25.4) / dpi;
      const selectedSizeOption = sizeOptions?.find((option) => option.id === selectedSizeOptionId) ?? sizeOptions?.[0];

      const request = {
        user_id: user.id,
        product_id: productData.id,
        title: title.trim() || t('default_title'),
        size_option_id: template?.size_option_id ?? template?.size_option?.id ?? selectedSizeOption?.id ?? 0,
        width_mm:
          customSizeMm?.width ?? template?.size_option?.cutting_width ?? selectedSizeOption?.cutting_width ?? canvasWidthMm,
        height_mm:
          customSizeMm?.height ?? template?.size_option?.cutting_height ?? selectedSizeOption?.cutting_height ?? canvasHeightMm,
        artworks: sides.map((side, index) => ({
          side,
          layout_data: {
            background: artworkBackgrounds[index],
            objects: artworkLayers[index],
          },
          layout_s3_path: template?.file_path ?? '',
          preview_image_path: artworkImagePaths[index].previewImagePath,
          cutline_image_url: artworkImagePaths[index].cutlineImageUrl,
        })),
      };
      let savedDesignGroupId: number;
      if (hasDesignGroupId) {
        const artworkIdBySide = new Map(designDetail?.artworks.map((artwork) => [artwork.side, artwork.id]));
        const updateArtworks = request.artworks.map((artwork) => {
          const artworkId = artworkIdBySide.get(artwork.side);
          return artworkId ? { ...artwork, id: artworkId } : artwork;
        });
        const response = await updateDesignEditor({ ...request, id: designGroupId, artworks: updateArtworks });
        savedDesignGroupId = response.data.design_group.id;
      } else {
        const response = await createDesignEditor(request);
        savedDesignGroupId = response.data.design_group.id;
      }

      const params = new URLSearchParams({ design_group_id: String(savedDesignGroupId) });
      router.push(`${ROUTES.PRODUCT.DETAIL(product)}?${params.toString()}`);
    } catch (error) {
      const message = (error as AxiosError<ErrorRESP>).response?.data.message;
      toast.error(message ?? tCommon('error'));
    }
  };

  return (
    <>
      <header className='md:border-border-soft flex justify-between px-4 py-3 md:border-b md:px-10 md:py-4'>
        <Image src='/images/logoHeader.svg' alt='logo' width={97} height={32} className='hidden md:block' />
        <Image src='/images/logoHeaderMobile.svg' alt='logo' width={54} height={36} className='md:hidden' />
        <div className='hidden items-center gap-6 md:flex md:max-lg:gap-2'>
          <div className='flex items-center gap-2'>
            {isEditing ? (
              <Input
                ref={inputRef}
                value={title}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => setIsEditing(false)}
                className='h-9 w-[150px]'
                showClear={false}
              />
            ) : (
              <>
                <span className='title-20'>{title}</span>
                <Pencil onClick={() => setIsEditing(true)} className='text-text-secondary size-5 cursor-pointer' />
              </>
            )}
          </div>
          <BannerSizeSelector sizeOptions={sizeOptions ?? []} webEditor={designDetail?.web_editor ?? productData?.web_editor} />
        </div>
        <div className='flex gap-4 md:max-lg:gap-2'>
          <Button size='sm' className='md:h-10 md:px-6' variant='outline' onClick={handleCancel}>
            {t('exit_editor')}
          </Button>
          <Button
            size='sm'
            className='md:h-10 md:px-6'
            variant='outline'
            onClick={() => void openSlideshow()}
            disabled={isSlideshowLoading}
            loading={isSlideshowLoading}>
            {t('view_slideshow')}
          </Button>
          <Button size='sm' className='md:h-10 md:px-6' variant='outline' onClick={() => importTemplateModalRef.current?.open()}>
            {t('import')}
          </Button>
          <Button
            size='sm'
            className='md:h-10 md:px-6'
            variant='primary'
            onClick={() => void handleSave()}
            disabled={!hasCanvasContent || isCreating || isUpdating || isUploadingPreviews}
            loading={isCreating || isUpdating || isUploadingPreviews}>
            {t('save')}
          </Button>
        </div>
      </header>
      <ImportTemplateModal ref={importTemplateModalRef} productId={productData?.id} />
    </>
  );
};

const persistBackground = async (
  background: BackgroundObject,
  side: DesignSide,
  uploadFile: ReturnType<typeof useUploadFileMutation>['mutateAsync'],
) => {
  const imageUrl = background.backgroundImage;
  if (!imageUrl?.startsWith('data:')) {
    return { color: background.backgroundColor, image_url: imageUrl };
  }

  const imageBlob = await fetch(imageUrl).then((response) => response.blob());
  const response = await uploadFile({
    type: 'designs',
    file: new File([imageBlob], `design-background-${side}.png`, { type: imageBlob.type || 'image/png' }),
  });

  return { color: background.backgroundColor, image_url: response.data.file.url };
};

const toDesignLayer = (
  object: ReturnType<typeof useWebEditorStore.getState>['datas'][number]['objects'][number],
  side: DesignSide,
  bleedPx: number,
  originalLayer?: DesignLayer,
): DesignLayer => {
  const baseLayer: DesignLayer = {
    id: object.id,
    type: object.type as unknown as DesignType,
    side,
    field_key: object.field ?? originalLayer?.field_key ?? '',
    default_value: object.defaultValue ?? originalLayer?.default_value ?? '',
    position: {
      x: object.position.x - bleedPx,
      y: object.position.y - bleedPx,
    },
    size: { ...object.size },
    rotation: object.rotation,
    style: {
      font_family: originalLayer?.style?.font_family ?? 'Inter',
      font_size: originalLayer?.style?.font_size ?? 12,
      font_weight: originalLayer?.style?.font_weight ?? DesignFontWeight.REGULAR,
      line_height: originalLayer?.style?.line_height ?? 1,
      letter_spacing: originalLayer?.style?.letter_spacing ?? 0,
      color: originalLayer?.style?.color ?? '#000000',
      fill_image_url: originalLayer?.style?.fill_image_url ?? '',
      align: originalLayer?.style?.align ?? DesignTextAlign.LEFT,
      stroke_color: originalLayer?.style?.stroke_color ?? '',
      stroke_width: originalLayer?.style?.stroke_width ?? 0,
      opacity: object.opacity,
      shadow_color: originalLayer?.style?.shadow_color ?? '',
      shadow_blur: originalLayer?.style?.shadow_blur ?? 0,
      shadow_offset_x: originalLayer?.style?.shadow_offset_x ?? 0,
      shadow_offset_y: originalLayer?.style?.shadow_offset_y ?? 0,
      shadow_opacity: originalLayer?.style?.shadow_opacity ?? 0,
    },
    label: object.label ?? originalLayer?.label ?? '',
    shape_type: originalLayer?.shape_type ?? 'rectangle',
    locked: object.locked,
    polygon_sides: originalLayer?.polygon_sides ?? 0,
    note: originalLayer?.note ?? '',
  };

  if (object.type === ObjectType.TEXT) {
    return {
      ...baseLayer,
      default_value: object.content,
      style: {
        ...baseLayer.style,
        font_family: object.fontFamily,
        font_size: object.fontSize,
        font_weight:
          object.fontWeight === 'bold' ? DesignFontWeight.BOLD : (originalLayer?.style?.font_weight ?? DesignFontWeight.REGULAR),
        line_height: object.lineHeight,
        letter_spacing: object.letterSpacing,
        color: object.color,
        align: object.align as DesignTextAlign,
      },
    };
  }

  if (object.type === ObjectType.IMAGE) return { ...baseLayer, image_url: object.src };

  return {
    ...baseLayer,
    shape_type: object.shapeType,
    style: {
      ...baseLayer.style,
      color: object.fill,
      stroke_color: object.stroke,
      stroke_width: object.strokeWidth,
    },
  };
};
