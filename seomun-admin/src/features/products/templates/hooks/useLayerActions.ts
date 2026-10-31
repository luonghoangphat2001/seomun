import { useCallback, useEffect, useRef, useState } from 'react';
import { useFieldArray, type Path, type UseFormReturn } from 'react-hook-form';

import { FontWeight, LayerType, ShapeType, type Side, TextAlign } from '../enums';
import type { CreateTemplateFormValues, LayerFormValues } from '../schemas';

// === Layer factories ===

// Shared across every layer type — stroke/lock/visibility/opacity/shadow all start "off".
const LAYER_STYLE_DEFAULTS = {
  fill_image_url: '',
  stroke_color: '',
  stroke_width: 1,
  locked: false,
  visible: true,
  opacity: 1,
  shadow_color: '',
  shadow_blur: 0,
  shadow_offset_x: 0,
  shadow_offset_y: 0,
  shadow_opacity: 1,
} as const;

function newTextLayer(side: Side): LayerFormValues {
  return {
    layer_id: crypto.randomUUID(),
    type: LayerType.TEXT,
    side,
    field_key: 'Text',
    default_value: 'Text',
    image_url: '',
    shape_type: ShapeType.RECTANGLE,
    polygon_sides: 6,
    position_x: 20,
    position_y: 20,
    width: 48,
    height: 24,
    rotation: 0,
    font_family: 'sans-serif',
    font_size: 18,
    font_weight: FontWeight.REGULAR,
    line_height: 1.3,
    color: '#111827',
    align: TextAlign.LEFT,
    ...LAYER_STYLE_DEFAULTS,
  };
}

function newImageLayer(side: Side): LayerFormValues {
  return {
    layer_id: crypto.randomUUID(),
    type: LayerType.IMAGE,
    side,
    field_key: 'Image',
    default_value: '',
    image_url: '',
    shape_type: ShapeType.RECTANGLE,
    polygon_sides: 6,
    position_x: 20,
    position_y: 20,
    width: 120,
    height: 120,
    rotation: 0,
    font_family: '',
    font_size: 14,
    font_weight: FontWeight.REGULAR,
    line_height: 1.2,
    color: '#000000',
    align: TextAlign.LEFT,
    ...LAYER_STYLE_DEFAULTS,
  };
}

function newShapeLayer(side: Side, shapeType: ShapeType, pos?: { x: number; y: number; w: number; h: number; rotation?: number }): LayerFormValues {
  const isLine = shapeType === ShapeType.LINE;
  const hasDrag = !!pos && pos.w >= 5;
  return {
    layer_id: crypto.randomUUID(),
    type: LayerType.SHAPE,
    side,
    // e.g. triangle → 'Triangle', rectangle → 'Rectangle'; user can rename.
    field_key: shapeType.charAt(0).toUpperCase() + shapeType.slice(1),
    default_value: '',
    image_url: '',
    shape_type: shapeType,
    polygon_sides: 6,
    position_x: pos?.x ?? 20,
    position_y: pos?.y ?? 20,
    width: hasDrag ? pos.w : isLine ? 160 : 92,
    height: isLine ? 1 : hasDrag ? pos.h : 92,
    rotation: hasDrag ? (pos.rotation ?? 0) : 0,
    font_family: '',
    font_size: 14,
    font_weight: FontWeight.REGULAR,
    line_height: 1.2,
    color: '#94a3b8',
    align: TextAlign.LEFT,
    ...LAYER_STYLE_DEFAULTS,
  };
}

// === Hook ===

