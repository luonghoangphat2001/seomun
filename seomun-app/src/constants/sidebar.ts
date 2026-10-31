import { BoardType } from '@/enums/board-notice';
import { UserMemberType } from '@/enums/user';
import { ROUTES } from '@/routes';
import { MenuGroup } from '@/types';

export const mySidebarMenu: MenuGroup[] = [
  {
    title: 'groups.my_activity',
    items: [
      {
        label: 'items.order_tracking',
        link: ROUTES.MY_PAGE.ORDER,
        boardType: BoardType.Order_Tracking,
      },
      {
        label: 'items.cart',
        link: ROUTES.MY_PAGE.CART,
        boardType: BoardType.Shopping_Cart,
      },
      {
        label: 'items.load_save_options',
        link: ROUTES.MY_PAGE.LOAD_SAVE_OPTIONS,
        boardType: BoardType.Load_Options,
      },
    ],
  },
  {
    title: 'groups.design',
    items: [
      {
        label: 'items.editor',
        link: ROUTES.MY_PAGE.EDITOR,
        boardType: BoardType.Editor,
      },
    ],
  },
  {
    title: 'groups.payment_settlement',
    items: [
      {
        label: 'items.coupon',
        link: ROUTES.MY_PAGE.COUPON,
        boardType: BoardType.Edit_Member_Information,
      },
      // {
      //   label: 'items.point',
      //   link: ROUTES.MY_PAGE.POINT,
      //   boardType: BoardType.Point,
      // },
      {
        label: 'items.write_review',
        link: ROUTES.MY_PAGE.REVIEW,
        boardType: BoardType.Write_A_Review,
      },
      {
        label: 'items.deposit_status',
        link: ROUTES.MY_PAGE.DEPOSIT_STATUS,
        boardType: BoardType.Deposit_Status,
      },
      {
        label: 'items.transaction_history',
        link: ROUTES.MY_PAGE.TRANSACTION_HISTORY,
        boardType: BoardType.Transaction_History_Inquiry,
      },
      {
        label: 'items.cash_receipt',
        link: ROUTES.MY_PAGE.CASH_RECEIPT,
        boardType: BoardType.Cash_Receipt,
      },
      {
        label: 'items.tax_invoice',
        link: ROUTES.MY_PAGE.TAX_INVOICE,
        boardType: BoardType.Tax_Invoice,
      },
    ],
  },
  {
    title: 'groups.customer_center',
    items: [
      {
        label: 'items.notice',
        link: ROUTES.MY_PAGE.NOTICE,
        boardType: BoardType.Announcement,
      },
      {
        label: 'items.faq',
        link: ROUTES.MY_PAGE.FAQ,
        boardType: BoardType.Frequently_Asked_Questions,
      },
      {
        label: 'items.product_inquiry',
        link: ROUTES.MY_PAGE.PRODUCT_INQUIRY,
        boardType: BoardType.Product_Inquiry,
      },
      {
        label: 'items.quote_inquiry',
        link: ROUTES.MY_PAGE.QUOTE_INQUIRY,
        boardType: BoardType.Request_A_Quote,
      },
      {
        label: 'items.shipping_inquiry',
        link: ROUTES.MY_PAGE.SHIPPING_INQUIRY,
        boardType: BoardType.Shipping_Delivery_Inquiry,
      },
      {
        label: 'items.payment_inquiry',
        link: ROUTES.MY_PAGE.PAYMENT_INQUIRY,
        boardType: BoardType.Payment_Accounting_Inquiries,
      },
      {
        label: 'items.rework_request',
        link: ROUTES.MY_PAGE.REWORK_REQUEST,
        boardType: BoardType.Request_For_Rework,
      },
      {
        label: 'items.refund_request',
        link: ROUTES.MY_PAGE.REFUND_REQUEST,
        boardType: BoardType.Refund_Request,
      },
      {
        label: 'items.delivery_request',
        link: ROUTES.MY_PAGE.DIRECT_SHIPPING_REQUEST,
        boardType: BoardType.Direct_Delivery_Request,
      },
    ],
  },
  {
    title: 'groups.account_management',
    items: [
      {
        label: 'items.member_info',
        link: ROUTES.MY_PAGE.MEMBER_INFO,
        boardType: BoardType.Edit_Member_Information,
      },
      {
        label: 'items.worker_management',
        link: ROUTES.MY_PAGE.WORKER,
        boardType: BoardType.Worker_Management,
      },
      {
        label: 'items.shipping_address_management',
        link: ROUTES.MY_PAGE.SHIPPING_ADDRESS,
        boardType: BoardType.Delivery_Address_Management,
      },
      {
        label: 'items.account_management',
        link: ROUTES.MY_PAGE.DEDICATED_ACCOUNT,
        boardType: BoardType.Dedicated_Account_Management,
      },
      {
        label: 'items.refund_account_management',
        link: ROUTES.MY_PAGE.REFUND_ACCOUNT,
        boardType: BoardType.Refund_Account_Management,
      },
      {
        label: 'items.withdraw_membership',
        link: ROUTES.MY_PAGE.MEMBERSHIP_WITHDRAWAL,
        boardType: BoardType.Membership_Withdrawal,
      },
    ],
  },
];

export const getMySidebarMenu = (memberType?: UserMemberType): MenuGroup[] =>
  mySidebarMenu
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.memberTypes || (memberType !== undefined && item.memberTypes.includes(memberType)),
      ),
    }))
    .filter((group) => group.items.length > 0);

export const customerServiceTabs = (isMypage?: boolean) => [
  {
    label: 'announcement',
    href: isMypage ? ROUTES.MY_PAGE.NOTICE : ROUTES.CUSTOMER_SERVICE.ANNOUNCEMENT,
  },
  {
    label: 'faq',
    href: isMypage ? ROUTES.MY_PAGE.FAQ : ROUTES.CUSTOMER_SERVICE.FAQ,
  },
];
