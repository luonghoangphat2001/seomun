import { PostProcessingCode } from '@/enums/product';

export const IMPORTANT_NOTES_TABS = [
  { id: 'production_guide', label: 'production_guide', count: 3 },
  { id: 'general_precautions', label: 'general_precautions', count: 10 },
  { id: 'shipment_delivery', label: 'shipment_delivery', count: 6 },
  { id: 'user_guide', label: 'user_guide', count: 0 },
  { id: 'review', label: 'review', count: 0 },
] as const;

export const PRODUCT_STANDARD_OPTIONS = [
  { label: '90x50mm', value: '90x50' },
  { label: '86x52mm', value: '86x52' },
];

export const PAPER_TYPE_OPTIONS = [{ label: '랑데부 내츄럴', value: 'rendezvous' }];

export const PAPER_FINISH_OPTIONS = [{ label: 'Natural', value: 'natural' }];

export const PAPER_WEIGHT_OPTIONS = [{ label: '250 g/m²', value: '250' }];

export const PRINT_COLOR_TOTAL_OPTIONS = [{ label: '양면칼라8도', value: 'double-8' }];

export const PRINT_COLOR_FRONT_OPTIONS = [{ label: '전면별색', value: 'front-star' }];

export const PRINT_COLOR_REAR_OPTIONS = [{ label: '후면별색', value: 'rear-star' }];

export const QUANTITY_OPTIONS = [
  { label: '200매', value: '200' },
  { label: '500매', value: '500' },
];

export const COUNT_OPTIONS = [{ label: '1건', value: '1' }];

export const POST_PROCESSING_OPTIONS = [
  { label: 'coating', value: PostProcessingCode.Coated },
  { label: 'oshi', value: PostProcessingCode.Oshi },
  { label: 'rounding', value: PostProcessingCode.Rounding },
  { label: 'box', value: PostProcessingCode.Foundation },
  { label: 'embossing', value: PostProcessingCode.Grounding },
  { label: 'epoxy', value: PostProcessingCode.Perforation },
  { label: 'transparent_embossing', value: PostProcessingCode.Numbering },
  { label: 'embossing_box', value: PostProcessingCode.Domusong },
];

export const POST_PROCESSING_DETAILS: Partial<
  Record<
    PostProcessingCode,
    { options: { label: string; value: string }[]; description: string; price: number; images: string[] }
  >
> = {
  [PostProcessingCode.Oshi]: {
    options: [],
    description:
      '오시는 인쇄물을 잘 접을 수 있도록 접는 위치에 누름 자국을 내는 가공입니다. 데이터 기준으로 가로/세로 방향을 선택할 수 있으며 사이즈가 100x70 미만일 경우 가로형은 가로오시 불가.',
    price: 0,
    images: ['/images/product-sample.png', '/images/mock-banner.png'],
  },
  [PostProcessingCode.Coated]: {
    options: [],
    description: '라운딩은 명함의 모서리를 둥글게 깎아내는 가공입니다. 부드러운 느낌을 주며 모서리 마모를 방지합니다.',
    price: 0,
    images: [
      '/images/product-sample.png',
      '/images/mock-banner.png',
      '/images/customer_footer_1.png',
      '/images/customer_footer_2.png',
    ],
  },
  [PostProcessingCode.Rounding]: {
    options: [],
    description: '라운딩은 명함의 모서리를 둥글게 깎아내는 가공입니다. 부드러운 느낌을 주며 모서리 마모를 방지합니다.',
    price: 0,
    images: [
      '/images/product-sample.png',
      '/images/mock-banner.png',
      '/images/customer_footer_1.png',
      '/images/customer_footer_2.png',
    ],
  },
  [PostProcessingCode.Foundation]: {
    options: [],
    description: '라운딩은 명함의 모서리를 둥글게 깎아내는 가공입니다. 부드러운 느낌을 주며 모서리 마모를 방지합니다.',
    price: 0,
    images: [
      '/images/product-sample.png',
      '/images/mock-banner.png',
      '/images/customer_footer_1.png',
      '/images/customer_footer_2.png',
    ],
  },
  [PostProcessingCode.Grounding]: {
    options: [],
    description: '라운딩은 명함의 모서리를 둥글게 깎아내는 가공입니다. 부드러운 느낌을 주며 모서리 마모를 방지합니다.',
    price: 0,
    images: [
      '/images/product-sample.png',
      '/images/mock-banner.png',
      '/images/customer_footer_1.png',
      '/images/customer_footer_2.png',
    ],
  },
  [PostProcessingCode.Perforation]: {
    options: [],
    description: '라운딩은 명함의 모서리를 둥글게 깎아내는 가공입니다. 부드러운 느낌을 주며 모서리 마모를 방지합니다.',
    price: 0,
    images: [
      '/images/product-sample.png',
      '/images/mock-banner.png',
      '/images/customer_footer_1.png',
      '/images/customer_footer_2.png',
    ],
  },
  [PostProcessingCode.Numbering]: {
    options: [],
    description: '라운딩은 명함의 모서리를 둥글게 깎아내는 가공입니다. 부드러운 느낌을 주며 모서리 마모를 방지합니다.',
    price: 0,
    images: [
      '/images/product-sample.png',
      '/images/mock-banner.png',
      '/images/customer_footer_1.png',
      '/images/customer_footer_2.png',
    ],
  },
  [PostProcessingCode.Domusong]: {
    options: [],
    description: '라운딩은 명함의 모서리를 둥글게 깎아내는 가공입니다. 부드러운 느낌을 주며 모서리 마모를 방지합니다.',
    price: 0,
    images: [
      '/images/product-sample.png',
      '/images/mock-banner.png',
      '/images/customer_footer_1.png',
      '/images/customer_footer_2.png',
    ],
  },
};

