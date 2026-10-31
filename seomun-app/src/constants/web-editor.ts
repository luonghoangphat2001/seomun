import { EditorTabType, ObjectType } from '@/enums/editor';
import {
  Background,
  Burst12,
  CircleShape,
  Diamond4,
  Layout,
  Picture,
  Rectangle,
  RoundedRectangle,
  Scallop1,
  Scallop2,
  Shape,
  Star4Shape,
  Star5Shape,
  Star6Shape,
  Triangle,
  TriangleDown,
  Writing,
} from '@/icons';
import { BackgroundObject, CardSideData, ShapeType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const optionsTabContent = [
  {
    label: EditorTabType.TEMPLATE,
    icon: Layout,
  },
  {
    label: EditorTabType.IMAGE,
    icon: Picture,
  },
  {
    label: EditorTabType.TEXT,
    icon: Writing,
  },
  {
    label: EditorTabType.BACKGROUND,
    icon: Background,
  },
  {
    label: EditorTabType.SHAPE,
    icon: Shape,
  },
];

export const GENERAL_BANNERS = [
  { id: 'maintenance_rate', label: 'maintenance_rate', size: '120 × 120 cm', width: 600, height: 600 },
  { id: 'horizontal_type', label: 'horizontal_type', size: '500 × 90 mm', width: 600, height: 108 },
  { id: 'horizontal_31', label: 'horizontal_31', size: '180 × 60 cm', width: 600, height: 200 },
  { id: 'horizontal_poster', label: 'horizontal_poster', size: '168 × 118.8 cm', width: 600, height: 424 },
  { id: 'vertical_type', label: 'vertical_type', size: '90 × 500 mm', width: 108, height: 600 },
];

export const DEFAULT_DPI = 200;

export const EXPORT_DPI = 300;

// Convert mm to pixels at 300 DPI
export const CARD_SIZE_PX = {
  width: 600,
  height: 350,
} as const;

// Safe margin (3mm from edge) - typical print bleed area
export const SAFE_MARGIN_MM = 2;
export const SAFE_MARGIN_PX = Math.round((SAFE_MARGIN_MM / 25.4) * DEFAULT_DPI); // ~24px

export const BLEED_MM = 2;
export const BLEED_PX = Math.round((BLEED_MM / 25.4) * DEFAULT_DPI); // ~24px

// Grid settings
export const DEFAULT_GRID_SIZE = 10; // pixels
export const SNAP_THRESHOLD = 5; // pixels

// Zoom levels
export const ZOOM_LEVELS = [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 5] as const;
export const DEFAULT_ZOOM = 1;
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5;

// Default object properties
export const DEFAULT_TEXT_OBJECT = {
  content: 'Text',
  fontFamily: 'Arial',
  fontSize: 16,
  fontWeight: '400' as const,
  fontStyle: 'normal' as const,
  textDecoration: 'none' as const,
  color: '#000000',
  align: 'left' as const,
  lineHeight: 1.2,
  letterSpacing: 0,
  rotation: 0,
  opacity: 1,
  locked: false,
  visible: true,
};

export const DEFAULT_IMAGE_OBJECT = {
  rotation: 0,
  opacity: 1,
  locked: false,
  visible: true,
  cropX: 0,
  cropY: 0,
};

export const DEFAULT_SHAPE_OBJECT = {
  fill: '#d9d9d9',
  stroke: '#2B231F',
  strokeWidth: 2,
  rotation: 0,
  opacity: 1,
  locked: false,
  visible: true,
};

export const DEFAULT_BACKGROUND: BackgroundObject = {
  id: uuidv4(),
  type: ObjectType.BACKGROUND,
  backgroundColor: '#FFFFFF',
  backgroundSize: 'cover',
};

// Font families (system fonts - no external loading needed)
export const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Courier New',
  'Verdana',
  'Trebuchet MS',
  'Impact',
  'Comic Sans MS',
  'Palatino',
  'Garamond',
  'Bookman',
  'Tahoma',
  'Lucida Console',
] as const;

// Font sizes
export const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72] as const;

