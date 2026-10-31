import { type ChangeEvent, type RefObject, useState } from 'react';
import {
  Eye,
  EyeOff,
  Image as ImageIcon,
  ImagePlus,
  Layers,
  Lock,
  PaintBucket,
  Shapes,
  Square,
  Trash2,
  Type as TypeIcon,
  Unlock,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AppColorPicker } from '@/components/shared/app-color-picker/AppColorPicker';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import { LayerType, ShapeType, type Side } from '../enums';
import type { LayerFormValues } from '../schemas';
import { ShapeGlyph } from './ShapeGlyph';

// === Type definitions ===

type ToolTab = 'layers' | 'shape' | 'background';

export interface EditorToolPanelProps {
  activeSide: Side;
  layers: LayerFormValues[];
  selectedIds: string[];
  hasCanvas: boolean;
  isPending: boolean;
  // Add tools
  onAddText: () => void;
  onAddImage: () => void;
  // Shape draw mode
  drawingShapeType: ShapeType | null;
  onSelectShape: (type: ShapeType | null) => void;
  // Background
  backgroundUrl: string | undefined;
  backgroundColor: string | undefined;
  isUploadingBg: boolean;
  bgInputRef: RefObject<HTMLInputElement | null>;
  onUploadBackground: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveBackground: () => void;
  onChangeBackgroundColor: (color: string) => void;
  // Layer list
  /** additive=true (shift/ctrl-click) toggles id in/out of the selection instead of replacing it. */
  onSelectLayer: (id: string, additive?: boolean) => void;
  onContextMenu: (id: string, x: number, y: number) => void;
  onDeleteLayer: (id: string) => void;
  onToggleLock: (id: string) => void;
  onToggleVisible: (id: string) => void;
}

// === Variables ===

// Shape picker grid — same set + order as the user-facing web editor (seomun-app).
// `as const` (not `: ShapeType[]`) keeps `value` narrowed to these 12 literals so
// the i18n key template below type-checks against real translation keys —
// widening to ShapeType would include legacy members with no i18n entry.
const SHAPE_OPTIONS = [
  ShapeType.RECTANGLE,
  ShapeType.ROUNDED_RECTANGLE,
  ShapeType.CIRCLE,
  ShapeType.TRIANGLE,
  ShapeType.DIAMOND,
  ShapeType.TRIANGLE_DOWN,
  ShapeType.STAR_5,
  ShapeType.STAR_4,
  ShapeType.STAR_6,
  ShapeType.BURST_12,
  ShapeType.SCALLOP_1,
  ShapeType.SCALLOP_2,
] as const;

// === Component ===

