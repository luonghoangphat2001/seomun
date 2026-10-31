import { ROUTES } from '@/routes';
import { NotificationCategory, NotificationItem } from '@/types/notification';
import { NotificationDataRESP, NotificationRESP } from './notification.response';

const ORDER_TYPES = ['order_status_changed', 'payment_succeeded'];
const INQUIRY_TYPES = ['inquiry_reply'];

const INQUIRY_DETAIL_ROUTES: Record<string, (id: number | string) => string> = {
  product: ROUTES.MY_PAGE.PRODUCT_INQUIRY_DETAIL,
  quote: ROUTES.MY_PAGE.QUOTE_INQUIRY_DETAIL,
  shipping: ROUTES.MY_PAGE.SHIPPING_INQUIRY_DETAIL,
  payment: ROUTES.MY_PAGE.PAYMENT_INQUIRY_DETAIL,
  rework: ROUTES.MY_PAGE.REWORK_REQUEST_DETAIL,
  refund: ROUTES.MY_PAGE.REFUND_REQUEST_DETAIL,
};

const getNotificationCategory = (type: string): NotificationCategory => {
  if (ORDER_TYPES.includes(type)) return 'ORDER';
  if (INQUIRY_TYPES.includes(type)) return 'INQUIRY';
  return 'SYSTEM';
};

const getNotificationLink = (category: NotificationCategory, data: NotificationDataRESP) => {
  const payload = data.payload ?? {};

  if (category === 'ORDER') {
    return typeof payload.order_number === 'string' ? ROUTES.MY_PAGE.ORDER_DETAIL(payload.order_number) : ROUTES.MY_PAGE.ORDER;
  }

  if (category === 'INQUIRY') {
    const inquiryId = payload.inquiry_id;
    if (typeof inquiryId !== 'number' && typeof inquiryId !== 'string') return ROUTES.MY_PAGE.QUOTE_INQUIRY;
    const toDetail = INQUIRY_DETAIL_ROUTES[String(payload.inquiry_type)] ?? ROUTES.MY_PAGE.QUOTE_INQUIRY_DETAIL;
    return toDetail(inquiryId);
  }

  return data.link || undefined;
};

export const transformNotificationRESPToItem = (resp: NotificationRESP): NotificationItem => {
  const category = getNotificationCategory(resp.type);

  return {
    id: resp.id,
    category,
    title: resp.data.title,
    message: resp.data.message,
    createdAt: resp.created_at,
    isRead: resp.is_read,
    link: getNotificationLink(category, resp.data),
    metadata: resp.data.payload,
  };
};
