import { BoardType } from '../enum';

export const BOARD_TYPE_GROUPS = [
  {
    labelKey: 'board_configs.group.my_activities',
    types: [BoardType.ORDER_TRACKING, BoardType.SHOPPING_CART, BoardType.LOAD_OPTIONS],
  },
  {
    labelKey: 'board_configs.group.design',
    types: [BoardType.EDITOR],
  },
  {
    labelKey: 'board_configs.group.payment_settlement',
    types: [
      BoardType.POINT,
      BoardType.WRITE_A_REVIEW,
      BoardType.DEPOSIT_STATUS,
      BoardType.TRANSACTION_HISTORY_INQUIRY,
      BoardType.CASH_RECEIPT,
      BoardType.TAX_INVOICE,
    ],
  },
  {
    labelKey: 'board_configs.group.customer_service',
    types: [
      BoardType.ANNOUNCEMENT,
      BoardType.FREQUENTLY_ASKED_QUESTIONS,
      BoardType.PRODUCT_INQUIRY,
      BoardType.REQUEST_A_QUOTE,
      BoardType.SHIPPING_DELIVERY_INQUIRY,
      BoardType.PAYMENT_ACCOUNTING_INQUIRIES,
      BoardType.REQUEST_FOR_REWORK,
      BoardType.REFUND_REQUEST,
      BoardType.DIRECT_DELIVERY_REQUEST,
    ],
  },
  {
    labelKey: 'board_configs.group.account_management',
    types: [
      BoardType.EDIT_MEMBER_INFORMATION,
      BoardType.WORKER_MANAGEMENT,
      BoardType.DELIVERY_ADDRESS_MANAGEMENT,
      BoardType.DEDICATED_ACCOUNT_MANAGEMENT,
      BoardType.REFUND_ACCOUNT_MANAGEMENT,
      BoardType.MEMBERSHIP_WITHDRAWAL,
    ],
  },
] as const;
