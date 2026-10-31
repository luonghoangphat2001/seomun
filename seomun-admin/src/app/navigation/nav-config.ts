import { type ParseKeys } from 'i18next';

import { routePaths } from '@/app/router/route-paths';
import type { UserRole } from '@/lib/auth';
import { ADMIN_AND_SUPER_MANAGER_ROLES, ALL_STAFF_ROLES, SUPER_MANAGER_ROLES } from '@/lib/auth';

export type NavIconKey =
  | 'shield-user'
  | 'building-2'
  | 'users'
  | 'clipboard-list'
  | 'package'
  | 'folders'
  | 'wallet'
  | 'truck'
  | 'key-round'
  | 'bell'
  | 'settings-2'
  | 'message-square-more'
  | 'layout-dashboard'
  | 'chart-bar'
  | 'factory'
  | 'square-dimensions'
  | 'scroll-text'
  | 'square-text';

type NavBaseItem = {
  id: string;
  labelKey: ParseKeys<'nav'>;
  icon: NavIconKey;
  allowedRoles: readonly UserRole[];
};

export type NavGroupChildItem = {
  id: string;
  labelKey: ParseKeys<'nav'>;
  to: string;
  allowedRoles: readonly UserRole[];
};

export type NavLinkItem = NavBaseItem & {
  type: 'link';
  to: string;
};

export type NavGroupItem = NavBaseItem & {
  type: 'group';
  children: NavGroupChildItem[];
};

export type NavItem = NavLinkItem | NavGroupItem;

export type NavConfig = NavItem[];

export interface NavGroupChildItemView extends NavGroupChildItem {
  isActive: boolean;
}

export interface NavLinkView extends NavLinkItem {
  isActive: boolean;
}

export interface NavGroupView extends NavGroupItem {
  isActive: boolean;
  isExpanded: boolean;
  children: NavGroupChildItemView[];
}

export type NavItemView = NavLinkView | NavGroupView;

