import { BadgeColor, BadgeVariant } from '@/components/common';
import { DirectDeliveryStatus, DirectDeliveryType, InquiryStatus } from '@/enums/inquiry';
import { TFunction } from '@/types';
import { DirectDeliveryRequest, MockCategory, ProductInquiry, ShippingInquiry } from '@/types/inquiry';

export const MOCK_DIRECT_DELIVERY_REQUEST: DirectDeliveryRequest[] = [
  {
    id: 1,
    createdAt: '2025.10.25',
    type: DirectDeliveryType.HOUSE,
    name: '홍길동',
    phone: '01012345678',
    address: '서울시 강남구 테헤란로 123',
    status: DirectDeliveryStatus.UNDERREVIEW,
  },
  {
    id: 2,
    createdAt: '2025.10.24',
    type: DirectDeliveryType.ACADEMY,
    name: '김철수',
    phone: '01011112222',
    address: '경기도 성남시 분당구 판교역로 456',
    status: DirectDeliveryStatus.APPROVAL,
  },
  {
    id: 3,
    createdAt: '2025.10.23',
    type: DirectDeliveryType.SCHOOL,
    name: '이영희',
    phone: '01033334444',
    address: '인천시 연수구 송도과학로 789',
    status: DirectDeliveryStatus.UNAPPROVAL,
  },
];

export const getDirectDeliveryStatusConfig = (t: TFunction) =>
  ({
    [DirectDeliveryStatus.APPROVAL]: {
      color: 'white' as BadgeColor,
      variant: 'outline' as BadgeVariant,
      label: t('approval'),
    },
    [DirectDeliveryStatus.UNAPPROVAL]: {
      color: 'white' as BadgeColor,
      variant: 'outline' as BadgeVariant,
      label: t('unapproval'),
    },
    [DirectDeliveryStatus.UNDERREVIEW]: {
      color: 'brown' as BadgeColor,
      variant: 'solid' as BadgeVariant,
      label: t('under_review'),
    },
  }) as Record<DirectDeliveryStatus, { color: BadgeColor; variant: BadgeVariant; label: string }>;

export const getDirectDeliveryTypeLabel = (t: TFunction, type: string) => {
  if (!type) return '-';

  return Object.values(DirectDeliveryType).includes(type as DirectDeliveryType) ? t(type) : type;
};

export const MOCK_PRODUCT_INQUIRY: ProductInquiry[] = [
  {
    id: 1,
    createdAt: '2025-09-24',
    product: '일반 명함',
    title: '제목 제목 제목 제목 제목 제목 제목 제목',
    isReply: false,
    manager: '홍기돌',
    phone: '01000000000',
    attachment: true,
    status: InquiryStatus.CHECKING,
  },
  {
    id: 2,
    createdAt: '2025-09-24',
    product: '일반 명함',
    title: '제목 제목 제목 제목 제목 제목 제목...',
    isReply: true,
    manager: '홍기돌',
    phone: '01000000000',
    attachment: false,
    status: InquiryStatus.ANSWERED,
  },
  {
    id: 3,
    createdAt: '2025-09-24',
    product: '일반 명함',
    title: '제목 제목 제목 제목 제목 제목 제목...',
    isReply: true,
    manager: '홍기돌',
    phone: '01000000000',
    attachment: true,
    status: InquiryStatus.ANSWERED,
  },
  {
    id: 4,
    createdAt: '2025-09-24',
    product: '일반 명함',
    title: '제목 제목 제목 제목 제목 제목 제목 제목',
    isReply: false,
    manager: '홍기돌',
    phone: '01000000000',
    attachment: true,
    status: InquiryStatus.ANSWERED,
  },
  {
    id: 5,
    createdAt: '2025-09-24',
    product: '일반 명함',
    title: '제목 제목 제목 제목 제목 제목 제목...',
    isReply: true,
    manager: '홍기돌',
    phone: '01000000000',
    attachment: false,
    status: InquiryStatus.ANSWERED,
  },
  {
    id: 6,
    createdAt: '2025-09-24',
    product: '일반 명함',
    title: '제목 제목 제목 제목 제목 제목 제목 제목',
    isReply: false,
    manager: '홍기돌',
    phone: '01000000000',
    attachment: false,
    status: InquiryStatus.CHECKING,
  },
  {
    id: 7,
    createdAt: '2025-09-24',
    product: '일반 명함',
    title: '제목 제목 제목 제목 제목 제목 제목...',
    isReply: true,
    manager: '홍기돌',
    phone: '01000000000',
    attachment: true,
    status: InquiryStatus.ANSWERED,
  },
  {
    id: 8,
    createdAt: '2025-09-24',
    product: '일반 명함',
    title: '제목 제목 제목 제목 제목 제목 제목 제목',
    isReply: false,
    manager: '홍기돌',
    phone: '01000000000',
    attachment: false,
    status: InquiryStatus.CHECKING,
  },
  {
    id: 9,
    createdAt: '2025-09-24',
    product: '일반 명함',
    title: '제목 제목 제목 제목 제목 제목 제목 제목',
    isReply: false,
    manager: '홍기돌',
    phone: '01000000000',
    attachment: true,
    status: InquiryStatus.CHECKING,
  },
];

