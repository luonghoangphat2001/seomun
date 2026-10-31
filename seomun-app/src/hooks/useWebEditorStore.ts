import { Layer, Template } from '@/apis/product/product.response';
import {
  BLEED_PX,
  CARD_SIZE_PX,
  DEFAULT_BACKGROUND,
  DEFAULT_IMAGE_OBJECT,
  DEFAULT_SHAPE_OBJECT,
  DEFAULT_TEXT_OBJECT,
  DEFAULT_ZOOM,
  GENERAL_BANNERS,
  FONT_FAMILIES,
  MAX_HISTORY_SIZE,
  MIN_ZOOM,
  RULER_SIZE,
  SAFE_MARGIN_PX,
} from '@/constants/web-editor';
import { EditorTabType, ObjectType } from '@/enums/editor';
import {
  BackgroundObject,
  CanvasObject,
  CanvasState,
  CardSideData,
  ImageObject,
  Position,
  ShapeObject,
  ShapeType,
  TextObject,
} from '@/types';
import { DesignWebEditor } from '@/types/design';
import Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

interface WebEditorState extends Omit<CanvasState, 'objects' | 'background'> {
  // EDITOR DATA (source of truth)
  activeSide: number;
  datas: CardSideData[];

  // UI ARTIFACTS (ephemeral, not in history)
  thumbnails: string[];
  isExportLoading: boolean;
  isDirty: boolean;
  canvasSize: { width: number; height: number };
  activeTab: EditorTabType;
  selectedBannerId: string;
  isGridView: boolean;
  isSheetExpanded: boolean;
  isInitialCanvasConfigured: boolean;
  isInitialCanvasReady: boolean;
  templates: Template[];
  selectedTemplateId: number | null;
  selectedSizeOptionId: number | null;
  webEditor: DesignWebEditor | null;
  bleedPx: number;
  safeAreaPx: number;
  customSizeMm: { width: number; height: number } | null;

  // Slideshow
  isSlideshowOpen: boolean;
  slideshowImages: string[];
  isSlideshowLoading: boolean;

  // History managed per side in datas

  // Actions - Side Management
  selectSide: (side: number) => void;
  addSide: () => void;
  deleteSide: (index: number) => void;
  updateThumbnail: (side: number, dataURL: string) => void;
  setActiveTab: (tab: EditorTabType) => void;
  selectBanner: (bannerId: string) => void;
  setIsGridView: (value: boolean) => void;
  setIsSheetExpanded: (value: boolean) => void;
  setIsInitialCanvasConfigured: (value: boolean) => void;
  setIsInitialCanvasReady: (value: boolean) => void;
  setTemplates: (templates: Template[]) => void;
  setSelectedSizeOptionId: (sizeOptionId: number | null) => void;
  setWebEditor: (webEditor: DesignWebEditor | null) => void;
  setCustomSize: (size: { width: number; height: number; dpi: number }) => void;

  // Actions - Object Management
  addObject: (object: Omit<CanvasObject, 'id' | 'zIndex'>) => string;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  deleteObject: (id: string) => void;
  duplicateObject: (id: string) => string | null;
  reorderObject: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;

  // Actions - Text
  addText: (position?: Position) => string;
  updateText: (id: string, updates: Partial<TextObject>) => void;

  // Actions - Image
  addImage: (src: string, originalWidth: number, originalHeight: number, position?: Position) => string;
  updateImage: (id: string, updates: Partial<ImageObject>) => void;

  // Actions - Shape
  addShape: (shapeType: ShapeType, position?: Position) => string;
  updateShape: (id: string, updates: Partial<ShapeObject>) => void;

  // Actions - Background
  updateBackground: (updates: Partial<BackgroundObject>) => void;

  // Actions - Selection
  selectObject: (id: string | null) => void;

  // Actions - History
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  // Actions - View
  setZoom: (zoom: number) => void;
  setPan: (pan: Position) => void;
  resetView: () => void;
  fitToScreen: (width: number, height: number) => void;
  toggleWorkSize: () => void;
  toggleTrimSize: () => void;
  toggleSafeArea: () => void;

  // Actions - Export Loading
  setExportLoading: (loading: boolean) => void;

  // Actions - Slideshow
  openSlideshow: (showModal?: boolean) => Promise<string[]>;
  closeSlideshow: () => void;

  // Utility
  clearCanvas: () => void;
  resetEditor: () => void;
  getSelectedObject: () => CanvasObject | null;

  // Getters for current side (computed)
  getCurrentObjects: () => CanvasObject[];
  getCurrentBackground: () => BackgroundObject;

  //export
  exportImages: (includeCutlines?: boolean) => Promise<string[]>;
  stageRef: React.RefObject<Konva.Stage | null> | null;
  setStageRef: (stageRef: React.RefObject<Konva.Stage | null>) => void;

