import { zodResolver } from '@hookform/resolvers/zod';
import type Konva from 'konva';
import { ArrowDown, ArrowUp, ChevronsDown, ChevronsUp, ClipboardPaste, Copy, Eye, EyeOff, Lock, Trash2, Unlock } from 'lucide-react';
import { type ChangeEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { AppButton } from '@/components/shared/app-button';
import { AppSelect } from '@/components/shared/app-select';
import { AppInputFormField, AppSwitchFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { FileType } from '@/enums';
import { useSizeOptionDetailQuery, useSizeOptionsQuery } from '@/features/products/options';
import { DEFAULT_DPI, useWebEditorsQuery } from '@/features/products/web-editors';
import { uploadFile } from '@/lib/api/upload-file';

import { buildPayload, type TemplateWriteREQ } from '../api';
import { FOLD_NUMBER_MAP, getTemplateSideOptions, getTemplateTypeOptions, mmToPx } from '../constants';
import { type ShapeType, Side, TemplateSide, TemplateType, Unit } from '../enums';
import { createTemplateFormSchema, CREATE_TEMPLATE_DEFAULT_VALUES, type CreateTemplateFormValues } from '../schemas';
import { useLayerActions } from '../hooks/useLayerActions';
import { dataUrlToFile, editorLenToMm, webEditorSides } from '../utils/helper';
import { EditorToolPanel } from './EditorToolPanel';
import { LayerPropertiesPanel } from './LayerPropertiesPanel';
import { TemplateCanvasStage } from './TemplateCanvasStage';

// === Type definitions ===

export interface TemplateEditorProps {
  title: string;
  initialValues?: CreateTemplateFormValues;
  isPending: boolean;
  onSubmit: (payload: TemplateWriteREQ) => void;
  onCancel: () => void;
  /** Read-only metadata shown in the right panel when no node is selected (edit mode). */
  metadataContent?: ReactNode;
}

// === Component ===

export function TemplateEditor({
  title,
  initialValues = CREATE_TEMPLATE_DEFAULT_VALUES,
  isPending,
  onSubmit,
  onCancel,
  metadataContent,
}: TemplateEditorProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  // === Refs ===
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fillImageInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const previewStageRefs = useRef<Record<Side, Konva.Stage | null>>({
    [Side.FRONT]: null,
    [Side.BACK]: null,
  });

  // === State ===
  const [activeSide, setActiveSide] = useState<Side>(Side.FRONT);
  const [templateType, setTemplateType] = useState(initialValues.type || TemplateType.TWO_FOLD);
  const [templateSide, setTemplateSide] = useState(initialValues.side || TemplateSide.SINGLE);
  const [drawingShapeType, setDrawingShapeType] = useState<ShapeType | null>(null);
  const [availableSides, setAvailableSides] = useState<Side[]>([Side.FRONT]);
  const [canvasMenu, setCanvasMenu] = useState<{ x: number; y: number; canvasX: number; canvasY: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingFill, setIsUploadingFill] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showBleed, setShowBleed] = useState(true);
  const [showSafe, setShowSafe] = useState(true);
  const [showFold, setShowFold] = useState(true);
  const [foldNumber, setFoldNumber] = useState(2);

  // === Hooks ===
  const form = useForm<CreateTemplateFormValues>({
    resolver: zodResolver(createTemplateFormSchema) as Resolver<CreateTemplateFormValues>,
    defaultValues: initialValues,
  });

  const { data: editorsResp } = useWebEditorsQuery({ page: 1, per_page: 100, is_active: true });

  const {
    selectedIds,
    setSelectedIds,
    menu,
    setMenu,
    handleAddText,
    handleAddImage,
    handleAddShape,
    handleDeleteLayer,
    moveLayer,
    moveLayerToEdge,
    duplicateLayer,
    toggleLayerLock,
    toggleLayerVisible,
    copyLayer,
    pasteLayer,
    openMenu,
    updateLayerById,
  } = useLayerActions(form, activeSide, isPending);
  const editors = useMemo(() => editorsResp?.data?.web_editors ?? [], [editorsResp]);

  // Size option provides the base (cutting) page size; web editor provides bleed/safe/dpi/sides.
  const { data: sizeOptionsResp } = useSizeOptionsQuery({ page: 1, per_page: 100 });
  const sizeOptions = useMemo(() => sizeOptionsResp?.data?.size_options ?? [], [sizeOptionsResp]);
  const sizeOptionId = form.watch('size_option_id');
  const { data: sizeDetailResp } = useSizeOptionDetailQuery(sizeOptionId || null);
  const sizeOption = sizeDetailResp?.data?.size_option ?? null;

  // === Derived data ===
  const watchedLayers = form.watch('layers');
  const webEditorId = form.watch('web_editor_id');
  const pageWidth = form.watch('page_width');
  const pageHeight = form.watch('page_height');

  const selectedEditor = useMemo(() => editors.find((e) => e.id === webEditorId), [editors, webEditorId]);

  const dpi = selectedEditor?.dpi || DEFAULT_DPI;
  const canvasW = mmToPx(pageWidth || 0, dpi);
  const canvasH = mmToPx(pageHeight || 0, dpi);
  const hasCanvas = canvasW > 0 && canvasH > 0;
  const bleedPx = selectedEditor ? mmToPx(editorLenToMm(selectedEditor, selectedEditor.bleed || 0), dpi) : 0;
  const safePx = selectedEditor ? mmToPx(editorLenToMm(selectedEditor, selectedEditor.safe_area || 0), dpi) : 0;

  const backgroundFront = form.watch('background_front');
  const backgroundBack = form.watch('background_back');
  const backgroundUrl = activeSide === Side.BACK ? backgroundBack : backgroundFront;
  const backgroundColorFront = form.watch('background_color_front');
  const backgroundColorBack = form.watch('background_color_back');
  const backgroundColor = activeSide === Side.BACK ? backgroundColorBack : backgroundColorFront;
  const hasBleed = bleedPx > 0;
  const hasSafe = safePx > 0;
  const hasFold = templateType !== TemplateType.NO_FOLD;

  const sideLayers = useMemo(() => watchedLayers.filter((l) => l.side === activeSide), [watchedLayers, activeSide]);

  // The properties panel only edits a single layer — with 0 or 2+ selected, treat as "none".
  const primarySelectedId = selectedIds.length === 1 ? selectedIds[0] : null;
  const selectedIndex = useMemo(() => watchedLayers.findIndex((l) => l.layer_id === primarySelectedId), [watchedLayers, primarySelectedId]);
  const selectedLayer = selectedIndex >= 0 ? watchedLayers[selectedIndex] : null;

  const webEditorOptions = useMemo(() => editors.map((e) => ({ value: String(e.id), label: e.name })), [editors]);
  const sizeOptionOptions = useMemo(() => sizeOptions.map((s) => ({ value: String(s.id), label: s.name })), [sizeOptions]);
  const templateTypeOptions = useMemo(() => getTemplateTypeOptions(t), [t]);
  const templateSideOptions = useMemo(() => getTemplateSideOptions(t), [t]);

  // === Functions ===
  // Web editor now only drives bleed/safe/dpi/sides — the page size comes from the size option.
  const handleSelectWebEditor = useCallback(
    (value: string | undefined) => {
      const editor = editors.find((e) => String(e.id) === value);
      form.setValue('web_editor_id', editor ? editor.id : 0, { shouldDirty: true });
      if (editor && !webEditorSides(editor.type).includes(activeSide)) setActiveSide(Side.FRONT);
    },
    [editors, form, activeSide],
  );

  const handleSelectSizeOption = useCallback(
    (value: string | undefined) => {
      form.setValue('size_option_id', value ? Number(value) : 0, { shouldDirty: true });
    },
    [form],
  );

  const handleSelectTemplateType = useCallback(
    (value: string | undefined) => {
      const type = value ? (value as TemplateType) : TemplateType.TWO_FOLD;
      setTemplateType(type);
      handleFoldNumber(type);
      form.setValue('type', type, { shouldDirty: true });
    },
    [form],
  );

  const handleSelectTemplateSide = useCallback(
    (value: string | undefined) => {
      const side = value ? (value as TemplateSide) : TemplateSide.SINGLE;
      setTemplateSide(side);
      form.setValue('side', side, { shouldDirty: true });
    },
    [form],
  );

  const handleFoldNumber = useCallback((value: TemplateType) => {
    const foldNumber = FOLD_NUMBER_MAP[value];

    if (foldNumber) {
      setFoldNumber(foldNumber);
    }
  }, []);

  const handleUploadBackground = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      setIsUploadingBg(true);
      try {
        const uploaded = await uploadFile({ file, type: FileType.TEMPLATES });
        form.setValue(activeSide === Side.BACK ? 'background_back' : 'background_front', uploaded.url, { shouldDirty: true });
      } catch {
        toast.error(t('products.templates.editor.toast.bg_upload_error', 'Failed to upload background.'));
      } finally {
        setIsUploadingBg(false);
      }
    },
    [form, activeSide, t],
  );

  const handleRemoveBackground = useCallback(() => {
    form.setValue(activeSide === Side.BACK ? 'background_back' : 'background_front', '', { shouldDirty: true });
  }, [form, activeSide]);

  const handleChangeBackgroundColor = useCallback(
    (color: string) => {
      form.setValue(activeSide === Side.BACK ? 'background_color_back' : 'background_color_front', color, { shouldDirty: true });
    },
    [form, activeSide],
  );

  const handleSwitchSide = useCallback(
    (side: Side) => {
      setActiveSide(side);
      setSelectedIds([]);
    },
    [setSelectedIds],
  );

  // additive=true (shift/ctrl-click) toggles id in/out of the selection instead of replacing it.
  const handleSelect = useCallback(
    (id: string | null, additive?: boolean) => {
      if (!id) {
        setSelectedIds([]);
        return;
      }
      if (!additive) {
        setSelectedIds([id]);
        return;
      }
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    },
    [setSelectedIds],
  );

  const handleUploadImage = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || selectedIndex < 0) return;
      setIsUploading(true);
      try {
        const uploaded = await uploadFile({ file, type: FileType.TEMPLATES });
        form.setValue(`layers.${selectedIndex}.image_url`, uploaded.url, { shouldDirty: true });
      } catch {
        toast.error(t('products.templates.editor.toast.image_upload_error', 'Failed to upload image.'));
      } finally {
        setIsUploading(false);
      }
    },
    [form, selectedIndex, t],
  );

  const handleUploadFillImage = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || selectedIndex < 0) return;
      setIsUploadingFill(true);
      try {
        const uploaded = await uploadFile({ file, type: FileType.TEMPLATES });
        form.setValue(`layers.${selectedIndex}.fill_image_url`, uploaded.url, { shouldDirty: true });
      } catch {
        toast.error(t('products.templates.editor.toast.image_upload_error', 'Failed to upload image.'));
      } finally {
        setIsUploadingFill(false);
      }
    },
    [form, selectedIndex, t],
  );

  const handleDrawComplete = useCallback(
    (type: ShapeType, x: number, y: number, w: number, h: number, rotation?: number) => {
      handleAddShape(type, { x, y, w, h, rotation });
      setDrawingShapeType(null);
    },
    [handleAddShape],
  );

  const uploadPreview = async (stage: Konva.Stage, side: Side) => {
    const dataUrl = stage.toDataURL({ pixelRatio: 2 });

    const file = await dataUrlToFile(dataUrl, `preview-${side}.png`);

    const uploaded = await uploadFile({
      file,
      type: FileType.TEMPLATE_PREVIEWS,
    });

    return uploaded.url;
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload = buildPayload(values);

    setIsCapturing(true);

    try {
      setSelectedIds([]);
      await new Promise((r) => setTimeout(r, 60));

      for (const side of availableSides) {
        const stage = previewStageRefs.current[side];

        if (!stage) continue;

        const url = await uploadPreview(stage, side);

        switch (side) {
          case Side.FRONT:
            payload.front_preview_url = url;
            break;

          case Side.BACK:
            payload.back_preview_url = url;
            break;
        }
      }
    } catch {
      // preview optional
    } finally {
      setIsCapturing(false);
    }

    onSubmit(payload);
  });

  useEffect(() => {
    if (templateSide === TemplateSide.DOUBLE) {
      setAvailableSides([Side.FRONT, Side.BACK]);
    } else {
      setAvailableSides([Side.FRONT]);
    }
  }, [templateSide]);

  useEffect(() => {
    handleFoldNumber(templateType);
  }, [templateType, handleFoldNumber]);

  // Base page size = the selected size option's cutting dimensions (mm).
  useEffect(() => {
    if (!sizeOption) return;
    form.setValue('page_width', sizeOption.cutting_width, { shouldDirty: true });
    form.setValue('page_height', sizeOption.cutting_height, { shouldDirty: true });
    form.setValue('page_unit', Unit.MM, { shouldDirty: true });
  }, [sizeOption, form]);

  // Cancel drawing mode with Escape.
  useEffect(() => {
    if (!drawingShapeType) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawingShapeType(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawingShapeType]);

  // Close the canvas context menu on any outside interaction / Escape.
  useEffect(() => {
    if (!canvasMenu) return;
    const close = () => setCanvasMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCanvasMenu(null);
    };
    window.addEventListener('mousedown', close);
    window.addEventListener('scroll', close, true);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [canvasMenu]);

  // === JSX return ===
  return (
    <div className='flex h-full flex-col overflow-hidden'>
      {/* Header */}
      <div className='flex shrink-0 items-center justify-between gap-3 border-b px-6 py-3'>
        <h1 className='text-lg font-semibold'>{title}</h1>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={onCancel} disabled={isPending || isCapturing}>
            {tCommon('action.cancel', 'Cancel')}
          </Button>
          <AppButton size='sm' onClick={handleSubmit} isLoading={isPending || isCapturing}>
            {t('products.templates.editor.save', 'Save Template')}
          </AppButton>
        </div>
      </div>

      <div className='flex-1 space-y-4 overflow-y-auto p-4'>
        {/* === SECTION 1: Template settings === */}
        <section className='bg-card rounded-xl border p-4'>
          <p className='text-muted-foreground mb-3 text-[10px] font-semibold tracking-wider uppercase'>
            {t('products.templates.editor.section.template', 'Template')}
          </p>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <AppInputFormField
                name='name'
                control={form.control}
                label={t('products.templates.editor.field.name', 'Name')}
                required
                disabled={isPending}
              />

              <div className='space-y-1.5'>
                <Label className='text-xs'>
                  {t('products.templates.editor.field.web_editor', 'Web Editor')} <span className='text-destructive'>*</span>
                </Label>
                <AppSelect
                  options={webEditorOptions}
                  value={webEditorId ? String(webEditorId) : undefined}
                  onValueChange={handleSelectWebEditor}
                  placeholder={t('products.templates.editor.field.web_editor_placeholder', 'Select web editor')}
                  searchable
                  disabled={isPending}
                />
                {selectedEditor ? (
                  <p className='text-muted-foreground text-[11px]'>
                    {t('products.templates.editor.web_editor_specs', 'Bleed {{bleed}}mm · Safe Area {{safe}}mm · {{dpi}} DPI', {
                      bleed: selectedEditor.bleed,
                      safe: selectedEditor.safe_area,
                      dpi: selectedEditor.dpi,
                    })}
                  </p>
                ) : null}
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs'>
                  {t('products.templates.editor.field.size_option', 'Size Option')} <span className='text-destructive'>*</span>
                </Label>
                <AppSelect
                  options={sizeOptionOptions}
                  value={sizeOptionId ? String(sizeOptionId) : undefined}
                  onValueChange={handleSelectSizeOption}
                  placeholder={t('products.templates.editor.field.size_option_placeholder', 'Select size option')}
                  searchable
                  disabled={isPending}
                />
                {pageWidth > 0 ? (
                  <p className='text-muted-foreground text-[11px]'>
                    {t('products.templates.editor.page_size', 'Page: {{width}} × {{height}} mm', { width: pageWidth, height: pageHeight })}
                  </p>
                ) : null}
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs'>{t('products.templates.editor.field.side_option', 'Side Option')}</Label>
                <AppSelect
                  options={templateSideOptions}
                  value={templateSide ? String(templateSide) : undefined}
                  onValueChange={handleSelectTemplateSide}
                  placeholder={t('products.templates.editor.field.side_option_placeholder', 'Select side option')}
                  searchable
                  disabled={isPending}
                />
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs'>{t('products.templates.editor.field.type_option', 'Type Option')}</Label>
                <AppSelect
                  options={templateTypeOptions}
                  value={templateType ? String(templateType) : undefined}
                  onValueChange={handleSelectTemplateType}
                  placeholder={t('products.templates.editor.field.type_option_placeholder', 'Select type option')}
                  searchable
                  disabled={isPending}
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-x-8 gap-y-2 border-t pt-4 sm:grid-cols-4'>
              <AppSwitchFormField
                name='is_active'
                control={form.control}
                label={t('products.templates.editor.flag.active', 'Active')}
                disabled={isPending}
              />
              {/* <AppSwitchFormField
                name='allow_text_edit'
                control={form.control}
                label={t('products.templates.editor.flag.allow_text_edit', 'Allow Text Edit')}
                disabled={isPending}
              />
              <AppSwitchFormField
                name='allow_image_replace'
                control={form.control}
                label={t('products.templates.editor.flag.allow_image_replace', 'Allow Image Replace')}
                disabled={isPending}
              />
              <AppSwitchFormField
                name='spot_color_enabled'
                control={form.control}
                label={t('products.templates.editor.flag.spot_color', 'Spot Color')}
                disabled={isPending}
              /> */}
            </div>
          </div>
        </section>

        {/* === SECTION 2: Editor === */}
        <section className='bg-card flex h-140 overflow-hidden rounded-xl border'>
          {/* LEFT: tool rail + contextual panel */}
          <EditorToolPanel
            activeSide={activeSide}
            layers={sideLayers}
            selectedIds={selectedIds}
            hasCanvas={hasCanvas}
            isPending={isPending}
            onAddText={handleAddText}
            onAddImage={handleAddImage}
            drawingShapeType={drawingShapeType}
            onSelectShape={setDrawingShapeType}
            backgroundUrl={backgroundUrl}
            backgroundColor={backgroundColor}
            isUploadingBg={isUploadingBg}
            bgInputRef={bgInputRef}
            onUploadBackground={handleUploadBackground}
            onRemoveBackground={handleRemoveBackground}
            onChangeBackgroundColor={handleChangeBackgroundColor}
            onSelectLayer={handleSelect}
            onContextMenu={openMenu}
            onDeleteLayer={handleDeleteLayer}
            onToggleLock={toggleLayerLock}
            onToggleVisible={toggleLayerVisible}
          />

          {/* === CENTER: canvas === */}
          <div className='bg-muted/20 flex min-w-0 flex-1 flex-col overflow-hidden'>
            {/* Toolbar: side tabs + guide toggles */}
            {hasCanvas ? (
              <div className='bg-background flex shrink-0 items-center justify-between gap-2 border-b px-4 py-2'>
                <div className='flex items-center gap-1'>
                  {availableSides.length > 1
                    ? availableSides.map((side) => (
                        <button
                          key={side}
                          type='button'
                          onClick={() => handleSwitchSide(side)}
                          className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium capitalize ${
                            activeSide === side ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {t(`products.templates.editor.side.${side}`)}
                        </button>
                      ))
                    : null}
                </div>
                <div className='flex items-center gap-1'>
                  <button
                    type='button'
                    onClick={() => setShowBleed((v) => !v)}
                    disabled={!hasBleed}
                    className={`cursor-pointer rounded-md border px-2 py-1 text-xs font-medium ${
                      hasBleed && showBleed ? 'border-red-300 bg-red-50 text-red-600' : 'text-muted-foreground hover:bg-muted'
                    } disabled:cursor-default disabled:opacity-40`}
                    title={
                      hasBleed
                        ? t('products.templates.editor.toolbar.bleed_toggle', 'Toggle bleed area')
                        : t('products.templates.editor.toolbar.bleed_none', 'No bleed configured')
                    }
                  >
                    {t('products.templates.editor.toolbar.bleed', 'Bleed')}
                  </button>
                  <button
                    type='button'
                    onClick={() => setShowSafe((v) => !v)}
                    disabled={!hasSafe}
                    className={`cursor-pointer rounded-md border px-2 py-1 text-xs font-medium ${
                      hasSafe && showSafe ? 'border-blue-300 bg-blue-50 text-blue-600' : 'text-muted-foreground hover:bg-muted'
                    } disabled:cursor-default disabled:opacity-40`}
                    title={
                      hasSafe
                        ? t('products.templates.editor.toolbar.safe_toggle', 'Toggle safe area')
                        : t('products.templates.editor.toolbar.safe_none', 'No safe area configured')
                    }
                  >
                    {t('products.templates.editor.toolbar.safe', 'Safe')}
                  </button>
                  <button
                    type='button'
                    onClick={() => setShowFold((v) => !v)}
                    disabled={!hasFold}
                    className={`cursor-pointer rounded-md border px-2 py-1 text-xs font-medium ${
                      hasFold && showFold ? 'border-green-300 bg-green-50 text-green-600' : 'text-muted-foreground hover:bg-muted'
                    } disabled:cursor-default disabled:opacity-40`}
                    title={
                      hasFold
                        ? t('products.templates.editor.toolbar.fold_toggle', 'Toggle fold lines')
                        : t('products.templates.editor.toolbar.fold_none', 'No fold lines configured')
                    }
                  >
                    {t('products.templates.editor.toolbar.fold', 'Fold')}
                  </button>
                </div>
              </div>
            ) : null}

            <div className='min-h-0 flex-1'>
              {hasCanvas ? (
                <TemplateCanvasStage
                  layers={sideLayers}
                  canvasW={canvasW}
                  canvasH={canvasH}
                  bleedPx={bleedPx}
                  safePx={safePx}
                  showBleed={showBleed}
                  showSafe={showSafe}
                  showFold={hasFold && showFold}
                  foldNumber={foldNumber}
                  backgroundUrl={backgroundUrl}
                  backgroundColor={backgroundColor}
                  selectedIds={selectedIds}
                  onSelect={handleSelect}
                  onMarqueeSelect={setSelectedIds}
                  onChange={updateLayerById}
                  onContextMenu={openMenu}
                  onCanvasContextMenu={(screenX, screenY, canvasX, canvasY) => setCanvasMenu({ x: screenX, y: screenY, canvasX, canvasY })}
                  drawingShapeType={drawingShapeType}
                  onDrawComplete={handleDrawComplete}
                />
              ) : (
                <div className='flex h-full items-center justify-center'>
                  <p className='text-muted-foreground text-sm'>
                    {t('products.templates.editor.no_canvas', 'Select a web editor to set the canvas size.')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* === RIGHT: node properties / metadata === */}
          <div className='w-72 shrink-0 overflow-y-auto border-l'>
            <LayerPropertiesPanel
              selectedLayer={selectedLayer}
              selectedIndex={selectedIndex}
              control={form.control}
              availableSides={availableSides}
              isPending={isPending}
              isUploading={isUploading}
              fileInputRef={fileInputRef}
              onUploadImage={handleUploadImage}
              isUploadingFill={isUploadingFill}
              fillImageInputRef={fillImageInputRef}
              onUploadFillImage={handleUploadFillImage}
              onDeleteLayer={handleDeleteLayer}
              onUpdateLayer={updateLayerById}
              metadataContent={metadataContent}
              selectedCount={selectedIds.length}
            />
          </div>
        </section>

        {/* === SECTION 3: Preview === */}
        <section className='bg-card flex h-140 flex-col overflow-hidden rounded-xl border p-4'>
          <p className='text-muted-foreground mb-3 shrink-0 text-[10px] font-semibold tracking-wider uppercase'>
            {t('products.templates.editor.section.preview', 'Preview')}
          </p>
          {hasCanvas ? (
            <div className='flex min-h-0 flex-1 gap-4'>
              {availableSides.map((side) => (
                <div key={side} className='flex min-w-0 flex-1 flex-col space-y-1'>
                  <p className='text-muted-foreground shrink-0 text-xs capitalize'>{t(`products.templates.editor.side.${side}`)}</p>
                  <div className='bg-muted/20 min-h-0 flex-1 overflow-hidden rounded-lg border'>
                    <TemplateCanvasStage
                      layers={watchedLayers.filter((l) => l.side === side)}
                      canvasW={canvasW}
                      canvasH={canvasH}
                      backgroundUrl={side === Side.BACK ? backgroundBack : backgroundFront}
                      backgroundColor={side === Side.BACK ? backgroundColorBack : backgroundColorFront}
                      stageRef={(stage) => {
                        previewStageRefs.current[side] = stage;
                      }}
                      selectedIds={[]}
                      interactive={false}
                      onSelect={() => {}}
                      onChange={() => {}}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-muted-foreground text-sm'>{t('products.templates.editor.no_preview', 'Select a web editor to preview.')}</p>
          )}
        </section>
      </div>

      {/* Right-click context menu */}
      {menu ? (
        <div
          className='bg-popover text-popover-foreground fixed z-50 min-w-44 overflow-hidden rounded-md border py-1 shadow-md'
          style={{ left: menu.x, top: menu.y }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {[
            {
              label: t('products.templates.editor.menu.bring_to_front', 'Bring to Front'),
              icon: ChevronsUp,
              run: () => moveLayerToEdge(menu.id, 'front'),
            },
            { label: t('products.templates.editor.menu.bring_forward', 'Bring Forward'), icon: ArrowUp, run: () => moveLayer(menu.id, 1) },
            { label: t('products.templates.editor.menu.send_backward', 'Send Backward'), icon: ArrowDown, run: () => moveLayer(menu.id, -1) },
            {
              label: t('products.templates.editor.menu.send_to_back', 'Send to Back'),
              icon: ChevronsDown,
              run: () => moveLayerToEdge(menu.id, 'back'),
            },
            { label: t('products.templates.editor.menu.duplicate', 'Duplicate'), icon: Copy, run: () => duplicateLayer(menu.id) },
            { label: tCommon('action.copy', 'Copy'), icon: Copy, run: () => copyLayer(menu.id) },
            {
              label: watchedLayers.find((l) => l.layer_id === menu.id)?.locked
                ? t('products.templates.editor.menu.unlock', 'Unlock')
                : t('products.templates.editor.menu.lock', 'Lock'),
              icon: watchedLayers.find((l) => l.layer_id === menu.id)?.locked ? Unlock : Lock,
              run: () => toggleLayerLock(menu.id),
            },
            {
              label:
                watchedLayers.find((l) => l.layer_id === menu.id)?.visible === false
                  ? t('products.templates.editor.menu.show', 'Show')
                  : t('products.templates.editor.menu.hide', 'Hide'),
              icon: watchedLayers.find((l) => l.layer_id === menu.id)?.visible === false ? Eye : EyeOff,
              run: () => toggleLayerVisible(menu.id),
            },
          ].map((item) => (
            <button
              key={item.label}
              type='button'
              className='hover:bg-muted flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-xs'
              onClick={() => {
                item.run();
                setMenu(null);
              }}
            >
              <item.icon className='size-3.5' />
              {item.label}
            </button>
          ))}
          <Separator className='my-1' />
          <button
            type='button'
            className='text-destructive hover:bg-destructive/10 flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-xs disabled:cursor-not-allowed disabled:opacity-40'
            disabled={watchedLayers.find((l) => l.layer_id === menu.id)?.locked}
            onClick={() => {
              handleDeleteLayer(menu.id);
              setMenu(null);
            }}
          >
            <Trash2 className='size-3.5' />
            {tCommon('action.delete', 'Delete')}
          </button>
        </div>
      ) : null}

      {/* Canvas context menu — right-click on empty canvas */}
      {canvasMenu ? (
        <div
          className='bg-popover text-popover-foreground fixed z-50 min-w-36 overflow-hidden rounded-md border py-1 shadow-md'
          style={{ left: canvasMenu.x, top: canvasMenu.y }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type='button'
            className='hover:bg-muted flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-xs'
            onClick={() => {
              pasteLayer({ x: canvasMenu.canvasX, y: canvasMenu.canvasY });
              setCanvasMenu(null);
            }}
          >
            <ClipboardPaste className='size-3.5' />
            {t('products.templates.editor.menu.paste', 'Paste')}
          </button>
        </div>
      ) : null}
    </div>
  );
}