export const MOCK_SHIPPING_INQUIRY: ShippingInquiry[] = [
  {
    id: 1,
    createdAt: '2025-09-24',
    order: 'PRINTLY260404-00001',
    title: '제목 제목 제목 제목 제목 제목 제목 제목',
    isReply: false,
    manager: '홍기돌',
    phone: '01000000000',
    attachment: true,
  },
  {
    id: 2,
    createdAt: '2025-09-24',
    order: 'PRINTLY260404-00001',
    title: '제목 제목 제목 제목 제목 제목 제목',
    isReply: true,
    manager: '홍기돌',
    phone: '01000000000',
    attachment: false,
  },
  {
    id: 3,
    createdAt: '2025-09-24',
    order: 'PRINTLY260404-00001',
    title: '제목 제목 제목 제목 제목 제목 제목',
    isReply: true,
    manager: '홍기돌',
    phone: '01000000000',
    attachment: true,
  },
  {
    id: 4,
    createdAt: '2025-09-24',
    order: 'PRINTLY260404-00001',
    title: '제목 제목 제목 제목 제목 제목 제목 제목',
    isReply: false,
    manager: '홍기돌',
    phone: '01000000000',
    attachment: true,
  },
  {
    id: 5,
    createdAt: '2025-09-24',
    order: 'PRINTLY260404-00001',
    title: '제목 제목 제목 제목 제목 제목 제목',
    isReply: true,
    manager: '홍기돌',
    phone: '01000000000',
    attachment: false,
  },
  {
    id: 6,
    createdAt: '2025-09-24',
    order: 'PRINTLY260404-00001',
    title: '제목 제목 제목 제목 제목 제목 제목 제목',
    isReply: false,
    manager: '홍기돌',
    phone: '01000000000',
    attachment: false,
  },
  {
    id: 7,
    createdAt: '2025-09-24',
    order: 'PRINTLY260404-00001',
    title: '제목 제목 제목 제목 제목 제목 제목',
    isReply: true,
    manager: '홍기돌',
    phone: '01000000000',
    attachment: true,
  },
  {
    id: 8,
    createdAt: '2025-09-24',
    order: 'PRINTLY260404-00001',
    title: '제목 제목 제목 제목 제목 제목 제목 제목',
    isReply: false,
    manager: '홍기돌',
    phone: '01000000000',
    attachment: false,
  },
  {
    id: 9,
    createdAt: '2025-09-24',
    order: 'PRINTLY260404-00001',
    title: '제목 제목 제목 제목 제목 제목 제목 제목',
    isReply: false,
    manager: '홍기돌',
    phone: '01000000000',
    attachment: true,
  },
];

export const MOCK_CATEGORIES: MockCategory[] = [
  {
    id: 1,
    name: { ko: '명함', en: 'Business Card' },
    products: Array.from({ length: 10 }).map((_, i) => ({
      id: i + 1,
      name: { ko: '일반 명함', en: 'General Business Card' },
      description: '반누보 (울트라 화이트)227g / 92mm x 52mm / 양면 / 비코팅 / 코너라운딩',
      images: ['/images/product-sample.png'],
    })),
  },
  {
    id: 2,
    name: { ko: '양식지', en: 'Form' },
    products: Array.from({ length: 5 }).map((_, i) => ({
      id: i + 11,
      name: { ko: '일반 양식지', en: 'General Form' },
      description: '반누보 (울트라 화이트)227g / 92mm x 52mm / 양면 / 비코팅 / 코너라운딩',
      images: ['/images/product-sample.png'],
    })),
  },
  {
    id: 3,
    name: { ko: '인쇄물', en: 'Print' },
    products: [],
  },
  {
    id: 4,
    name: { ko: '명패', en: 'Nameplate' },
    products: [],
  },
  {
    id: 5,
    name: { ko: '홍보물', en: 'Promotional' },
    products: [],
  },
  {
    id: 6,
    name: { ko: '명찰', en: 'Namecard' },
    products: [],
  },
  {
    id: 7,
    name: { ko: '실사출력', en: 'Real-size Printing' },
    products: [],
  },
  {
    id: 8,
    name: { ko: '소모품', en: 'Expendables' },
    products: [],
  },
];

export const MOCK_PRODUCT_INQUIRY_DETAIL = {
  id: 1,
  title: '배송지 변경 문의합니다.',
  product: '명함',
  manager: '홍길동',
  phone: '010-1234-5678',
  createdAt: '2025.10.25',
  detail: '배송지를 변경하고 싶습니다. 가능한가요?\n변경할 주소: 서울시 강남구...',
  files: [
    { name: '주소지_증빙.pdf', size: '1.2MB' },
    { name: '참고이미지.png', size: '0.8MB' },
  ],
  answer: {
    adminName: '관리자',
    content:
      '안녕하세요. 서문인쇄입니다.\n문의하신 배송지 변경은 hiện tại 배송 준비 중 단계이므로 변경이 가능합니다.\n변경 처리를 도와드렸습니다. 감사합니다.',
    createdAt: '2025.10.26',
  },
};

export const MOCK_SHIPPING_INQUIRY_DETAIL = {
  id: 1,
  title: '배송지 변경 문의합니다.',
  product: '명함',
  manager: '홍길동',
  phone: '010-1234-5678',
  createdAt: '2025.10.25',
  detail: '배송지를 변경하고 싶습니다. 가능한가요?\n변경할 주소: 서울시 강남구...',
  files: [
    { name: '주소지_증빙.pdf', size: '1.2MB' },
    { name: '참고이미지.png', size: '0.8MB' },
  ],
  answer: {
    adminName: '관리자',
    content:
      '안녕하세요. 서문인쇄입니다.\n문의하신 배송지 변경은 hiện tại 배송 준비 중 단계이므로 변경이 가능합니다.\n변경 처리를 도와드렸습니다. 감사합니다.',
    createdAt: '2025.10.26',
  },
};
export const MOCK_ORDERS = Array.from({ length: 5 }).map((_, i) => ({
  id: `PRINTLY260404-0000${i + 1}`,
  name: '제품 이름',
  description: '반누보 (울트라 화이트)227g / 92mm x 52mm / 양면 / 비코팅 / 코너라운딩',
  image: '/images/product-sample.png',
}));
