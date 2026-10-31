import { MemberShipWithdrawalReason } from '@/enums/membership-withdrawal';
import { Chat2, Headset2, Heart, Pencil2, ShoppingBag2, SignalOff, Truck, WarningCircle } from '@/icons';

export const MEMBERSHIP_WITHDRAWAL_REASONS = [
  {
    title: 'withdrawal.PRODUCT_VARIETY_LACK',
    icon: ShoppingBag2,
    value: MemberShipWithdrawalReason.PRODUCT_VARIETY_INSUFFICIENT,
  },
  {
    title: 'withdrawal.PRICE_OR_QUALITY_DISSATISFACTION',
    icon: WarningCircle,
    value: MemberShipWithdrawalReason.PRICE_OR_QUALITY_DISSATISFACTION,
  },
  {
    title: 'withdrawal.EXCHANGE_RETURN_AS_ISSUE',
    icon: Chat2,
    value: MemberShipWithdrawalReason.EXCHANGE_RETURN_AS_ISSUE,
  },
  {
    title: 'withdrawal.CUSTOMER_SERVICE_ISSUE',
    icon: Headset2,
    value: MemberShipWithdrawalReason.CUSTOMER_SERVICE_DISSATISFACTION,
  },
  {
    title: 'withdrawal.CUSTOMER_SERVICE_DISSATISFACTION',
    icon: Heart,
    value: MemberShipWithdrawalReason.LOW_USAGE_FREQUENCY,
  },
  {
    title: 'withdrawal.DELIVERY_SERVICE_ISSUE',
    icon: Truck,
    value: MemberShipWithdrawalReason.DELIVERY_SERVICE_ISSUE,
  },
  {
    title: 'withdrawal.WEBSITE_USABILITY_ISSUE',
    icon: SignalOff,
    value: MemberShipWithdrawalReason.WEBSITE_USABILITY_ISSUE,
  },
  {
    title: 'withdrawal.OTHER',
    icon: Pencil2,
    value: MemberShipWithdrawalReason.OTHER,
  },
];

export const MEMBERSHIP_WITHDRAWAL_POLICIES = [
  {
    title: 'my.withdrawal_note_1',
    items: ['my.withdrawal_note_1a'],
  },
  {
    title: 'my.withdrawal_note_2',
    items: ['my.withdrawal_note_2a', 'my.withdrawal_note_2b'],
  },
  {
    title: 'my.withdrawal_note_3',
    items: ['my.withdrawal_note_3a', 'my.withdrawal_note_3b'],
  },
  {
    title: 'my.withdrawal_note_4',
    items: ['my.withdrawal_note_4a'],
  },
  {
    title: 'my.withdrawal_note_5',
    items: ['my.withdrawal_note_5a', 'my.withdrawal_note_5b'],
  },
  {
    title: 'my.withdrawal_note_6',
    items: ['my.withdrawal_note_6a'],
  },
  {
    title: 'my.withdrawal_note_7',
    items: ['my.withdrawal_note_7a'],
  },
];