// Font weights
export const FONT_WEIGHTS = [
  { label: 'Thin', value: '100' },
  { label: 'Extra Light', value: '200' },
  { label: 'Light', value: '300' },
  { label: 'Normal', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semi Bold', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'Extra Bold', value: '800' },
  { label: 'Black', value: '900' },
] as const;

// Color presets
export const COLOR_PRESETS = [
  '#000000',
  '#FFFFFF',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#FFA500',
  '#800080',
  '#008000',
  '#800000',
  '#808000',
  '#008080',
  '#000080',
  '#FFC0CB',
  '#A52A2A',
  '#D2691E',
  '#FF7F50',
  '#6495ED',
  '#DC143C',
  '#00CED1',
  '#9400D3',
  '#FF1493',
  '#FFD700',
  '#ADFF2F',
  '#FF69B4',
  '#CD5C5C',
  '#4B0082',
  '#F0E68C',
] as const;

// Color picker
export const CHECKERBOARD =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='4' height='4' fill='%23ccc'/%3E%3Crect x='4' y='4' width='4' height='4' fill='%23ccc'/%3E%3Crect x='4' width='4' height='4' fill='%23fff'/%3E%3Crect y='4' width='4' height='4' fill='%23fff'/%3E%3C/svg%3E\")";

// History
export const MAX_HISTORY_SIZE = 50;

// Ruler
export const RULER_SIZE = 24; // Height/width of ruler in pixels
export const TICK_INTERVAL = 100; // Distance between tick marks

// Shapes
export const SHAPES = [
  { type: 'rectangle' as ShapeType, icon: Rectangle },
  { type: 'rounded_rectangle' as ShapeType, icon: RoundedRectangle },
  { type: 'circle' as ShapeType, icon: CircleShape },
  { type: 'triangle' as ShapeType, icon: Triangle },
  { type: 'diamond' as ShapeType, icon: Diamond4 },
  { type: 'triangle_down' as ShapeType, icon: TriangleDown },
  { type: 'star_5' as ShapeType, icon: Star5Shape },
  { type: 'star_4' as ShapeType, icon: Star4Shape },
  { type: 'star_6' as ShapeType, icon: Star6Shape },
  { type: 'burst_12' as ShapeType, icon: Burst12 },
  { type: 'scallop_1' as ShapeType, icon: Scallop1 },
  { type: 'scallop_2' as ShapeType, icon: Scallop2 },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mockDataEditor = (data?: any, logo_url?: string) => {
  const defaultData = {
    name: '홍길동',
    englishName: 'Hong Gil Dong',
    departmentTitle: '영업팀장',
    englishDepartmentTitle: 'Sales Team Manager',
    mobile: '010-1234-5678',
    phone: '02-1234-5678',
    fax: '02-8765-4321',
    email: 'hong.gildong@company.co.kr',
    address: '서울특별시 강남구 테헤란로 123',
    englishAddress: '123 Teheran-ro, Gangnam-gu, Seoul, Korea',
  };

  const d = { ...defaultData, ...data };

  return {
    datas: [
      {
        objects: [
          {
            id: 'name',
            field: 'name',
            type: ObjectType.TEXT,
            content: d.name,
            position: { x: 30, y: 60 },
            size: { width: 200, height: 30 },
            fontSize: 22,
            fontWeight: '700',
            fontFamily: 'Arial',
            fontStyle: 'normal',
            textDecoration: 'none',
            color: '#000000',
            align: 'left',
            lineHeight: 1.2,
            letterSpacing: 0,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            zIndex: 0,
          },
          {
            id: 'englishName',
            field: 'englishName',
            type: ObjectType.TEXT,
            content: d.englishName,
            position: { x: 30, y: 90 },
            size: { width: 200, height: 20 },
            fontSize: 12,
            fontWeight: '400',
            fontFamily: 'Arial',
            fontStyle: 'normal',
            textDecoration: 'none',
            color: '#000000',
            align: 'left',
            lineHeight: 1.2,
            letterSpacing: 0,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            zIndex: 1,
          },
          {
            id: 'position',
            field: 'departmentTitle',
            type: ObjectType.TEXT,
            content: d.departmentTitle,
            position: { x: 150, y: 55 },
            size: { width: 300, height: 20 },
            fontSize: 11,
            fontWeight: '400',
            fontFamily: 'Arial',
            fontStyle: 'normal',
            textDecoration: 'none',
            color: '#000000',
            align: 'left',
            lineHeight: 1.2,
            letterSpacing: 0,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            zIndex: 2,
          },
          {
            id: 'mobile',
            field: 'mobile',
            type: ObjectType.TEXT,
            content: d.mobile,
            position: { x: 170, y: 85 },
            size: { width: 200, height: 20 },
            fontSize: 10,
            fontWeight: '400',
            fontFamily: 'Arial',
            fontStyle: 'normal',
            textDecoration: 'none',
            color: '#000000',
            align: 'left',
            lineHeight: 1.2,
            letterSpacing: 0,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            zIndex: 3,
          },
          {
            id: 'phone',
            field: 'phone',
            type: ObjectType.TEXT,
            content: d.phone,
            position: { x: 170, y: 105 },
            size: { width: 200, height: 20 },
            fontSize: 10,
            fontWeight: '400',
            fontFamily: 'Arial',
            fontStyle: 'normal',
            textDecoration: 'none',
            color: '#000000',
            align: 'left',
            lineHeight: 1.2,
            letterSpacing: 0,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            zIndex: 4,
          },
          {
            id: 'fax',
            field: 'fax',
            type: ObjectType.TEXT,
            content: d.fax,
            position: { x: 315, y: 85 },
            size: { width: 150, height: 20 },
            fontSize: 10,
            fontWeight: '400',
            fontFamily: 'Arial',
            fontStyle: 'normal',
            textDecoration: 'none',
            color: '#000000',
            align: 'left',
            lineHeight: 1.2,
            letterSpacing: 0,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            zIndex: 5,
          },
          {
            id: 'email',
            field: 'email',
            type: ObjectType.TEXT,
            content: d.email,
            position: { x: 170, y: 125 },
            size: { width: 250, height: 20 },
            fontSize: 10,
            fontWeight: '400',
            fontFamily: 'Arial',
            fontStyle: 'normal',
            textDecoration: 'none',
            color: '#000000',
            align: 'left',
            lineHeight: 1.2,
            letterSpacing: 0,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            zIndex: 6,
          },
          {
            id: 'address',
            field: 'address',
            type: ObjectType.TEXT,
            content: d.address,
            position: { x: 150, y: 160 },
            size: { width: 320, height: 60 },
            fontSize: 9,
            fontWeight: '400',
            fontFamily: 'Arial',
            fontStyle: 'normal',
            textDecoration: 'none',
            color: '#333333',
            align: 'left',
            lineHeight: 1.4,
            letterSpacing: 0,
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            zIndex: 7,
          },
          {
            id: 'englishAddress',
            field: 'englishAddress',
            type: ObjectType.TEXT,
            content: d.englishAddress,
            position: { x: 150, y: 160 },
            size: { width: 320, height: 60 },
            fontSize: 9,
            opacity: 0,
            visible: false,
          },
          {
            id: 'englishDepartmentTitle',
            field: 'englishDepartmentTitle',
            type: ObjectType.TEXT,
            content: d.englishDepartmentTitle,
            position: { x: 150, y: 160 },
            size: { width: 320, height: 60 },
            fontSize: 9,
            opacity: 0,
            visible: false,
          },
        ],
        background: {
          id: 'bg-front',
          type: ObjectType.BACKGROUND,
          backgroundColor: '#FFFFFF',
          backgroundSize: 'cover',
        },
        past: [],
        future: [],
      },
      {
        objects: [
          {
            id: 'logo',
            field: 'logo',
            type: ObjectType.IMAGE,
            src: logo_url ?? 'https://dummyimage.com/600x400/000/fff&text=LOGO',
            originalWidth: 2400,
            originalHeight: 1600,
            cropX: 0,
            cropY: 0,
            cropWidth: 2400,
            cropHeight: 1600,
            position: { x: 30, y: 100 },
            size: { width: 240, height: 160 },
            rotation: 0,
            opacity: 1,
            locked: false,
            visible: true,
            zIndex: 0,
          },
        ],
        background: {
          id: 'bg-back',
          type: ObjectType.BACKGROUND,
          backgroundColor: '#FFFFFF',
          backgroundSize: 'cover',
        },
        past: [],
        future: [],
      },
    ] as CardSideData[],
  };
};