  //--------------
  setTemplate: (
    template: Template | null,
    layersOverride?: Layer[],
    options?: {
      previewImages?: string[];
      hasBackSide?: boolean;
      sizeMm?: { width: number; height: number };
      webEditor?: DesignWebEditor | null;
      backgrounds?: Array<{ color?: string; image_url?: string }>;
      sidesToUpdate?: Array<import('@/types').CardSide>;
    },
  ) => void;
  // Actions - Load
  loadDesign: (data: {
    datas: CardSideData[];
    canvasSize?: { width: number; height: number };
    sidedness?: 'SINGLE' | 'DOUBLE';
  }) => void;
}

const getNextZIndex = (objects: CanvasObject[]): number => {
  if (objects.length === 0) return 0;
  return Math.max(...objects.map((obj) => obj.zIndex)) + 1;
};

export const useWebEditorStore = create<WebEditorState>((set, get) => ({
  // EDITOR DATA - Initial state
  activeSide: 0,
  datas: [
    {
      objects: [],
      background: DEFAULT_BACKGROUND,
      past: [],
      future: [],
    },
  ],

  canvasSize: GENERAL_BANNERS[0].size ? { width: GENERAL_BANNERS[0].width, height: GENERAL_BANNERS[0].height } : CARD_SIZE_PX,
  activeTab: EditorTabType.TEMPLATE,
  selectedBannerId: GENERAL_BANNERS[0].id,
  isGridView: false,
  isSheetExpanded: false,
  isInitialCanvasConfigured: false,
  isInitialCanvasReady: false,
  templates: [],
  selectedTemplateId: null,
  selectedSizeOptionId: null,
  webEditor: null,
  bleedPx: BLEED_PX,
  safeAreaPx: SAFE_MARGIN_PX,
  customSizeMm: null,

  // UI ARTIFACTS - Initial state
  thumbnails: [],
  isSyncing: false,
  pendingSyncTimer: null,
  isExportLoading: false,
  isDirty: false,
  stageRef: null,

  // Slideshow state
  isSlideshowOpen: false,
  slideshowImages: [],
  isSlideshowLoading: false,

  // View state
  selectedId: null,
  zoom: DEFAULT_ZOOM,
  pan: { x: 0, y: 0 },
  rulersEnabled: true,
  snapToGrid: false,
  snapToObjects: true,
  workSizeVisible: true,
  trimSizeVisible: true,
  safeAreaVisible: true,

  // Utility Getters
  getCurrentObjects: () => {
    const state = get();
    return state.datas[state.activeSide].objects;
  },

  getCurrentBackground: () => {
    const state = get();
    return state.datas[state.activeSide].background;
  },

  // Side Management
  selectSide: (side) => {
    set({ activeSide: side, selectedId: null });
  },

  updateThumbnail: (side, dataURL) => {
    set((state) => {
      const newThumbnails = [...state.thumbnails];
      newThumbnails[side] = dataURL;

      return {
        thumbnails: newThumbnails,
      };
    });
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab, isSheetExpanded: true });
  },

  selectBanner: (bannerId) => {
    const banner = GENERAL_BANNERS.find((b) => b.id === bannerId);
    if (banner) {
      set({
        selectedBannerId: bannerId,
        canvasSize: { width: banner.width, height: banner.height },
        bleedPx: BLEED_PX,
        safeAreaPx: SAFE_MARGIN_PX,
        customSizeMm: null,
      });
    }
  },

  setIsGridView: (isGridView) => set({ isGridView }),

  setIsSheetExpanded: (isSheetExpanded) => set({ isSheetExpanded }),

  setIsInitialCanvasConfigured: (isInitialCanvasConfigured) => set({ isInitialCanvasConfigured }),

  setIsInitialCanvasReady: (isInitialCanvasReady) => set({ isInitialCanvasReady }),

  setTemplates: (templates) => set({ templates }),

  setSelectedSizeOptionId: (selectedSizeOptionId) => set({ selectedSizeOptionId }),

  setWebEditor: (webEditor) => {
    if (!webEditor) {
      set({ webEditor: null, bleedPx: BLEED_PX, safeAreaPx: SAFE_MARGIN_PX });
      return;
    }

    const dpi = webEditor.dpi > 0 ? webEditor.dpi : 200;
    const toPixels = (value: number) => (webEditor.unit.toLowerCase() === 'px' ? value : (value * dpi) / 25.4);

    set({
      webEditor,
      bleedPx: toPixels(webEditor.bleed ?? 0),
      safeAreaPx: toPixels(webEditor.safe_area ?? 0),
    });
  },

  setCustomSize: ({ width, height, dpi }) => {
    const validDpi = Number.isFinite(dpi) && dpi > 0 ? dpi : 200;
    const toPixels = (value: number) => (value * validDpi) / 25.4;

    set((state) => ({
      selectedBannerId: 'custom',
      customSizeMm: { width, height },
      canvasSize: {
        width: toPixels(width) + state.bleedPx * 2,
        height: toPixels(height) + state.bleedPx * 2,
      },
      selectedId: null,
    }));
  },

  addSide: () => {
    set((state) => {
      if (state.datas.length >= 2) return state;

      return {
        datas: [
          ...state.datas,
          {
            objects: [],
            background: { ...DEFAULT_BACKGROUND, id: uuidv4() },
            past: [],
            future: [],
          },
        ],
        activeSide: state.datas.length,
        selectedId: null,
      };
    });
  },

  deleteSide: (index) => {
    set((state) => {
      if (state.datas.length <= 1) return state;

      const newDatas = state.datas.filter((_, i) => i !== index);
      const newThumbnails = state.thumbnails.filter((_, i) => i !== index);
      let newActiveSide = state.activeSide;

      if (index === state.activeSide) {
        newActiveSide = Math.max(0, index - 1);
      } else if (index < state.activeSide) {
        newActiveSide--;
      }

      return {
        datas: newDatas,
        thumbnails: newThumbnails,
        activeSide: newActiveSide,
        selectedId: null,
      };
    });
  },

  // Object Management
  addObject: (object) => {
    const state = get();
    const id = uuidv4();
    const currentObjects = state.getCurrentObjects();

    const newObject = {
      ...object,
      id,
      zIndex: getNextZIndex(currentObjects),
    } as CanvasObject;

    set((state) => {
      const currentData = state.datas[state.activeSide];
      const past = [...currentData.past, { objects: currentData.objects, background: currentData.background }].slice(
        -MAX_HISTORY_SIZE,
      );
      const newDatas = [...state.datas];
      newDatas[state.activeSide] = {
        ...currentData,
        objects: [...currentData.objects, newObject],
        past,
        future: [],
      };

      return {
        datas: newDatas,
        selectedId: id,
        isSheetExpanded: true,
        isDirty: true,
      };
    });

    return id;
  },

  updateObject: (id, updates) => {
    set((state) => {
      const currentData = state.datas[state.activeSide];
      const objectIndex = currentData.objects.findIndex((obj) => obj.id === id);
      if (objectIndex === -1) return state;

      const past = [...currentData.past, { objects: currentData.objects, background: currentData.background }].slice(
        -MAX_HISTORY_SIZE,
      );

      const updatedObjects = [...currentData.objects];
      updatedObjects[objectIndex] = {
        ...updatedObjects[objectIndex],
        ...updates,
      } as CanvasObject;

      const updateDatas = [...state.datas];
      updateDatas[state.activeSide] = {
        ...currentData,
        objects: updatedObjects,
        past,
        future: [],
      };

      return {
        datas: updateDatas,
        isDirty: true,
      };
    });
  },

  deleteObject: (id) => {
    set((state) => {
      const currentData = state.datas[state.activeSide];
      const past = [...currentData.past, { objects: currentData.objects, background: currentData.background }].slice(
        -MAX_HISTORY_SIZE,
      );

      const newDatas = [...state.datas];
      newDatas[state.activeSide] = {
        ...currentData,
        objects: currentData.objects.filter((obj) => obj.id !== id),
        past,
        future: [],
      };

      return {
        datas: newDatas,
        selectedId: state.selectedId === id ? null : state.selectedId,
        isDirty: true,
      };
    });
  },

  duplicateObject: (id) => {
    const state = get();
    const currentObjects = state.getCurrentObjects();
    const object = currentObjects.find((obj) => obj.id === id);
    if (!object) return null;

    const newId = uuidv4();
    const duplicated = {
      ...object,
      id: newId,
      position: {
        x: object.position.x + 20,
        y: object.position.y + 20,
      },
      zIndex: getNextZIndex(currentObjects),
    };

    set((state) => {
      const currentData = state.datas[state.activeSide];
      const past = [...currentData.past, { objects: currentData.objects, background: currentData.background }].slice(
        -MAX_HISTORY_SIZE,
      );

      const newDatas = [...state.datas];
      newDatas[state.activeSide] = {
        ...currentData,
        objects: [...currentData.objects, duplicated],
        past,
        future: [],
      };

      return {
        datas: newDatas,
        selectedId: newId,
        isDirty: true,
      };
    });

    return newId;
  },

  reorderObject: (id, direction) => {
    set((state) => {
      const currentData = state.datas[state.activeSide];
      const index = currentData.objects.findIndex((obj) => obj.id === id);
      if (index === -1) return state;

      const objects = [...currentData.objects];
      const [object] = objects.splice(index, 1);

      let newIndex = index;
      switch (direction) {
        case 'up':
          newIndex = Math.min(index + 1, objects.length);
          break;
        case 'down':
          newIndex = Math.max(index - 1, 0);
          break;
        case 'top':
          newIndex = objects.length;
          break;
        case 'bottom':
          newIndex = 0;
          break;
      }

      objects.splice(newIndex, 0, object);

      const reorderedObjects = objects.map((obj, i) => ({
        ...obj,
        zIndex: i,
      }));

      const past = [...currentData.past, { objects: currentData.objects, background: currentData.background }].slice(
        -MAX_HISTORY_SIZE,
      );

      const newDatas = [...state.datas];
      newDatas[state.activeSide] = {
        ...currentData,
        objects: reorderedObjects,
        past,
        future: [],
      };

      return {
        datas: newDatas,
        isDirty: true,
      };
    });
  },

  // Text Actions
  addText: (position) => {
    const state = get();
    const pos = position || {
      x: state.canvasSize.width / 2 - 50,
      y: state.canvasSize.height / 2 - 10,
    };

    const textObject: Omit<TextObject, 'id' | 'zIndex'> = {
      type: ObjectType.TEXT,
      ...DEFAULT_TEXT_OBJECT,
      position: pos,
      size: { width: 100, height: 20 },
    };

    return get().addObject(textObject);
  },

  updateText: (id, updates) => {
    get().updateObject(id, updates);
  },

  // Image Actions
  addImage: (src, originalWidth, originalHeight, position) => {
    const state = get();
    const aspectRatio = originalWidth / originalHeight;
    const maxWidth = state.canvasSize.width * 0.4;
    const maxHeight = state.canvasSize.height * 0.4;

    let width = maxWidth;
    let height = width / aspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    const pos = position || {
      x: (state.canvasSize.width - width) / 2,
      y: (state.canvasSize.height - height) / 2,
    };

    const imageObject: Omit<ImageObject, 'id' | 'zIndex'> = {
      type: ObjectType.IMAGE,
      ...DEFAULT_IMAGE_OBJECT,
      src,
      originalWidth,
      originalHeight,
      position: pos,
      size: { width, height },
      cropWidth: originalWidth,
      cropHeight: originalHeight,
    };

    return get().addObject(imageObject);
  },

  updateImage: (id, updates) => {
    get().updateObject(id, updates);
  },

  // Shape Actions
  addShape: (shapeType, position) => {
    const state = get();
    const defaultSize = { width: 92, height: 92 };
    const pos = position || {
      x: state.canvasSize.width / 2 - defaultSize.width / 2,
      y: state.canvasSize.height / 2 - defaultSize.height / 2,
    };

    const shapeObject: Omit<ShapeObject, 'id' | 'zIndex'> = {
      type: ObjectType.SHAPE,
      ...DEFAULT_SHAPE_OBJECT,
      ...(shapeType === 'rounded_rectangle' ? { cornerRadius: 20 } : {}),
      shapeType,
      position: pos,
      size: defaultSize,
    };

    return get().addObject(shapeObject);
  },

  updateShape: (id, updates) => {
    get().updateObject(id, updates);
  },

  // Background Actions
  updateBackground: (updates) => {
    set((state) => {
      const currentData = state.datas[state.activeSide];
      const past = [...currentData.past, { objects: currentData.objects, background: currentData.background }].slice(
        -MAX_HISTORY_SIZE,
      );

      const newDatas = [...state.datas];
      newDatas[state.activeSide] = {
        ...currentData,
        background: {
          ...currentData.background,
          ...updates,
        },
        past,
        future: [],
      };

      return {
        datas: newDatas,
        isDirty: true,
      };
    });
  },

  // Selection
  selectObject: (id) => {
    set({ selectedId: id, isSheetExpanded: id !== null });
  },

  // History
  undo: () => {
    set((state) => {
      const currentData = state.datas[state.activeSide];
      if (currentData.past.length === 0) return state;

      const previous = currentData.past[currentData.past.length - 1];
      const newPast = currentData.past.slice(0, -1);
      const newFuture = [{ objects: currentData.objects, background: currentData.background }, ...currentData.future].slice(
        0,
        MAX_HISTORY_SIZE,
      );

      const newDatas = [...state.datas];
      newDatas[state.activeSide] = {
        ...currentData,
        objects: previous.objects,
        background: previous.background,
        past: newPast,
        future: newFuture,
      };

      return {
        datas: newDatas,
        selectedId: null,
        isDirty: true,
      };
    });
  },

  redo: () => {
    set((state) => {
      const currentData = state.datas[state.activeSide];
      if (currentData.future.length === 0) return state;

      const next = currentData.future[0];
      const newFuture = currentData.future.slice(1);
      const newPast = [...currentData.past, { objects: currentData.objects, background: currentData.background }].slice(
        -MAX_HISTORY_SIZE,
      );

      const newDatas = [...state.datas];
      newDatas[state.activeSide] = {
        ...currentData,
        objects: next.objects,
        background: next.background,
        past: newPast,
        future: newFuture,
      };

      return {
        datas: newDatas,
        selectedId: null,
        isDirty: true,
      };
    });
  },

  clearHistory: () => {
    set((state) => {
      const newDatas = [...state.datas];
      newDatas[state.activeSide] = {
        ...newDatas[state.activeSide],
        past: [],
        future: [],
      };
      return { datas: newDatas };
    });
  },

  // View
  setZoom: (zoom) => {
    set({ zoom: Math.max(0.1, Math.min(5, zoom)) });
  },

  setPan: (pan) => {
    set({ pan });
  },

  resetView: () => {
    set({ zoom: DEFAULT_ZOOM, pan: { x: 0, y: 0 } });
  },

  fitToScreen: (width, height) => {
    const { canvasSize } = get();
    const horizontalPadding = 96;
    const verticalPadding = 144;
    const availableWidth = Math.max(width - RULER_SIZE - horizontalPadding, 100);
    const availableHeight = Math.max(height - RULER_SIZE - verticalPadding, 100);

    const scaleX = availableWidth / canvasSize.width;
    const scaleY = availableHeight / canvasSize.height;
    // A small design should not be enlarged to fill the entire viewport. It
    // makes the ruler impractical and puts the canvas under the editor toolbar.
    const scale = Math.max(MIN_ZOOM, Math.min(2, scaleX, scaleY));

    set({ zoom: scale, pan: { x: 0, y: 0 } });
  },

  toggleWorkSize: () => {
    set((state) => ({ workSizeVisible: !state.workSizeVisible }));
  },

  toggleTrimSize: () => {
    set((state) => ({ trimSizeVisible: !state.trimSizeVisible }));
  },

  toggleSafeArea: () => {
    set((state) => ({ safeAreaVisible: !state.safeAreaVisible }));
  },

  // Export Loading
  setExportLoading: (loading) => {
    set({ isExportLoading: loading });
  },

  // Slideshow Actions
  openSlideshow: async (showModal = true) => {
    const { exportImages } = get();
    set({ isSlideshowLoading: true });
    try {
      const images = await exportImages(false);
      set((state) => {
        const thumbnails = [...state.thumbnails];
        images.forEach((image, index) => {
          if (image) thumbnails[index] = image;
        });

        return {
          thumbnails,
          slideshowImages: images,
          isSlideshowOpen: showModal,
        };
      });
      return images;
    } catch (error) {
      console.error('Failed to open slideshow:', error);
      return [];
    } finally {
      set({ isSlideshowLoading: false });
    }
  },

  closeSlideshow: () => {
    set({ isSlideshowOpen: false, slideshowImages: [] });
  },

  // Utility
  clearCanvas: () => {
    set((state) => {
      const currentData = state.datas[state.activeSide];
      const past = [...currentData.past, { objects: currentData.objects, background: currentData.background }].slice(
        -MAX_HISTORY_SIZE,
      );

      const newDatas = [...state.datas];
      newDatas[state.activeSide] = {
        ...currentData,
        objects: [],
        background: DEFAULT_BACKGROUND,
        past,
        future: [],
      };

      return {
        datas: newDatas,
        selectedId: null,
      };
    });
  },

  resetEditor: () => {
    set({
      activeSide: 0,
      datas: [
        {
          objects: [],
          background: { ...DEFAULT_BACKGROUND, id: uuidv4() },
          past: [],
          future: [],
        },
      ],
      canvasSize: CARD_SIZE_PX,
      selectedBannerId: 'custom',
      selectedTemplateId: null,
      selectedSizeOptionId: null,
      webEditor: null,
      customSizeMm: null,
      bleedPx: BLEED_PX,
      safeAreaPx: SAFE_MARGIN_PX,
      thumbnails: [],
      selectedId: null,
      isGridView: false,
      isInitialCanvasConfigured: false,
      isInitialCanvasReady: false,
      isDirty: false,
      isSlideshowOpen: false,
      slideshowImages: [],
    });
  },

  getSelectedObject: () => {
    const state = get();
    if (!state.selectedId) return null;
    const currentObjects = state.getCurrentObjects();
    return currentObjects.find((obj) => obj.id === state.selectedId) || null;
  },

  setStageRef: (stageRef) => set({ stageRef }),

  exportImages: async (includeCutlines = false) => {
    const {
      stageRef,
      activeSide,
      selectSide,
      canvasSize: stateCanvasSize,
      datas,
      isGridView,
      setIsGridView,
      bleedPx,
      safeAreaPx,
    } = get();
    if (isGridView) {
      setIsGridView(false);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    const stage = stageRef?.current;
    if (!stage) throw new Error('Stage not found');
    const images: string[] = [];

    get().setExportLoading(true);
    get().selectObject(null);

    const originalSide = activeSide;
    const oldWidth = stage.width();
    const oldHeight = stage.height();

    const layers = stage.getLayers();
    const bgLayer = stage.findOne('.background-layer') as Konva.Layer;
    const transformerLayer = stage.findOne('.transformer-layer') as Konva.Layer;
    const guidesLayer = stage.findOne('.guides-layer') as Konva.Layer | undefined;

    const layerStates = layers.map((layer) => ({
      layer,
      x: layer.x(),
      y: layer.y(),
      scaleX: layer.scaleX(),
      scaleY: layer.scaleY(),
      visible: layer.visible(),
    }));

    const oldTransformerLayerVisible = transformerLayer?.visible() ?? true;
    transformerLayer?.visible(false);

    const captureSide = async (sideIndex: number) => {
      selectSide(sideIndex);

      // Wait for React to switch side and background components to update/load
      await new Promise((resolve) => setTimeout(resolve, 150));

      stage.width(stateCanvasSize.width);
      stage.height(stateCanvasSize.height);

      layers.forEach((layer) => {
        layer.x(0);
        layer.y(0);
        layer.scaleX(1);
        layer.scaleY(1);

        // Apply clip to object layers to respect safe zone
        if (layer.name().startsWith('objects-layer-')) {
          layer.clip({
            x: bleedPx + safeAreaPx,
            y: bleedPx + safeAreaPx,
            width: stateCanvasSize.width - (bleedPx + safeAreaPx) * 2,
            height: stateCanvasSize.height - (bleedPx + safeAreaPx) * 2,
          });
        }
      });

      // Hide grid lines during export
      const gridLines = (bgLayer.find('Line') || []) as unknown as Konva.Line[];
      const gridLineStates = gridLines.map((line) => ({
        line,
        visible: line.visible(),
      }));
      gridLines.forEach((line) => line.visible(false));

      // Preview exports are always guide-free. Cutline exports force every
      // guide visible, independent of the Togglebar state.
      const guideRects = guidesLayer
        ? (['#work-size-guide', '#trim-size-guide', '#safe-area-guide']
            .map((selector) => guidesLayer.findOne(selector) as Konva.Rect | null)
            .filter((guide): guide is Konva.Rect => guide !== null) as Konva.Rect[])
        : [];
      const guideStates = guideRects.map((guide) => ({ guide, visible: guide.visible() }));
      const guidesLayerVisible = guidesLayer?.visible();
      if (guidesLayer) guidesLayer.visible(true);
      guideRects.forEach((guide) => guide.visible(includeCutlines));

      // Handle background rect - ensure it fits and has export border
      const bgRect = bgLayer.findOne('Rect') as Konva.Rect | undefined;
      let originalStroke: string | CanvasGradient | undefined,
        originalStrokeWidth: number | undefined,
        originalBgRectPos: { x: number; y: number; width: number; height: number } | undefined;
      if (bgRect) {
        originalBgRectPos = { x: bgRect.x(), y: bgRect.y(), width: bgRect.width(), height: bgRect.height() };
        originalStroke = bgRect.stroke();
        originalStrokeWidth = bgRect.strokeWidth();

        bgRect.x(0);
        bgRect.y(0);
        bgRect.width(stateCanvasSize.width);
        bgRect.height(stateCanvasSize.height);
        bgRect.stroke('#D1D5DB');
        bgRect.strokeWidth(1);
      }

      // Handle background image - ensure it fits the export dimensions (x=0, y=0)
      const bgImage = bgLayer.findOne('#canvas-background-image') as Konva.Image | undefined;
      let originalBgImagePos: { x: number; y: number; width: number; height: number } | undefined;
      if (bgImage) {
        originalBgImagePos = { x: bgImage.x(), y: bgImage.y(), width: bgImage.width(), height: bgImage.height() };
        bgImage.x(0);
        bgImage.y(0);
        bgImage.width(stateCanvasSize.width);
        bgImage.height(stateCanvasSize.height);
      }

      stage.batchDraw();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const dataURL = stage.toDataURL({
        pixelRatio: 3,
        mimeType: 'image/png',
        x: includeCutlines ? 0 : bleedPx,
        y: includeCutlines ? 0 : bleedPx,
        width: includeCutlines ? stateCanvasSize.width : stateCanvasSize.width - bleedPx * 2,
        height: includeCutlines ? stateCanvasSize.height : stateCanvasSize.height - bleedPx * 2,
      });

      // Restore grid lines
      gridLineStates.forEach(({ line, visible }) => {
        line.visible(visible);
      });
      guideStates.forEach(({ guide, visible }) => guide.visible(visible));
      if (guidesLayer && guidesLayerVisible !== undefined) guidesLayer.visible(guidesLayerVisible);

      // Restore bgRect
      if (bgRect && originalBgRectPos) {
        bgRect.x(originalBgRectPos.x);
        bgRect.y(originalBgRectPos.y);
        bgRect.width(originalBgRectPos.width);
        bgRect.height(originalBgRectPos.height);
        if (originalStroke !== undefined) bgRect.stroke(originalStroke);
        if (originalStrokeWidth !== undefined) bgRect.strokeWidth(originalStrokeWidth);
      }

      // Restore bgImage
      if (bgImage && originalBgImagePos) {
        bgImage.x(originalBgImagePos.x);
        bgImage.y(originalBgImagePos.y);
        bgImage.width(originalBgImagePos.width);
        bgImage.height(originalBgImagePos.height);
      }

      // Restore layer clips
      layers.forEach((layer) => {
        if (layer.name().startsWith('objects-layer-')) {
          layer.clip(undefined);
        }
      });

      return dataURL;
    };

    try {
      for (let index = 0; index < datas.length; index++) {
        const dataURL = await captureSide(index);
        images.push(dataURL);
      }

      // Restore stage and layers
      stage.width(oldWidth);
      stage.height(oldHeight);

      layerStates.forEach(({ layer, x, y, scaleX, scaleY, visible }) => {
        layer.x(x);
        layer.y(y);
        layer.scaleX(scaleX);
        layer.scaleY(scaleY);
        layer.visible(visible);
      });

      transformerLayer?.visible(oldTransformerLayerVisible);
      selectSide(originalSide);

      stage.batchDraw();
      get().setExportLoading(false);

      return images;
    } catch (error) {
      // Emergency Restore
      stage.width(oldWidth);
      stage.height(oldHeight);
      layerStates.forEach(({ layer, x, y, scaleX, scaleY, visible }) => {
        layer.x(x);
        layer.y(y);
        layer.scaleX(scaleX);
        layer.scaleY(scaleY);
        layer.visible(visible);
      });
      transformerLayer?.visible(oldTransformerLayerVisible);
      selectSide(originalSide);
      get().setExportLoading(false);
      throw error;
    }
  },
  setTemplate: (
    template: Template | null,
    layersOverride?: Layer[],
    options?: {
      previewImages?: string[];
      hasBackSide?: boolean;
      sizeMm?: { width: number; height: number };
      webEditor?: DesignWebEditor | null;
      backgrounds?: Array<{ color?: string; image_url?: string }>;
      sidesToUpdate?: Array<import('@/types').CardSide>;
    },
  ) => {
    const { canvasSize, datas: currentDatas, thumbnails: currentThumbnails, webEditor: configuredWebEditor } = get();
    const layoutConfig = template?.layout_config;
    if (!template && !layersOverride?.length) return;
    if (template && !layoutConfig) return;

    const layers = (layersOverride ?? layoutConfig?.layers ?? []).filter((layer): layer is Layer => Boolean(layer));
    const webEditor = options?.webEditor ?? configuredWebEditor ?? template?.web_editor;
    const dpi = webEditor?.dpi || 200;
    // Matches seomun-admin: size-option dimensions are always millimetres;
    // layout dimensions only use their declared unit when no size option exists.
    const mmToPixels = (value: number) => (value * dpi) / 25.4;
    const toPixels = (value: number, unit: string) => (unit.toLowerCase() === 'px' ? value : mmToPixels(value));
    const trimWidth = toPixels(
      options?.sizeMm?.width ?? template?.size_option?.cutting_width ?? layoutConfig?.page?.width ?? canvasSize.width,
      options?.sizeMm || template?.size_option ? 'mm' : (layoutConfig?.page?.unit ?? 'mm'),
    );
    const trimHeight = toPixels(
      options?.sizeMm?.height ?? template?.size_option?.cutting_height ?? layoutConfig?.page?.height ?? canvasSize.height,
      options?.sizeMm || template?.size_option ? 'mm' : (layoutConfig?.page?.unit ?? 'mm'),
    );
    const editorUnit = webEditor?.unit ?? 'mm';
    const bleedPx = webEditor ? toPixels(webEditor.bleed ?? 0, editorUnit) : BLEED_PX;
    const safeAreaPx = webEditor ? toPixels(webEditor.safe_area ?? 0, editorUnit) : SAFE_MARGIN_PX;
    const newCanvasSize = {
      width: trimWidth + bleedPx * 2,
      height: trimHeight + bleedPx * 2,
    };

    const mapLayerToObject = (layer: Layer): CanvasObject | undefined => {
      const baseProps = {
        id: layer.id || uuidv4(),
        position: {
          x: layer.position.x + bleedPx,
          y: layer.position.y + bleedPx,
        },
        size: layer.size,
        rotation: layer.rotation ?? 0,
        opacity: layer.style?.opacity ?? 1,
        locked: layer.locked ?? false,
        visible: true,
        field: layer.field_key,
        label: layer.label,
        defaultValue: layer.default_value,
        note: layer.note,
      };

      if (layer.type === 'text') {
        const fontFamily = layer.style?.font_family;
        return {
          ...baseProps,
          type: ObjectType.TEXT,
          content: layer.default_value || layer.label || '',
          fontFamily: fontFamily && FONT_FAMILIES.includes(fontFamily as (typeof FONT_FAMILIES)[number]) ? fontFamily : 'Arial',
          fontSize: layer.style?.font_size || 12,
          fontWeight: layer.style?.font_weight === 'bold' ? 'bold' : 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: layer.style?.color || '#000000',
          align: layer.style?.align || 'left',
          lineHeight: layer.style?.line_height || 1,
          letterSpacing: layer.style?.letter_spacing || 0,
          zIndex: 1,
        } as TextObject;
      }

      if (layer.type === 'image') {
        return {
          ...baseProps,
          type: ObjectType.IMAGE,
          src: layer.image_url ?? `https://dummyimage.com/${layer.size.width}x${layer.size.height}/000/fff&text=${layer.label}`,
          originalWidth: layer.size.width,
          originalHeight: layer.size.height,
          cropX: 0,
          cropY: 0,
          cropWidth: 0,
          cropHeight: 0,
          zIndex: 1,
        } as ImageObject;
      }

      if (layer.type === 'shape') {
        return {
          ...baseProps,
          type: ObjectType.SHAPE,
          shapeType: layer.shape_type,
          fill: layer.style?.color || '#94a3b8',
          stroke: layer.style?.stroke_color || '',
          strokeWidth: layer.style?.stroke_width || 0,
          zIndex: 1,
        } as ShapeObject;
      }

      return undefined;
    };

    const processObjects = (side: import('@/types').CardSide) => {
      const objects = layers
        .filter((l: Layer) => l.side === side)
        .map((l: Layer) => mapLayerToObject(l))
        .filter((obj): obj is CanvasObject => obj !== undefined);

      return objects.map((obj, i) => ({ ...obj, zIndex: i }));
    };

    const frontObjects = processObjects('front');
    const backObjects = processObjects('back');
    const sidesToUpdate = new Set(options?.sidesToUpdate);
    const preserveMissingSides = sidesToUpdate.size > 0;
    const hasBackSide = options?.hasBackSide ?? template?.side === 'double';
    const shouldIncludeBackSide = hasBackSide || (preserveMissingSides && currentDatas.length > 1);
    const templateFrontPreview = options?.previewImages?.[0] || template?.front_preview_url || template?.preview_images[0] || '';
    const templateBackPreview = options?.previewImages?.[1] || template?.back_preview_url || template?.preview_images[1] || '';
    const initialThumbnails = [
      preserveMissingSides && !sidesToUpdate.has('front') ? (currentThumbnails[0] ?? '') : templateFrontPreview,
    ];
    if (shouldIncludeBackSide) {
      initialThumbnails.push(
        preserveMissingSides && !sidesToUpdate.has('back') ? (currentThumbnails[1] ?? '') : templateBackPreview,
      );
    }

    const getBackgroundConfig = (
      background?: { color?: string; image_url?: string },
      fallbackImageUrl?: string,
      fallbackColor?: string | null,
    ): BackgroundObject => {
      const imageUrl = background ? background.image_url : fallbackImageUrl;
      const isTemplateBackground = Boolean(imageUrl && fallbackImageUrl && imageUrl === fallbackImageUrl);
      const bg: BackgroundObject = {
        id: uuidv4(),
        type: ObjectType.BACKGROUND,
        backgroundColor: background?.color ?? fallbackColor ?? '#FFFFFF',
        backgroundImage: imageUrl,
        backgroundSize: isTemplateBackground ? 'fill' : 'cover',
      };

      return bg;
    };

    const originalTextPositions: Record<string, Position> = {};
    [...frontObjects, ...backObjects].forEach((obj) => {
      if (obj.type === ObjectType.TEXT && obj.field) {
        originalTextPositions[obj.id] = { ...obj.position };
      }
    });

    const frontData =
      preserveMissingSides && !sidesToUpdate.has('front')
        ? currentDatas[0]
        : {
            objects: frontObjects,
            background: getBackgroundConfig(
              options?.backgrounds?.[0],
              layoutConfig?.background?.front_image_url || undefined,
              layoutConfig?.background?.front_color,
            ),
            past: [],
            future: [],
          };
    const backData =
      preserveMissingSides && !sidesToUpdate.has('back')
        ? currentDatas[1]
        : {
            objects: backObjects,
            background: getBackgroundConfig(
              options?.backgrounds?.[1],
              layoutConfig?.background?.back_image_url || undefined,
              layoutConfig?.background?.back_color,
            ),
            past: [],
            future: [],
          };

    set({
      datas: [frontData, ...(shouldIncludeBackSide && backData ? [backData] : [])],
      // frontData: {
      //   objects: frontObjects,
      //   background: getBackgroundConfig(layout_config.background?.front_image_url),
      // },
      // backData: {
      //   objects: backObjects,
      //   background: getBackgroundConfig(layout_config.background?.back_image_url),
      // },
      canvasSize: newCanvasSize,
      bleedPx,
      safeAreaPx,
      selectedTemplateId: template?.id ?? null,
      customSizeMm: options?.sizeMm ?? null,
      thumbnails: initialThumbnails,
      // sidedness: (layout_config.page?.sidedness as 'SINGLE' | 'DOUBLE') || 'DOUBLE',
      // past: [],
      // future: [],
      selectedId: null,
      activeSide: 0,
      isDirty: false,
      // originalTextPositions,
    });
  },

  // Actions - Load
  loadDesign: (data) => {
    const originalTextPositions: Record<string, Position> = {};
    const allObjects = data.datas.flatMap((item) => item.objects);
    allObjects.forEach((obj) => {
      if (obj.type === ObjectType.TEXT && obj.field) {
        originalTextPositions[obj.id] = { ...obj.position };
      }
    });

    set((state) => ({
      datas: data.datas,
      canvasSize: data.canvasSize || state.canvasSize,
      // past: [],
      // future: [],
      selectedId: null,
      isDirty: false,
      activeSide: 0,
      // sidedness: data.sidedness || state.sidedness,
      // originalTextPositions,
    }));
  },
}));