export function EditorToolPanel({
  activeSide,
  layers,
  selectedIds,
  hasCanvas,
  isPending,
  onAddText,
  onAddImage,
  drawingShapeType,
  onSelectShape,
  backgroundUrl,
  backgroundColor,
  isUploadingBg,
  bgInputRef,
  onUploadBackground,
  onRemoveBackground,
  onChangeBackgroundColor,
  onSelectLayer,
  onContextMenu,
  onDeleteLayer,
  onToggleLock,
  onToggleVisible,
}: EditorToolPanelProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  // === State ===
  const [activeTab, setActiveTab] = useState<ToolTab>('layers');

  // === Variables ===
  const sideLabel = t(`products.templates.editor.side.${activeSide}`);
  // Text / Image are one-shot actions (add a layer on click); the rest switch the panel.
  const railItems: (
    | { kind: 'tab'; key: ToolTab; icon: typeof Layers; label: string }
    | { kind: 'action'; icon: typeof Layers; label: string; onClick: () => void }
  )[] = [
    { kind: 'tab', key: 'layers', icon: Layers, label: t('products.templates.editor.tab.layers', 'Layers') },
    { kind: 'action', icon: TypeIcon, label: t('products.templates.editor.add.text', 'Text'), onClick: onAddText },
    { kind: 'action', icon: ImagePlus, label: t('products.templates.editor.add.image', 'Image'), onClick: onAddImage },
    { kind: 'tab', key: 'shape', icon: Shapes, label: t('products.templates.editor.add.shape', 'Shape') },
    { kind: 'tab', key: 'background', icon: PaintBucket, label: t('products.templates.editor.tab.background', 'Background') },
  ];

  // === JSX return ===
  return (
    <div className='flex w-72 shrink-0 overflow-hidden border-r'>
      {/* Icon rail */}
      <div className='bg-muted/30 flex w-14 shrink-0 flex-col gap-1 border-r p-1.5'>
        {railItems.map((item, i) => {
          const isActive = item.kind === 'tab' && activeTab === item.key;
          const disabled = item.kind === 'action' && (isPending || !hasCanvas);
          return (
            <button
              key={item.kind === 'tab' ? item.key : `action-${i}`}
              type='button'
              onClick={() => (item.kind === 'tab' ? setActiveTab(item.key) : item.onClick())}
              disabled={disabled}
              className={`flex cursor-pointer flex-col items-center gap-0.5 rounded-md px-1 py-2 text-[9px] font-medium ${
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <item.icon className='size-4' />
              <span className='w-full truncate text-center'>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contextual panel */}
      <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
        {/* --- Layers --- */}
        {activeTab === 'layers' ? (
          <div className='flex min-h-0 flex-1 flex-col p-3'>
            <p className='text-muted-foreground mb-2 text-[10px] font-semibold tracking-wider uppercase'>
              {t('products.templates.editor.layers.title', 'Layers · {{side}} ({{count}})', { side: sideLabel, count: layers.length })}
            </p>
            <div className='flex-1 space-y-0.5 overflow-y-auto'>
              {layers.length === 0 ? (
                <p className='text-muted-foreground py-6 text-center text-xs'>
                  {t('products.templates.editor.layers.empty', 'No layers on this side.')}
                </p>
              ) : (
                layers.map((layer) => {
                  const isSelected = selectedIds.includes(layer.layer_id);
                  return (
                    <div
                      key={layer.layer_id}
                      onClick={(e) => onSelectLayer(layer.layer_id, e.shiftKey || e.ctrlKey || e.metaKey)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        onContextMenu(layer.layer_id, e.clientX, e.clientY);
                      }}
                      className={`group flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-xs ${
                        isSelected ? 'bg-accent' : 'hover:bg-muted/60'
                      }`}
                    >
                      {layer.type === LayerType.IMAGE ? (
                        <ImagePlus className='size-3.5 shrink-0 text-amber-600' />
                      ) : layer.type === LayerType.SHAPE ? (
                        <Square className='size-3.5 shrink-0 text-violet-600' />
                      ) : (
                        <TypeIcon className='size-3.5 shrink-0 text-blue-600' />
                      )}
                      <span className={`flex-1 truncate ${layer.visible === false ? 'text-muted-foreground/60 italic' : ''}`}>
                        {layer.field_key || layer.default_value || t(`products.templates.editor.type.${layer.type}`)}
                      </span>
                      <button
                        type='button'
                        className={`cursor-pointer rounded p-0.5 ${
                          layer.visible === false
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100'
                        }`}
                        title={
                          layer.visible === false
                            ? t('products.templates.editor.menu.show', 'Show')
                            : t('products.templates.editor.menu.hide', 'Hide')
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleVisible(layer.layer_id);
                        }}
                        disabled={isPending}
                      >
                        {layer.visible === false ? <EyeOff className='size-3.5' /> : <Eye className='size-3.5' />}
                      </button>
                      <button
                        type='button'
                        className={`cursor-pointer rounded p-0.5 ${
                          layer.locked ? 'text-foreground' : 'text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100'
                        }`}
                        title={layer.locked ? t('products.templates.editor.menu.unlock', 'Unlock') : t('products.templates.editor.menu.lock', 'Lock')}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLock(layer.layer_id);
                        }}
                        disabled={isPending}
                      >
                        {layer.locked ? <Lock className='size-3.5' /> : <Unlock className='size-3.5' />}
                      </button>
                      <button
                        type='button'
                        className='text-destructive/70 hover:text-destructive cursor-pointer rounded p-0.5 opacity-0 group-hover:opacity-100'
                        title={
                          layer.locked
                            ? t('products.templates.editor.layers.unlock_to_delete', 'Unlock to delete')
                            : tCommon('action.delete', 'Delete')
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteLayer(layer.layer_id);
                        }}
                        disabled={isPending || layer.locked}
                      >
                        <Trash2 className='size-3.5' />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : null}

        {/* --- Shape --- */}
        {activeTab === 'shape' ? (
          <div className='space-y-2 p-3'>
            <div className='flex items-center justify-between'>
              <p className='text-muted-foreground text-[10px] font-semibold tracking-wider uppercase'>
                {t('products.templates.editor.section.shapes', 'Shapes')}
              </p>
            </div>
            <div className='grid grid-cols-3 gap-2'>
              {SHAPE_OPTIONS.map((value) => {
                const isActive = drawingShapeType === value;
                return (
                  <button
                    key={value}
                    type='button'
                    onClick={() => onSelectShape(isActive ? null : value)}
                    disabled={isPending || !hasCanvas}
                    title={t(`products.templates.editor.shape.${value}`)}
                    className={`flex aspect-square cursor-pointer items-center justify-center rounded-md border p-3 transition-colors ${
                      isActive ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground/70 hover:bg-muted hover:text-muted-foreground'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <ShapeGlyph shapeType={value} className='size-full' />
                  </button>
                );
              })}
            </div>
            {drawingShapeType ? (
              <p className='text-primary text-[11px]'>
                {t('products.templates.editor.shape_draw_hint', 'Drag on the canvas to draw · Esc to cancel')}
              </p>
            ) : null}
          </div>
        ) : null}

        {/* --- Background --- */}
        {activeTab === 'background' ? (
          <div className='space-y-4 p-3'>
            {/* Background image (per side) */}
            <div className='space-y-2'>
              <Label className='text-xs'>
                {t('products.templates.editor.background.image', 'Background Image')} · <span className='capitalize'>{sideLabel}</span>
              </Label>
              <input ref={bgInputRef} type='file' accept='image/*' className='hidden' onChange={onUploadBackground} />
              <div className='flex items-center gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='h-8 flex-1 gap-1 text-xs'
                  onClick={() => bgInputRef.current?.click()}
                  disabled={isPending || !hasCanvas || isUploadingBg}
                >
                  <ImageIcon className='size-3.5' />
                  {isUploadingBg
                    ? tCommon('message.uploading', 'Uploading…')
                    : backgroundUrl
                      ? t('products.templates.editor.background.change', 'Change Background')
                      : t('products.templates.editor.background.add', 'Add Background')}
                </Button>
                {backgroundUrl ? (
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon-sm'
                    className='text-destructive'
                    onClick={onRemoveBackground}
                    disabled={isPending}
                    title={t('products.templates.editor.background.remove', 'Remove background')}
                  >
                    <Trash2 className='size-3.5' />
                  </Button>
                ) : null}
              </div>
            </div>

            {/* Background color (per side) — sits under the trim, behind the background image */}
            <div className='space-y-2 border-t pt-4'>
              <Label className='text-xs'>
                {t('products.templates.editor.background.color', 'Background Color')} · <span className='capitalize'>{sideLabel}</span>
              </Label>
              <div className='flex items-center gap-2'>
                <AppColorPicker
                  value={backgroundColor || ''}
                  onChange={onChangeBackgroundColor}
                  disabled={isPending || !hasCanvas}
                  className='h-9 w-12'
                />
                <span className='text-muted-foreground flex-1 truncate text-xs'>
                  {backgroundColor || t('products.templates.editor.background.no_color', 'None (white)')}
                </span>
                {backgroundColor ? (
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon-sm'
                    className='text-destructive'
                    onClick={() => onChangeBackgroundColor('')}
                    disabled={isPending}
                    title={t('products.templates.editor.background.color_remove', 'Clear background color')}
                  >
                    <Trash2 className='size-3.5' />
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
