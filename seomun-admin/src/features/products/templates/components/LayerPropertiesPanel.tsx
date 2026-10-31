import { type ChangeEvent, type ReactNode, type RefObject } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import type { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { AppColorPicker } from '@/components/shared/app-color-picker/AppColorPicker';
import { AppInputFormField, AppSelectFormField } from '@/components/shared/form-fields';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import { FontWeight, LayerType, ShapeType, type Side, TextAlign } from '../enums';
import type { CreateTemplateFormValues, LayerFormValues } from '../schemas';

// === Type definitions ===

export interface LayerPropertiesPanelProps {
  selectedLayer: LayerFormValues | null;
  selectedIndex: number;
  control: Control<CreateTemplateFormValues>;
  availableSides: Side[];
  isPending: boolean;
  isUploading: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onUploadImage: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Shape fill-image upload (separate input so it doesn't clash with image-layer upload). */
  isUploadingFill: boolean;
  fillImageInputRef: RefObject<HTMLInputElement | null>;
  onUploadFillImage: (e: ChangeEvent<HTMLInputElement>) => void;
  onDeleteLayer: (id: string) => void;
  onUpdateLayer: (id: string, patch: Partial<LayerFormValues>) => void;
  metadataContent?: ReactNode;
  /** Total selected layers — used to show a "N objects selected" message instead of the empty state. */
  selectedCount?: number;
}

// === Component ===

export function LayerPropertiesPanel({
  selectedLayer,
  selectedIndex,
  control,
  availableSides,
  isPending,
  isUploading,
  fileInputRef,
  onUploadImage,
  isUploadingFill,
  fillImageInputRef,
  onUploadFillImage,
  onDeleteLayer,
  onUpdateLayer,
  metadataContent,
  selectedCount = 0,
}: LayerPropertiesPanelProps) {
  const { t } = useTranslation('page');
  const { t: tCommon } = useTranslation('common');

  // Options are built from translations, so they stay inside the component.
  const fontWeightOptions = [
    { value: FontWeight.REGULAR, label: t('products.templates.editor.font_weight.regular', 'Regular') },
    { value: FontWeight.MEDIUM, label: t('products.templates.editor.font_weight.medium', 'Medium') },
    { value: FontWeight.BOLD, label: t('products.templates.editor.font_weight.bold', 'Bold') },
  ];
  const textAlignOptions = [
    { value: TextAlign.LEFT, label: t('products.templates.editor.align.left', 'Left') },
    { value: TextAlign.CENTER, label: t('products.templates.editor.align.center', 'Center') },
    { value: TextAlign.RIGHT, label: t('products.templates.editor.align.right', 'Right') },
    { value: TextAlign.JUSTIFY, label: t('products.templates.editor.align.justify', 'Justify') },
  ];
  const shapeTypeOptions = [
    { value: ShapeType.RECTANGLE, label: t('products.templates.editor.shape.rectangle', 'Rectangle') },
    { value: ShapeType.ROUNDED_RECTANGLE, label: t('products.templates.editor.shape.rounded_rectangle', 'Rounded Rectangle') },
    { value: ShapeType.CIRCLE, label: t('products.templates.editor.shape.circle', 'Circle') },
    { value: ShapeType.TRIANGLE, label: t('products.templates.editor.shape.triangle', 'Triangle') },
    { value: ShapeType.TRIANGLE_DOWN, label: t('products.templates.editor.shape.triangle_down', 'Inverted Triangle') },
    { value: ShapeType.DIAMOND, label: t('products.templates.editor.shape.diamond', 'Diamond') },
    { value: ShapeType.STAR_5, label: t('products.templates.editor.shape.star_5', 'Star') },
    { value: ShapeType.STAR_4, label: t('products.templates.editor.shape.star_4', 'Sparkle') },
    { value: ShapeType.STAR_6, label: t('products.templates.editor.shape.star_6', '6-Point Star') },
    { value: ShapeType.BURST_12, label: t('products.templates.editor.shape.burst_12', 'Burst') },
    { value: ShapeType.SCALLOP_1, label: t('products.templates.editor.shape.scallop_1', 'Scallop') },
    { value: ShapeType.SCALLOP_2, label: t('products.templates.editor.shape.scallop_2', 'Flower') },
  ];

  if (!selectedLayer || selectedIndex < 0) {
    if (selectedCount > 1) {
      return (
        <div className='flex h-full items-center justify-center p-6'>
          <p className='text-muted-foreground text-center text-sm'>
            {t('products.templates.editor.multi_selected', '{{count}} objects selected. Drag to move, resize together, or rotate.', {
              count: selectedCount,
            })}
          </p>
        </div>
      );
    }
    return metadataContent ? (
      <>{metadataContent}</>
    ) : (
      <div className='flex h-full items-center justify-center p-6'>
        <p className='text-muted-foreground text-center text-sm'>
          {t('products.templates.editor.empty_hint', 'Add a layer, or click one on the canvas to edit it.')}
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4 p-4'>
      <div className='flex items-center justify-between'>
        <p className='text-sm font-semibold'>
          {t('products.templates.editor.layer_title', '{{type}} Layer', { type: t(`products.templates.editor.type.${selectedLayer.type}`) })}
        </p>
        <button
          type='button'
          className='text-destructive/80 hover:text-destructive cursor-pointer'
          onClick={() => onDeleteLayer(selectedLayer.layer_id)}
          disabled={isPending}
        >
          <Trash2 className='size-4' />
        </button>
      </div>

      <AppInputFormField
        name={`layers.${selectedIndex}.field_key`}
        control={control}
        label={t('products.templates.editor.prop.field_key', 'Field Key')}
        required
        disabled={isPending}
      />
      <AppSelectFormField
        name={`layers.${selectedIndex}.side`}
        control={control}
        label={t('products.templates.editor.prop.side', 'Side')}
        options={availableSides.map((s) => ({ value: s, label: t(`products.templates.editor.side.${s}`) }))}
        disabled={isPending}
        required
      />

      {/* Content — varies by type */}
      {selectedLayer.type === LayerType.IMAGE ? (
        <div className='space-y-2'>
          <AppInputFormField
            name={`layers.${selectedIndex}.image_url`}
            control={control}
            label={t('products.templates.editor.prop.image_url', 'Image URL')}
            disabled={isPending}
          />
          <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={onUploadImage} />
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='w-full gap-1.5'
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending || isUploading}
          >
            <ImagePlus className='size-4' />
            {isUploading ? tCommon('message.uploading', 'Uploading…') : t('products.templates.editor.prop.upload_image', 'Upload Image')}
          </Button>
        </div>
      ) : selectedLayer.type === LayerType.SHAPE ? (
        <div className='space-y-3'>
          <AppSelectFormField
            name={`layers.${selectedIndex}.shape_type`}
            control={control}
            label={t('products.templates.editor.prop.shape_type', 'Shape Type')}
            options={shapeTypeOptions}
            disabled={isPending}
            required
          />
          {selectedLayer.shape_type === ShapeType.POLYGON ? (
            <AppInputFormField
              name={`layers.${selectedIndex}.polygon_sides`}
              control={control}
              label={t('products.templates.editor.prop.polygon_sides', 'Sides')}
              type='number'
              min={3}
              max={12}
              disabled={isPending}
            />
          ) : null}
          <div className='space-y-1.5'>
            <Label className='text-xs'>{t('products.templates.editor.prop.fill', 'Fill')}</Label>
            <div className='flex items-center gap-2'>
              <AppColorPicker
                value={selectedLayer.color || '#94a3b8'}
                onChange={(hex) => onUpdateLayer(selectedLayer.layer_id, { color: hex })}
                disabled={isPending}
                className='h-8 w-10'
              />
              <AppInputFormField name={`layers.${selectedIndex}.color`} control={control} fieldClassName='flex-1' disabled={isPending} />
            </div>
          </div>

          {/* Fill image — overrides the color fill when set (Konva fillPatternImage). */}
          <div className='space-y-1.5'>
            <Label className='text-xs'>{t('products.templates.editor.prop.fill_image', 'Fill Image')}</Label>
            <input ref={fillImageInputRef} type='file' accept='image/*' className='hidden' onChange={onUploadFillImage} />
            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='flex-1 gap-1.5'
                onClick={() => fillImageInputRef.current?.click()}
                disabled={isPending || isUploadingFill}
              >
                <ImagePlus className='size-4' />
                {isUploadingFill
                  ? tCommon('message.uploading', 'Uploading…')
                  : selectedLayer.fill_image_url
                    ? t('products.templates.editor.prop.image_change', 'Change Image')
                    : t('products.templates.editor.prop.image_add', 'Add Image')}
              </Button>
              {selectedLayer.fill_image_url ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon-sm'
                  className='text-destructive'
                  onClick={() => onUpdateLayer(selectedLayer.layer_id, { fill_image_url: '' })}
                  disabled={isPending}
                  title={t('products.templates.editor.prop.fill_image_remove', 'Remove fill image')}
                >
                  <Trash2 className='size-4' />
                </Button>
              ) : null}
            </div>
          </div>

          {/* A line's own thickness/color is its stroke — a separate border doesn't apply. */}
          {selectedLayer.shape_type !== ShapeType.LINE ? (
            <div className='space-y-1.5'>
              <Label className='text-xs'>{t('products.templates.editor.prop.border', 'Border')}</Label>
              <div className='flex items-center gap-2'>
                <AppColorPicker
                  value={selectedLayer.stroke_color || '#000000'}
                  onChange={(hex) => onUpdateLayer(selectedLayer.layer_id, { stroke_color: hex })}
                  disabled={isPending}
                  className='h-8 w-10'
                />
                <AppInputFormField
                  name={`layers.${selectedIndex}.stroke_width`}
                  control={control}
                  type='number'
                  placeholder={t('products.templates.editor.prop.border_width_placeholder', 'Width')}
                  fieldClassName='flex-1'
                  disabled={isPending}
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <AppInputFormField
          name={`layers.${selectedIndex}.default_value`}
          control={control}
          label={t('products.templates.editor.prop.text_content', 'Text Content')}
          disabled={isPending}
        />
      )}

      <Separator />

      {/* Geometry */}
      <div className='space-y-2'>
        <p className='text-muted-foreground text-xs font-medium'>{t('products.templates.editor.prop.position', 'Position')}</p>
        <div className='grid grid-cols-2 gap-2'>
          <AppInputFormField
            name={`layers.${selectedIndex}.position_x`}
            control={control}
            label={t('products.templates.editor.prop.x', 'X')}
            type='number'
            disabled={isPending}
          />
          <AppInputFormField
            name={`layers.${selectedIndex}.position_y`}
            control={control}
            label={t('products.templates.editor.prop.y', 'Y')}
            type='number'
            disabled={isPending}
          />
        </div>
      </div>
      <div className='space-y-2'>
        <p className='text-muted-foreground text-xs font-medium'>{t('products.templates.editor.prop.size', 'Size')}</p>
        <div className='grid grid-cols-2 gap-2'>
          <AppInputFormField
            name={`layers.${selectedIndex}.width`}
            control={control}
            label={t('products.templates.editor.prop.width', 'Width')}
            type='number'
            disabled={isPending}
          />
          {/* Text height is auto (driven by font size), so it isn't manually editable. */}
          {selectedLayer.type !== LayerType.TEXT ? (
            <AppInputFormField
              name={`layers.${selectedIndex}.height`}
              control={control}
              label={t('products.templates.editor.prop.height', 'Height')}
              type='number'
              disabled={isPending}
            />
          ) : null}
        </div>
        <AppInputFormField
          name={`layers.${selectedIndex}.rotation`}
          control={control}
          label={t('products.templates.editor.prop.rotation', 'Rotation (°)')}
          type='number'
          disabled={isPending}
        />
      </div>

      {/* Text style */}
      {selectedLayer.type === LayerType.TEXT ? (
        <>
          <Separator />
          <div className='space-y-3'>
            <p className='text-muted-foreground text-xs font-medium'>{t('products.templates.editor.prop.text_style', 'Text Style')}</p>
            <AppInputFormField
              name={`layers.${selectedIndex}.font_family`}
              control={control}
              label={t('products.templates.editor.prop.font_family', 'Font Family')}
              disabled={isPending}
            />
            <div className='grid grid-cols-2 gap-2'>
              <AppInputFormField
                name={`layers.${selectedIndex}.font_size`}
                control={control}
                label={t('products.templates.editor.prop.font_size', 'Size')}
                type='number'
                min={1}
                disabled={isPending}
              />
              <AppInputFormField
                name={`layers.${selectedIndex}.line_height`}
                control={control}
                label={t('products.templates.editor.prop.line_height', 'Line Height')}
                type='number'
                min={0}
                step={0.1}
                disabled={isPending}
              />
            </div>
            <AppSelectFormField
              name={`layers.${selectedIndex}.font_weight`}
              control={control}
              label={t('products.templates.editor.prop.weight', 'Weight')}
              options={fontWeightOptions}
              disabled={isPending}
              required
            />
            <AppSelectFormField
              name={`layers.${selectedIndex}.align`}
              control={control}
              label={t('products.templates.editor.prop.align', 'Align')}
              options={textAlignOptions}
              disabled={isPending}
              required
            />
            <div className='space-y-1.5'>
              <Label className='text-xs'>{t('products.templates.editor.prop.color', 'Color')}</Label>
              <div className='flex items-center gap-2'>
                <AppColorPicker
                  value={selectedLayer.color || '#000000'}
                  onChange={(hex) => onUpdateLayer(selectedLayer.layer_id, { color: hex })}
                  disabled={isPending}
                  className='h-8 w-10'
                />
                <AppInputFormField name={`layers.${selectedIndex}.color`} control={control} fieldClassName='flex-1' disabled={isPending} />
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Effects — opacity and shadow apply the same way to every layer type */}
      <Separator />
      <div className='space-y-3'>
        <p className='text-muted-foreground text-xs font-medium'>{t('products.templates.editor.prop.effects', 'Effects')}</p>
        <AppInputFormField
          name={`layers.${selectedIndex}.opacity`}
          control={control}
          label={t('products.templates.editor.prop.opacity', 'Opacity')}
          type='number'
          step={0.1}
          min={0}
          max={1}
          disabled={isPending}
        />
        <div className='space-y-1.5'>
          <Label className='text-xs'>{t('products.templates.editor.prop.shadow', 'Shadow')}</Label>
          <div className='flex items-center gap-2'>
            <AppColorPicker
              value={selectedLayer.shadow_color || '#000000'}
              onChange={(hex) => onUpdateLayer(selectedLayer.layer_id, { shadow_color: hex })}
              disabled={isPending}
              className='h-8 w-10'
            />
            <AppInputFormField
              name={`layers.${selectedIndex}.shadow_blur`}
              control={control}
              type='number'
              placeholder={t('products.templates.editor.prop.shadow_blur_placeholder', 'Blur')}
              fieldClassName='flex-1'
              disabled={isPending}
            />
          </div>
          <div className='grid grid-cols-3 gap-2'>
            <AppInputFormField
              name={`layers.${selectedIndex}.shadow_offset_x`}
              control={control}
              label={t('products.templates.editor.prop.offset_x', 'Offset X')}
              type='number'
              disabled={isPending}
            />
            <AppInputFormField
              name={`layers.${selectedIndex}.shadow_offset_y`}
              control={control}
              label={t('products.templates.editor.prop.offset_y', 'Offset Y')}
              type='number'
              disabled={isPending}
            />
            <AppInputFormField
              name={`layers.${selectedIndex}.shadow_opacity`}
              control={control}
              label={t('products.templates.editor.prop.shadow_strength', 'Strength')}
              type='number'
              step={0.1}
              min={0}
              max={1}
              disabled={isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
