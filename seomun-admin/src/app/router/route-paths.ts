export const routePaths = {
  home: '/dashboard',
  login: '/login',
  unauthorized: '/unauthorized',
  uiKit: '/ui-kit',
  settings: '/settings',

  administrators: {
    list: '/administrators',
    create: '/administrators/create',
    edit: '/administrators/$administratorId',
  },

  outsourcing: {
    list: '/outsourcing',
    create: '/outsourcing/create',
    detail: '/outsourcing/$outsourcingId',
    edit: '/outsourcing/$outsourcingId/edit',
  },

  customers: {
    list: '/customers',
    detail: '/customers/$customerId',
    create: '/customers/create',
    approvals: '/customers/approvals',
    exposure: '/customers/exposure',
    membershipLevels: '/customers/membership-levels',
    points: '/customers/points',
  },

  orders: {
    list: '/orders',
    designWorkflow: '/orders/design-workflow',
    production: '/orders/production',
    productionDetail: '/orders/production/$orderId',
    productionTools: '/orders/production-tools',
    equipment: '/orders/equipment',
    processing: '/orders/processing',
    taxInvoices: '/orders/tax-invoices',
    cashReceipts: '/orders/cash-receipts',
    coupons: '/orders/coupons',
    shippingSettings: '/orders/shipping-settings',
  },

  products: {
    list: '/products',
    create: '/products/create',
    templates: '/products/templates',
    options: '/products/options',
    pricingProfiles: '/products/pricing-profiles',
    priceSimulation: '/products/price-simulation',
    priceHistory: '/products/price-history',
    shoppingSettings: '/products/shopping-settings',
    webEditors: '/products/web-editors',
    unitPriceSettings: '/products/unit-price-settings',
  },

  categories: {
    list: '/categories',
    create: '/categories/create',
  },

  payments: {
    list: '/payments',
    limits: '/payments/limits',
    settlementReport: '/payments/settlement-report',
    popbillDeposits: '/payments/popbill-deposits',
  },

  delivery: {
    shipments: '/delivery/shipments',
    tracking: '/delivery/tracking',
    directShipping: '/delivery/direct-shipping',
  },

  notifications: {
    templates: '/notifications/templates',
    templateCreate: '/notifications/templates/create',
    templateEdit: '/notifications/templates/$templateId',
    history: '/notifications/history',
  },

  systemContent: {
    notices: {
      list: '/system-content/notices',
      create: '/system-content/notices/create',
      edit: '/system-content/notices/$noticeId',
    },
    banners: {
      list: '/system-content/banners',
      create: '/system-content/banners/create',
      edit: '/system-content/banners/$bannerId',
    },
    popups: {
      list: '/system-content/popups',
      create: '/system-content/popups/create',
      edit: '/system-content/popups/$popupId',
    },
    faqs: {
      list: '/system-content/faqs',
      create: '/system-content/faqs/create',
      edit: '/system-content/faqs/$faqId',
    },
    guides: '/system-content/guides',
    images: '/system-content/images',
    boardConfigs: '/system-content/board-configs',
  },

  systemLogs: {
    access: '/system-logs/access',
    tasks: '/system-logs/tasks',
  },

  permissions: {
    list: '/permissions',
    detail: '/permissions/$permissionId',
  },

  inquiries: {
    list: '/inquiries',
    detail: '/inquiries/$inquiryId',
  },

  dashboard: {
    operations: '/dashboard',
    statistics: '/dashboard/statistics',
  },
} as const;

export type AppRoutePath = (typeof routePaths)[keyof typeof routePaths];
