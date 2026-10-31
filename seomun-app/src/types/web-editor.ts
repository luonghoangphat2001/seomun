import { ObjectType } from '@/enums/editor';

export type ShapeType =
  | 'rectangle'
  | 'rounded_rectangle'
  | 'circle'
  | 'triangle'
  | 'triangle_down'
  | 'diamond'
  | 'star_5'
  | 'star_4'
  | 'star_6'
  | 'burst_12'
  | 'scallop_1'
  | 'scallop_2';

export type TextAlign = 'left' | 'center' | 'right';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BaseCanvasObject {
  id: string;
  type: ObjectType;
  position: Position;
  size: Size;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  zIndex: number;
  field?: string;
  label?: string;
  defaultValue?: string;
}

export interface TextObject extends BaseCanvasObject {
  type: ObjectType.TEXT;
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  color: string;
  align: TextAlign;
  lineHeight: number;
  letterSpacing: number;
}

export interface ImageObject extends BaseCanvasObject {
  type: ObjectType.IMAGE;
  src: string; // base64 or URL
  originalWidth: number;
  originalHeight: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  filters?: {
    brightness: number; // -100 to 100
    contrast: number; // -100 to 100
    saturation: number; // -100 to 100
    blur: number; // 0 to 20
  };
}

export interface ShapeObject extends BaseCanvasObject {
  type: ObjectType.SHAPE;
  shapeType: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius?: number; // for rectangle
}

export interface BackgroundObject {
  id?: string;
  type: ObjectType.BACKGROUND;
  backgroundColor: string;
  backgroundImage?: string; // base64 or URL
  backgroundSize: 'cover' | 'contain' | 'fill';
}

export type CanvasObject = TextObject | ImageObject | ShapeObject;

export interface CanvasState {
  objects: CanvasObject[];
  background: BackgroundObject;
  selectedId: string | null;
  zoom: number;
  pan: Position;
  rulersEnabled: boolean;
  snapToGrid: boolean;
  snapToObjects: boolean;
  workSizeVisible: boolean;
  trimSizeVisible: boolean;
  safeAreaVisible: boolean;
}

export interface HistoryState {
  past: CanvasState[];
  present: CanvasState;
  future: CanvasState[];
}

export interface CanvasSettings {
  width: number; // in pixels
  height: number; // in pixels
  dpi: number;
  unit: 'mm' | 'px';
  showRulers: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  snapToObjects: boolean;
  gridSize: number; // in pixels
  safeMargin: number; // in pixels
}

export interface HistoryEntry {
  objects: CanvasObject[];
  background: BackgroundObject;
}

export interface CardSideData {
  objects: CanvasObject[];
  background: BackgroundObject;
  past: HistoryEntry[];
  future: HistoryEntry[];
}

export type CardSide = 'front' | 'back';

export interface SnapshotConfig {
  pixelRatio?: number;
  quality?: number;
  format?: 'image/png';
  version?: number; // For version tracking to prevent stale snapshots
}

export interface ExportCanvasToPDFOptions {
  image: string[];
  cardWidth: number;
  cardHeight: number;
  fileName?: string;
}

export type SliderProps = {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  trackContent: React.ReactNode;
  thumbColor?: string;
};

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}
