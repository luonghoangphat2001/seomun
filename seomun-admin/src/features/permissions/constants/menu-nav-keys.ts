import type { ParseKeys } from 'i18next';

import { PermissionMenuKey } from '../enums';

/** Maps each permission menu key to its sidebar label key in the `nav` namespace. */
export const PERMISSION_MENU_NAV_KEYS: Record<PermissionMenuKey, ParseKeys<'nav'>> = {
  [PermissionMenuKey.PRODUCTION]: 'production.title',
  [PermissionMenuKey.PRODUCTION_LIST]: 'production.list',
  [PermissionMenuKey.WEB_EDITORS]: 'web_editors.title',
  [PermissionMenuKey.DASHBOARD]: 'dashboard.title',
  [PermissionMenuKey.DASHBOARD_OPERATIONS]: 'dashboard.operations',
  [PermissionMenuKey.DASHBOARD_STATISTICS]: 'dashboard.statistics',
  [PermissionMenuKey.ADMINISTRATORS]: 'administrators.sidebar',
  [PermissionMenuKey.ADMINISTRATORS_LIST]: 'administrators.list',
  [PermissionMenuKey.ADMINISTRATORS_CREATE]: 'administrators.create',
  [PermissionMenuKey.OUTSOURCING]: 'outsourcing.title',
  [PermissionMenuKey.OUTSOURCING_LIST]: 'outsourcing.list',
  [PermissionMenuKey.OUTSOURCING_CREATE]: 'outsourcing.create',
  [PermissionMenuKey.CUSTOMERS]: 'customers.title',
  [PermissionMenuKey.CUSTOMERS_LIST]: 'customers.list',
  [PermissionMenuKey.CUSTOMERS_CREATE]: 'customers.create',
  [PermissionMenuKey.CUSTOMERS_MEMBERSHIP_LEVELS]: 'customers.membership_levels',
  [PermissionMenuKey.CUSTOMERS_POINTS]: 'customers.points',
  [PermissionMenuKey.CUSTOMERS_COUPONS]: 'customers.coupons',
  [PermissionMenuKey.ORDERS]: 'orders.title',
  [PermissionMenuKey.ORDERS_LIST]: 'orders.list',
  [PermissionMenuKey.ORDERS_PRODUCTION_TOOLS]: 'orders.production_tools',
  [PermissionMenuKey.ORDERS_EQUIPMENT]: 'orders.equipment',
  [PermissionMenuKey.ORDERS_PROCESSING]: 'orders.processing',
  [PermissionMenuKey.ORDERS_TAX_INVOICES]: 'orders.tax_invoices',
  [PermissionMenuKey.ORDERS_CASH_RECEIPTS]: 'orders.cash_receipts',
  [PermissionMenuKey.ORDERS_DESIGN_WORKFLOW]: 'orders.design_workflow',
  [PermissionMenuKey.ORDERS_SHIPPING_SETTINGS]: 'orders.shipping_settings',
  [PermissionMenuKey.PRODUCTS]: 'products.title',
  [PermissionMenuKey.PRODUCTS_PRODUCTS]: 'products.products',
  [PermissionMenuKey.PRODUCTS_OPTIONS]: 'products.options',
  [PermissionMenuKey.PRODUCTS_UNIT_PRICE_SETTINGS]: 'products.unit_price_settings',
  [PermissionMenuKey.PRODUCTS_PRICE_SIMULATION]: 'products.price_simulation',
  [PermissionMenuKey.PRODUCTS_PRICE_HISTORY]: 'products.price_history',
  [PermissionMenuKey.PRODUCT_WEB_EDITOR]: 'products.web_editors',
  [PermissionMenuKey.PRODUCTS_PRICING_PROFILES]: 'products.pricing_profiles',
  [PermissionMenuKey.PRODUCTS_TEMPLATES]: 'products.templates',
  [PermissionMenuKey.PRODUCTS_SHOPPING_SETTINGS]: 'products.shopping_settings',
  [PermissionMenuKey.CATEGORIES]: 'categories.title',
  [PermissionMenuKey.CATEGORIES_LIST]: 'categories.list',
  [PermissionMenuKey.CATEGORIES_CREATE]: 'categories.create',
  [PermissionMenuKey.PAYMENTS]: 'payments.title',
  [PermissionMenuKey.PAYMENTS_DETAILS]: 'payments.details',
  [PermissionMenuKey.PAYMENTS_LIMITS]: 'payments.limits',
  [PermissionMenuKey.PAYMENTS_SETTLEMENT_REPORT]: 'payments.settlement_report',
  [PermissionMenuKey.PAYMENTS_POPBILL_DEPOSITS]: 'payments.popbill_deposits',
  [PermissionMenuKey.DELIVERY]: 'delivery.title',
  [PermissionMenuKey.DELIVERY_SHIPMENTS]: 'delivery.shipments',
  [PermissionMenuKey.DELIVERY_DIRECT_SHIPPING]: 'delivery.direct_shipping',
  [PermissionMenuKey.PERMISSIONS]: 'permissions.title',
  [PermissionMenuKey.NOTIFICATIONS]: 'notifications.title',
  [PermissionMenuKey.NOTIFICATIONS_TEMPLATES]: 'notifications.templates',
  [PermissionMenuKey.NOTIFICATIONS_HISTORY]: 'notifications.history',
  [PermissionMenuKey.SYSTEM_CONTENT]: 'system_content.title',
  [PermissionMenuKey.SYSTEM_CONTENT_NOTICES]: 'system_content.notices',
  [PermissionMenuKey.SYSTEM_CONTENT_BANNERS]: 'system_content.banners',
  [PermissionMenuKey.SYSTEM_CONTENT_POPUPS]: 'system_content.popups',
  [PermissionMenuKey.SYSTEM_CONTENT_FAQS]: 'system_content.faqs',
  [PermissionMenuKey.SYSTEM_CONTENT_GUIDES]: 'system_content.guides',
  [PermissionMenuKey.SYSTEM_CONTENT_IMAGES]: 'system_content.images',
  [PermissionMenuKey.SYSTEM_CONTENT_BOARD_CONFIGS]: 'system_content.board_configs',
  [PermissionMenuKey.INQUIRIES]: 'inquiries.title',
  [PermissionMenuKey.SYSTEM_LOGS]: 'system_logs.title',
  [PermissionMenuKey.SYSTEM_LOGS_ACCESS]: 'system_logs.access',
  [PermissionMenuKey.SYSTEM_LOGS_TASKS]: 'system_logs.tasks',
  [PermissionMenuKey.SETTINGS]: 'settings.title',
};

/** Inverse of PERMISSION_MENU_NAV_KEYS: nav labelKey → permission menu key. */
const NAV_KEY_TO_MENU_KEY: Partial<Record<string, PermissionMenuKey>> = Object.fromEntries(
  Object.entries(PERMISSION_MENU_NAV_KEYS).map(([menuKey, navKey]) => [navKey, menuKey as PermissionMenuKey]),
);

/** Permission menu key gating a sidebar item, or undefined when the item is not permission-gated. */
export function getNavItemMenuKey(item: { id: string; labelKey: string }) {
  return NAV_KEY_TO_MENU_KEY[item.id] ?? NAV_KEY_TO_MENU_KEY[item.labelKey];
}