export function useLayerActions(form: UseFormReturn<CreateTemplateFormValues>, activeSide: Side, isPending: boolean) {
  const { append, remove, move } = useFieldArray({ control: form.control, name: 'layers' });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);

  const handleAddText = useCallback(() => {
    const layer = newTextLayer(activeSide);
    append(layer);
    setSelectedIds([layer.layer_id]);
  }, [activeSide, append]);

  const handleAddImage = useCallback(() => {
    const layer = newImageLayer(activeSide);
    append(layer);
    setSelectedIds([layer.layer_id]);
  }, [activeSide, append]);

  const handleAddShape = useCallback(
    (shapeType: ShapeType, pos?: { x: number; y: number; w: number; h: number; rotation?: number }) => {
      const layer = newShapeLayer(activeSide, shapeType, pos);
      append(layer);
      setSelectedIds([layer.layer_id]);
    },
    [activeSide, append],
  );

  const handleDeleteLayer = useCallback(
    (id: string) => {
      const layers = form.getValues('layers');
      const index = layers.findIndex((l) => l.layer_id === id);
      if (index < 0 || layers[index].locked) return;
      remove(index);
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    },
    [form, remove],
  );

  // Deletes every currently-selected, unlocked layer at once (Delete/Backspace with a multi-selection).
  const handleDeleteSelected = useCallback(() => {
    const layers = form.getValues('layers');
    const indices = layers.map((l, i) => (selectedIds.includes(l.layer_id) && !l.locked ? i : -1)).filter((i) => i >= 0);
    if (!indices.length) return;
    remove(indices);
    setSelectedIds([]);
  }, [form, remove, selectedIds]);

  // Reorder z-index by swapping with the adjacent layer on the same side.
  // Konva renders in array order: later index = on top (forward).
  const moveLayer = useCallback(
    (id: string, dir: 1 | -1) => {
      const all = form.getValues('layers');
      const from = all.findIndex((l) => l.layer_id === id);
      if (from < 0) return;
      const side = all[from].side;
      let to = from + dir;
      while (to >= 0 && to < all.length && all[to].side !== side) to += dir;
      if (to < 0 || to >= all.length) return;
      move(from, to);
    },
    [form, move],
  );

  // Move to the front (top) or back (bottom) of its own side.
  const moveLayerToEdge = useCallback(
    (id: string, edge: 'front' | 'back') => {
      const all = form.getValues('layers');
      const from = all.findIndex((l) => l.layer_id === id);
      if (from < 0) return;
      const side = all[from].side;
      const sameSideIdx = all.map((l, i) => (l.side === side ? i : -1)).filter((i) => i >= 0);
      const to = edge === 'front' ? sameSideIdx[sameSideIdx.length - 1] : sameSideIdx[0];
      if (to === from) return;
      move(from, to);
    },
    [form, move],
  );

  const duplicateLayer = useCallback(
    (id: string) => {
      const src = form.getValues('layers').find((l) => l.layer_id === id);
      if (!src) return;
      const clone: LayerFormValues = {
        ...src,
        layer_id: crypto.randomUUID(),
        position_x: Number(src.position_x) + 10,
        position_y: Number(src.position_y) + 10,
        locked: false,
      };
      append(clone);
      setSelectedIds([clone.layer_id]);
    },
    [form, append],
  );

  const toggleLayerLock = useCallback(
    (id: string) => {
      const index = form.getValues('layers').findIndex((l) => l.layer_id === id);
      if (index < 0) return;
      const locked = form.getValues(`layers.${index}.locked`);
      form.setValue(`layers.${index}.locked`, !locked, { shouldDirty: true });
    },
    [form],
  );

  const toggleLayerVisible = useCallback(
    (id: string) => {
      const index = form.getValues('layers').findIndex((l) => l.layer_id === id);
      if (index < 0) return;
      const visible = form.getValues(`layers.${index}.visible`);
      form.setValue(`layers.${index}.visible`, !visible, { shouldDirty: true });
    },
    [form],
  );

  // In-memory clipboard for Copy / Ctrl+V paste — cleared on unmount, not persisted.
  const clipboardRef = useRef<LayerFormValues | null>(null);

  const copyLayer = useCallback(
    (id: string) => {
      const src = form.getValues('layers').find((l) => l.layer_id === id);
      if (!src) return;
      clipboardRef.current = src;
    },
    [form],
  );

  // With a target point (e.g. right-click position), the layer is centered on
  // it; otherwise it's offset from its source, matching classic Ctrl+V.
  const pasteLayer = useCallback(
    (at?: { x: number; y: number }) => {
      const src = clipboardRef.current;
      if (!src) return;
      const clone: LayerFormValues = {
        ...src,
        layer_id: crypto.randomUUID(),
        side: activeSide,
        position_x: at ? Math.round(at.x - Number(src.width) / 2) : Number(src.position_x) + 10,
        position_y: at ? Math.round(at.y - Number(src.height) / 2) : Number(src.position_y) + 10,
        locked: false,
      };
      append(clone);
      setSelectedIds([clone.layer_id]);
    },
    [activeSide, append],
  );

  // Right-clicking a member of the current multi-selection keeps the whole
  // selection; right-clicking anything else narrows the selection to just it.
  const openMenu = useCallback((id: string, x: number, y: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev : [id]));
    setMenu({ id, x, y });
  }, []);

  const updateLayerById = useCallback(
    (id: string, patch: Partial<LayerFormValues>) => {
      const index = form.getValues('layers').findIndex((l) => l.layer_id === id);
      if (index < 0) return;
      (Object.entries(patch) as [keyof LayerFormValues, unknown][]).forEach(([key, value]) => {
        form.setValue(`layers.${index}.${key}` as Path<CreateTemplateFormValues>, value as never, { shouldDirty: true });
      });
    },
    [form],
  );

  // Delete/Backspace removes every selected layer (unless typing in a field).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!selectedIds.length || isPending) return;
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) return;
      e.preventDefault();
      handleDeleteSelected();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedIds, isPending, handleDeleteSelected]);

  // Ctrl/Cmd+V pastes the last copied layer (unless typing in a field).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isPending || !(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'v') return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) return;
      e.preventDefault();
      pasteLayer();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPending, pasteLayer]);

  // Close the context menu on any outside interaction / Escape.
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(null);
    };
    window.addEventListener('mousedown', close);
    window.addEventListener('scroll', close, true);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  return {
    selectedIds,
    setSelectedIds,
    menu,
    setMenu,
    handleAddText,
    handleAddImage,
    handleAddShape,
    handleDeleteLayer,
    handleDeleteSelected,
    moveLayer,
    moveLayerToEdge,
    duplicateLayer,
    toggleLayerLock,
    toggleLayerVisible,
    copyLayer,
    pasteLayer,
    openMenu,
    updateLayerById,
  };
}