export const navConfig: NavConfig = [
  {
    id: 'dashboard.operations',
    type: 'link',
    labelKey: 'dashboard.operations',
    icon: 'layout-dashboard',
    to: routePaths.dashboard.operations,
    allowedRoles: ALL_STAFF_ROLES,
  },
  {
    id: 'inquiries',
    type: 'link',
    labelKey: 'inquiries.title',
    icon: 'message-square-more',
    to: routePaths.inquiries.list,
    allowedRoles: ALL_STAFF_ROLES,
  },
  {
    id: 'customers',
    type: 'group',
    labelKey: 'customers.title',
    icon: 'users',
    allowedRoles: ALL_STAFF_ROLES,
    children: [
      { id: 'customers.list', labelKey: 'customers.list', to: routePaths.customers.list, allowedRoles: ALL_STAFF_ROLES },
      { id: 'orders.coupons', labelKey: 'customers.coupons', to: routePaths.orders.coupons, allowedRoles: ALL_STAFF_ROLES },
    ],
  },
  {
    id: 'orders',
    type: 'group',
    labelKey: 'orders.title',
    icon: 'clipboard-list',
    allowedRoles: ALL_STAFF_ROLES,
    children: [
      { id: 'orders.list', labelKey: 'orders.list', to: routePaths.orders.list, allowedRoles: ALL_STAFF_ROLES },
      {
        id: 'orders.production_tools',
        labelKey: 'orders.production_tools',
        to: routePaths.orders.productionTools,
        allowedRoles: ALL_STAFF_ROLES,
      },
      { id: 'orders.design_workflow', labelKey: 'orders.design_workflow', to: routePaths.orders.designWorkflow, allowedRoles: ALL_STAFF_ROLES },
    ],
  },
  {
    id: 'production',
    type: 'group',
    labelKey: 'production.title',
    icon: 'factory',
    allowedRoles: ALL_STAFF_ROLES,
    children: [
      { id: 'production.list', labelKey: 'production.list', to: routePaths.orders.production, allowedRoles: ALL_STAFF_ROLES },
      { id: 'orders.equipment', labelKey: 'orders.equipment', to: routePaths.orders.equipment, allowedRoles: ALL_STAFF_ROLES },
      { id: 'outsourcing.list', labelKey: 'outsourcing.list', to: routePaths.outsourcing.list, allowedRoles: ALL_STAFF_ROLES },
    ],
  },
  {
    id: 'payments',
    type: 'group',
    labelKey: 'payments.title',
    icon: 'wallet',
    allowedRoles: ALL_STAFF_ROLES,
    children: [
      { id: 'payments.details', labelKey: 'payments.details', to: routePaths.payments.list, allowedRoles: ALL_STAFF_ROLES },
      {
        id: 'orders.tax_invoices',
        labelKey: 'orders.tax_invoices',
        to: routePaths.orders.taxInvoices,
        allowedRoles: ALL_STAFF_ROLES,
      },
      {
        id: 'orders.cash_receipts',
        labelKey: 'orders.cash_receipts',
        to: routePaths.orders.cashReceipts,
        allowedRoles: ALL_STAFF_ROLES,
      },
      {
        id: 'payments.settlement_report',
        labelKey: 'payments.settlement_report',
        to: routePaths.payments.settlementReport,
        allowedRoles: ALL_STAFF_ROLES,
      },
      {
        id: 'payments.popbill_deposits',
        labelKey: 'payments.popbill_deposits',
        to: routePaths.payments.popbillDeposits,
        allowedRoles: ALL_STAFF_ROLES,
      },
      // { id: 'payments.limits', labelKey: 'payments.limits', to: routePaths.payments.limits, allowedRoles: ALL_STAFF_ROLES },
    ],
  },
  {
    id: 'delivery',
    type: 'group',
    labelKey: 'delivery.title',
    icon: 'truck',
    allowedRoles: ALL_STAFF_ROLES,
    children: [
      {
        id: 'delivery.shipments',
        labelKey: 'delivery.shipments',
        to: routePaths.delivery.shipments,
        allowedRoles: ALL_STAFF_ROLES,
      },
      {
        id: 'delivery.direct_shipping',
        labelKey: 'delivery.direct_shipping',
        to: routePaths.delivery.directShipping,
        allowedRoles: ALL_STAFF_ROLES,
      },
    ],
  },
  {
    id: 'products',
    type: 'group',
    labelKey: 'products.title',
    icon: 'package',
    allowedRoles: ALL_STAFF_ROLES,
    children: [
      { id: 'products.products', labelKey: 'products.products', to: routePaths.products.list, allowedRoles: ALL_STAFF_ROLES },
      { id: 'products.options', labelKey: 'products.options', to: routePaths.products.options, allowedRoles: ALL_STAFF_ROLES },
      {
        id: 'products.unit_price_settings',
        labelKey: 'products.unit_price_settings',
        to: routePaths.products.unitPriceSettings,
        allowedRoles: ADMIN_AND_SUPER_MANAGER_ROLES,
      },
      {
        id: 'products.price_simulation',
        labelKey: 'products.price_simulation',
        to: routePaths.products.priceSimulation,
        allowedRoles: ALL_STAFF_ROLES,
      },
      {
        id: 'orders.shipping_settings',
        labelKey: 'orders.shipping_settings',
        to: routePaths.orders.shippingSettings,
        allowedRoles: ALL_STAFF_ROLES,
      },
      {
        id: 'products.pricing_profiles',
        labelKey: 'products.pricing_profiles',
        to: routePaths.products.pricingProfiles,
        allowedRoles: ADMIN_AND_SUPER_MANAGER_ROLES,
      },
    ],
  },
  {
    id: 'web-editors',
    type: 'group',
    labelKey: 'web_editors.title',
    icon: 'square-dimensions',
    allowedRoles: ALL_STAFF_ROLES,
    children: [
      { id: 'products.web_editors', labelKey: 'products.web_editors', to: routePaths.products.webEditors, allowedRoles: ALL_STAFF_ROLES },
      { id: 'products.templates', labelKey: 'products.templates', to: routePaths.products.templates, allowedRoles: ALL_STAFF_ROLES },
    ],
  },
  {
    id: 'system-content',
    type: 'group',
    labelKey: 'system_content.title',
    icon: 'square-text',
    allowedRoles: ALL_STAFF_ROLES,
    children: [
      {
        id: 'categories.list',
        labelKey: 'categories.list',
        to: routePaths.categories.list,
        allowedRoles: ADMIN_AND_SUPER_MANAGER_ROLES,
      },
      {
        id: 'products.shopping_settings',
        labelKey: 'products.shopping_settings',
        to: routePaths.products.shoppingSettings,
        allowedRoles: ALL_STAFF_ROLES,
      },
      {
        id: 'system-content.notices',
        labelKey: 'system_content.notices',
        to: routePaths.systemContent.notices.list,
        allowedRoles: ALL_STAFF_ROLES,
      },
      {
        id: 'system-content.banners',
        labelKey: 'system_content.banners',
        to: routePaths.systemContent.banners.list,
        allowedRoles: ALL_STAFF_ROLES,
      },
      {
        id: 'system-content.popups',
        labelKey: 'system_content.popups',
        to: routePaths.systemContent.popups.list,
        allowedRoles: ALL_STAFF_ROLES,
      },
      {
        id: 'system-content.faqs',
        labelKey: 'system_content.faqs',
        to: routePaths.systemContent.faqs.list,
        allowedRoles: ALL_STAFF_ROLES,
      },
      {
        id: 'system-content.guides',
        labelKey: 'system_content.guides',
        to: routePaths.systemContent.guides,
        allowedRoles: ALL_STAFF_ROLES,
      },
      {
        id: 'system-content.board-configs',
        labelKey: 'system_content.board_configs',
        to: routePaths.systemContent.boardConfigs,
        allowedRoles: ALL_STAFF_ROLES,
      },
      // {
      //   id: 'notifications.templates',
      //   labelKey: 'notifications.templates',
      //   to: routePaths.notifications.templates,
      //   allowedRoles: ALL_STAFF_ROLES,
      // },
      // {
      //   id: 'notifications.history',
      //   labelKey: 'notifications.history',
      //   to: routePaths.notifications.history,
      //   allowedRoles: ALL_STAFF_ROLES,
      // },
      {
        id: 'system-content.images',
        labelKey: 'system_content.images',
        to: routePaths.systemContent.images,
        allowedRoles: ALL_STAFF_ROLES,
      },
    ],
  },
  {
    id: 'administrators',
    type: 'group',
    labelKey: 'administrators.sidebar',
    icon: 'shield-user',
    allowedRoles: ALL_STAFF_ROLES,
    children: [
      { id: 'administrators.list', labelKey: 'administrators.list', to: routePaths.administrators.list, allowedRoles: SUPER_MANAGER_ROLES },
      {
        id: 'permissions',
        labelKey: 'permissions.title',
        to: routePaths.permissions.list,
        allowedRoles: ALL_STAFF_ROLES,
      },
    ],
  },
  {
    id: 'dashboard.statistics',
    type: 'link',
    labelKey: 'dashboard.statistics',
    icon: 'chart-bar',
    to: routePaths.dashboard.statistics,
    allowedRoles: ALL_STAFF_ROLES,
  },
  {
    id: 'system-logs',
    type: 'group',
    labelKey: 'system_logs.title',
    icon: 'scroll-text',
    allowedRoles: SUPER_MANAGER_ROLES,
    children: [
      {
        id: 'system-logs.access',
        labelKey: 'system_logs.access',
        to: routePaths.systemLogs.access,
        allowedRoles: SUPER_MANAGER_ROLES,
      },
      {
        id: 'system-logs.tasks',
        labelKey: 'system_logs.tasks',
        to: routePaths.systemLogs.tasks,
        allowedRoles: SUPER_MANAGER_ROLES,
      },
    ],
  },
  {
    id: 'settings',
    type: 'link',
    labelKey: 'settings.title',
    icon: 'settings-2',
    to: routePaths.settings,
    allowedRoles: ALL_STAFF_ROLES,
  },
];
