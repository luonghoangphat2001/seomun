export const PAGINATION = {
  DEFAULT_PAGE_INDEX: 0,
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_VISIBLE: 3,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  MAX_PAGE_SIZE: 999,
};

export const DATE_FORMAT = {
  DEFAULT: 'yyyy-MM-dd',
  DATE_TIME: 'yyyy-MM-dd HH:mm:ss',
  DATE_WITH_DOT: 'yyyy.MM.dd',
  DATE_TIME_WITH_DOT: 'yyyy.MM.dd HH:mm:ss',
  DATE_HOUR_MINUTE: 'yyyy.MM.dd HH:mm',
};

export const EMAIL_DOMAINS = {
  NAVER: 'naver.com',
  GMAIL: 'gmail.com',
  KAKAO: 'kakao.com',
  DAUM: 'daum.net',
  HANMAIL: 'hanmail.net',
  NATE: 'nate.com',
  HOT: 'hotmail.com',
} as const;

export const PHONE_PREFIXES = [
  '02',
  '051',
  '053',
  '032',
  '062',
  '042',
  '052',
  '031',
  '033',
  '043',
  '041',
  '044',
  '063',
  '061',
  '054',
  '055',
  '064',
  '010',
  '070',
  '080',
  '1588',
  '1644',
];

export const PHONE_OPTIONS = PHONE_PREFIXES.map((p) => ({ label: p, value: p }));

export const DELIVERY_MESSAGE_MANUAL = '직접 입력';

// A preset message disables the custom note field; manual/empty keeps it editable.
export const isDeliveryMessagePreset = (option: unknown) => Boolean(option) && option !== DELIVERY_MESSAGE_MANUAL;

export const DELIVERY_MESSAGE_OPTIONS = [
  DELIVERY_MESSAGE_MANUAL,
  '부재시 문앞에 놓아주세요',
  '부재시 연락주세요',
  '배송 전 연락주세요',
].map((message) => ({ value: message, label: message }));

export const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY;

export const TOSS_PAYMENT_KEY = 'paymentKey';
export const TOSS_AMOUNT = 'amount';
export const TOSS_ORDER_ID = 'orderId';

export const ALLOWED_DESIGN_FILE_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'ai', 'eps', 'zip']);
export const ALLOWED_DESIGN_FILE_ACCEPT =
  '.pdf,.jpg,.jpeg,.png,.ai,.eps,.zip,application/pdf,image/jpeg,image/png,application/postscript,application/zip';
export const UNSUPPORTED_DESIGN_FILE_MESSAGE = 'Only PDF, JPG, PNG, AI, EPS, and ZIP files can be uploaded.';

export const isAllowedDesignFile = (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return Boolean(extension && ALLOWED_DESIGN_FILE_EXTENSIONS.has(extension));
};

export const INSTAGRAM_LINK = 'https://www.instagram.com/print_ly.co.kr/';
export const BLOG_LINK = 'https://blog.naver.com/print-ly';
export const KAKAO_LINK = 'http://pf.kakao.com/_xhrExjX/chat';

export const CHANNEL_TALK_PLUGIN_KEY = process.env.NEXT_PUBLIC_CHANNEL_PLUGIN_KEY;
