import { BANK } from '@/enums/dedicated-account';

export const BANK_OPTIONS = [
  { value: BANK.IBK, image: '/images/bank/ibk-bank.png' },
  { value: BANK.KOOKMIN, image: '/images/bank/kookmin-bank.png' },
  { value: BANK.NONGHYUP, image: '/images/bank/nonghyup-bank.png' },
  { value: BANK.WOORI, image: '/images/bank/woori-bank.png' },
  { value: BANK.DAEGU, image: '/images/bank/im-bank.png' },
  { value: BANK.BUSAN, image: '/images/bank/busan-bank.png' },
  { value: BANK.HANA, image: '/images/bank/hana-bank.png' },
  { value: BANK.SHINHAN, image: '/images/bank/shinhan-bank.png' },
];

export const BANK_CODE_MAP = {
  [BANK.IBK]: '03',
  [BANK.KOOKMIN]: '06',
  [BANK.NONGHYUP]: '11',
  [BANK.WOORI]: '20',
  [BANK.DAEGU]: '31',
  [BANK.BUSAN]: '32',
  [BANK.HANA]: '81',
  [BANK.SHINHAN]: '88',
} as const;

export const BANK_CODE_TO_BANK = {
  '03': BANK.IBK,
  '06': BANK.KOOKMIN,
  '11': BANK.NONGHYUP,
  '20': BANK.WOORI,
  '31': BANK.DAEGU,
  '32': BANK.BUSAN,
  '81': BANK.HANA,
  '88': BANK.SHINHAN,
} as const;

export const BANK_OPTIONS_FOR_CHECK_OUT = [
  { value: BANK.NONGHYUP, image: '/images/bank/nonghyup-bank.png' },
  { value: BANK.BUSAN, image: '/images/bank/busan-bank.png' },
  { value: BANK.DAEGU, image: '/images/bank/iM-bank.png' },
  { value: BANK.HANA, image: '/images/bank/hana-bank.png' },
  { value: BANK.SHINHAN, image: '/images/bank/shinhan-bank.png' },
  { value: BANK.WOORI, image: '/images/bank/woori-bank.png' },
];