export const MOCK_REVIEWS = [
  {
    name: '김민지',
    date: '2026.02.08',
    rating: 5,
    content:
      '인쇄 품질이 너무 좋아요! 배송도 빠르고 상담도 친절하셨습니다. 재주문 의사 100%입니다.인쇄 품질이 너무 좋아요! 배송도 빠르고 상담도 친절하셨습니다. 재주문 의사 100%입니다.인쇄 품질이 너무 좋아요! 배송도 빠르고 상담도 친절하셨습니다. 재주문 의사 100%입니다.인쇄 품질이 너무 좋아요! 배송도 빠르고 상담도 친절하셨습니다. 재주문 의사 100%입니다.',
    images: [
      '/images/design-sample-1.png',
      '/images/design-sample-2.png',
      '/images/design-sample-3.png',
      '/images/design-sample-1.png',
      '/images/design-sample-2.png',
      '/images/design-sample-3.png',
      '/images/design-sample-1.png',
      '/images/design-sample-2.png',
      '/images/design-sample-3.png',
      '/images/design-sample-1.png',
      '/images/design-sample-2.png',
      '/images/design-sample-3.png',
      '/images/design-sample-1.png',
      '/images/design-sample-2.png',
      '/images/design-sample-3.png',
    ],
    tags: [
      '해시태그',
      '해시태그',
      '해시태그',
      '해시태그',
      '해시태그',
      '해시태그',
      '해시태그',
      '해시태그',
      '해시태그',
      '해시태그',
      '해시태그',
      '해시태그',
      '해시태그',
      '해시태그',
      '해시태그',
    ],
  },
  {
    name: '김민지',
    date: '2026.02.08',
    rating: 5,
    content: '인쇄 품질이 너무 좋아요! 배송도 빠르고 상담도 친절하셨습니다. 재주문 의사 100%입니다.',
    images: ['/images/design-sample-1.png', '/images/design-sample-2.png', '/images/design-sample-3.png'],
    tags: ['해시태그', '해시태그', '해시태그'],
  },
  {
    name: '김민지',
    date: '2026.02.08',
    rating: 5,
    content: '인쇄 품질이 너무 좋아요! 배송도 빠르고 상담도 친절하셨습니다. 재주문 의사 100%입니다.',
    images: ['/images/design-sample-1.png', '/images/design-sample-2.png', '/images/design-sample-3.png'],
    tags: ['해시태그', '해시태그', '해시태그'],
  },
  {
    name: '김민지',
    date: '2026.02.08',
    rating: 5,
    content: '인쇄 품질이 너무 좋아요! 배송도 빠르고 상담도 친절하셨습니다. 재주문 의사 100%입니다.',
    images: ['/images/design-sample-1.png', '/images/design-sample-2.png', '/images/design-sample-3.png'],
    tags: ['해시태그', '해시태그', '해시태그'],
  },
  {
    name: '김민지',
    date: '2026.02.08',
    rating: 5,
    content: '인쇄 품질이 너무 좋아요! 배송도 빠르고 상담도 친절하셨습니다. 재주문 의사 100%입니다.',
    images: ['/images/design-sample-1.png', '/images/design-sample-2.png', '/images/design-sample-3.png'],
    tags: ['해시태그', '해시태그', '해시태그'],
  },
];
