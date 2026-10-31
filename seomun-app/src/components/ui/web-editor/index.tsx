'use client';

import { useWebEditorStore } from '@/hooks';
import Konva from 'konva';
import { useEffect, useRef, useState } from 'react';
import Canvas from './Canvas';
import { ExportLoadingOverlay } from './ExportLoadingOverlay';
import { FooterPreview } from './FooterPreview';
import { SlideshowModal } from './SlideshowModal';
import { PageGridView } from './PageGridView';
import {
  useGetSizeOptionsByProductQuery,
  useGetTemplatesByProductQuery,
  useProductBySlugQuery,
} from '@/apis/product/product.query';
import { useDesignDetailQuery } from '@/apis/design/design.query';
import { DesignSide } from '@/enums/design';
import { useRouter } from '@/i18n/navigation';
import { ROUTES } from '@/routes';
import { useSearchParams } from 'next/navigation';

export const WebEditorCore = () => {
  const {
    setStageRef,
    fitToScreen,
    isInitialCanvasConfigured,
    isInitialCanvasReady,
    selectedBannerId,
    selectedTemplateId,
    isGridView,
    setTemplates,
    setIsInitialCanvasConfigured,
    setIsInitialCanvasReady,
    setTemplate,
    resetEditor,
    setCustomSize,
    setSelectedSizeOptionId,
    setWebEditor,
    canvasSize: editorCanvasSize,
  } = useWebEditorStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const activeStageRef = useRef<Konva.Stage | null>(null);
  const prevWidthRef = useRef(0);
  const prevHeightRef = useRef(0);
  const prevBannerIdRef = useRef(selectedBannerId);
  const prevTemplateIdRef = useRef(selectedTemplateId);
  const prevEditorCanvasSizeRef = useRef(editorCanvasSize);
  const initializedProductRef = useRef<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const productSlug = searchParams.get('product');
  const designGroupIdParam = searchParams.get('design_group_id');
  const designGroupId = Number(designGroupIdParam);
  const hasDesignGroupId = Number.isInteger(designGroupId) && designGroupId > 0;
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const { data: dataTemplate } = useGetTemplatesByProductQuery({ slug: productSlug || '' });
  const { data: productDetail } = useProductBySlugQuery(productSlug ?? undefined);
  const { data: sizeOptions } = useGetSizeOptionsByProductQuery(productDetail?.id);
  const { data: designDetail } = useDesignDetailQuery(hasDesignGroupId ? designGroupId : undefined);
  const initializationKey = hasDesignGroupId ? `${productSlug}:${designGroupId}` : productSlug;
  const isCanvasVisible = isInitialCanvasReady;

  useEffect(() => {
    if (productDetail && productDetail.allow_web_editor === false) {
      router.replace(ROUTES.PRODUCT.DETAIL(productSlug ?? ''));
    }
  }, [productDetail, productSlug, router]);

  useEffect(() => {
    initializedProductRef.current = null;
    activeStageRef.current = null;
    resetEditor();
  }, [designGroupId, productSlug, resetEditor]);

  useEffect(() => {
    setTemplates(dataTemplate ?? []);

    if (
      !productDetail ||
      (hasDesignGroupId && (!designDetail || dataTemplate === undefined)) ||
      (!hasDesignGroupId && !sizeOptions?.length)
    )
      return;

    if (initializedProductRef.current !== initializationKey) {
      if (designDetail) {
        setSelectedSizeOptionId(designDetail.size_option_id || null);
        const artworks = [DesignSide.FRONT, DesignSide.BACK]
          .map((side) => designDetail.artworks.find((artwork) => artwork.side === side))
          .filter((artwork): artwork is NonNullable<typeof artwork> => Boolean(artwork));
        const savedLayerIds = new Set(artworks.flatMap((artwork) => artwork.layout_data.objects.map((layer) => layer.id)));
        const matchingTemplate = [...(dataTemplate ?? [])]
          .map((template) => {
            const templateLayers = template.layout_config?.layers ?? [];
            const matchingLayerCount = templateLayers.filter((layer) => savedLayerIds.has(layer.id)).length;

            return { template, matchingLayerCount };
          })
          .filter(({ matchingLayerCount }) => matchingLayerCount > 0)
          .sort((first, second) => second.matchingLayerCount - first.matchingLayerCount)[0]?.template;
        const webEditor = designDetail.web_editor ?? productDetail.web_editor;
        setWebEditor(webEditor);

        setTemplate(
          matchingTemplate ?? null,
          artworks.flatMap((artwork) => artwork.layout_data.objects),
          {
            backgrounds: artworks.map((artwork) => artwork.layout_data.background),
            previewImages: artworks.map((artwork) => artwork.preview_image_path),
            hasBackSide: artworks.some((artwork) => artwork.side === DesignSide.BACK),
            sizeMm: matchingTemplate ? undefined : { width: designDetail.width_mm, height: designDetail.height_mm },
            webEditor,
          },
        );
        if (designDetail.width_mm > 0 && designDetail.height_mm > 0) {
          setCustomSize({
            width: designDetail.width_mm,
            height: designDetail.height_mm,
            dpi: webEditor?.dpi || 200,
          });
        }
      } else {
        const initialSizeOption = sizeOptions?.[0];
        if (!initialSizeOption) return;
        const dpi = productDetail.web_editor?.dpi || 200;

        resetEditor();
        setWebEditor(productDetail.web_editor);
        setSelectedSizeOptionId(initialSizeOption.id);
        setCustomSize({
          width: initialSizeOption.cutting_width,
          height: initialSizeOption.cutting_height,
          dpi,
        });
      }
      initializedProductRef.current = initializationKey;
      setIsInitialCanvasConfigured(true);
    }
  }, [
    dataTemplate,
    designDetail,
    designGroupId,
    hasDesignGroupId,
    initializationKey,
    productSlug,
    productDetail,
    resetEditor,
    sizeOptions,
    setCustomSize,
    setIsInitialCanvasConfigured,
    setSelectedSizeOptionId,
    setTemplate,
    setTemplates,
    setWebEditor,
  ]);

  // Do not show the initial CARD_SIZE_PX canvas. Wait until the real product/design
  // dimensions are applied and the first fit calculation has completed.
  useEffect(() => {
    if (isInitialCanvasReady || !isInitialCanvasConfigured || canvasSize.width <= 0 || canvasSize.height <= 0) return;

    fitToScreen(canvasSize.width, canvasSize.height);
    setIsInitialCanvasReady(true);
  }, [canvasSize, fitToScreen, isInitialCanvasConfigured, isInitialCanvasReady, setIsInitialCanvasReady]);

  useEffect(() => {
    const updateSize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const nextSize = { width: canvas.clientWidth, height: canvas.clientHeight };
        setCanvasSize((currentSize) =>
          currentSize.width === nextSize.width && currentSize.height === nextSize.height ? currentSize : nextSize,
        );
      }
    };

    setStageRef(activeStageRef);
    updateSize();
    window.addEventListener('resize', updateSize);
    const resizeObserver = new ResizeObserver(updateSize);
    if (canvasRef.current) resizeObserver.observe(canvasRef.current);

    return () => {
      window.removeEventListener('resize', updateSize);
      resizeObserver.disconnect();
    };
  }, [setStageRef]);

  // Handle fit to screen when size or banner changes
  useEffect(() => {
    if (canvasSize.width > 0 && canvasSize.height > 0) {
      const widthChanged = canvasSize.width !== prevWidthRef.current;
      const heightChanged = canvasSize.height !== prevHeightRef.current;
      const bannerChanged = selectedBannerId !== prevBannerIdRef.current;
      const templateChanged = selectedTemplateId !== prevTemplateIdRef.current;
      const templateSizeChanged =
        editorCanvasSize.width !== prevEditorCanvasSizeRef.current.width ||
        editorCanvasSize.height !== prevEditorCanvasSizeRef.current.height;

      if (
        widthChanged ||
        heightChanged ||
        bannerChanged ||
        templateChanged ||
        templateSizeChanged ||
        prevWidthRef.current === 0
      ) {
        fitToScreen(canvasSize.width, canvasSize.height);
        prevWidthRef.current = canvasSize.width;
        prevHeightRef.current = canvasSize.height;
        prevBannerIdRef.current = selectedBannerId;
        prevTemplateIdRef.current = selectedTemplateId;
        prevEditorCanvasSizeRef.current = editorCanvasSize;
      }
    }
  }, [canvasSize, selectedBannerId, selectedTemplateId, editorCanvasSize, fitToScreen]);

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div ref={canvasRef} className='relative min-h-0 flex-1'>
        {isCanvasVisible && isGridView ? (
          <PageGridView />
        ) : isCanvasVisible ? (
          <Canvas
            width={canvasSize.width}
            height={canvasSize.height}
            onStageReady={(stage) => {
              activeStageRef.current = stage;
            }}
          />
        ) : null}
      </div>
      <div className={isCanvasVisible ? undefined : 'invisible'}>
        <FooterPreview />
      </div>
      <SlideshowModal />
      <ExportLoadingOverlay />
    </div>
  );
};
