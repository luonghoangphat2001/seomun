import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { PlaceholderScreen } from '@/components/shared/PlaceholderScreen';

export function ProductionToolsScreen() {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <PlaceholderScreen
        title={t('page.orders.production_tools.title', 'Production Management Tools')}
        description={t(
          'page.orders.production_tools.description',
          'Operational tooling entrypoint for production-side actions such as scanner integration.',
        )}
        routePath='/orders/production-tools'
      />
    </PageContainer>
  );
}

export function OrderProcessingScreen() {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <PlaceholderScreen
        title={t('page.orders.processing.title', 'Order Processing')}
        description={t('page.orders.processing.description', 'Bulk status change and workflow execution screen for order operations.')}
        routePath='/orders/processing'
      />
    </PageContainer>
  );
}

export function TaxInvoiceScreen() {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <PlaceholderScreen
        title={t('page.orders.tax_invoices.title', 'Tax Invoice')}
        description={t('page.orders.tax_invoices.description', 'Manage invoice search, export, generation, issuance, and deletion workflows.')}
        routePath='/orders/tax-invoices'
      />
    </PageContainer>
  );
}

export function CashReceiptScreen() {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <PlaceholderScreen
        title={t('page.orders.cash_receipts.title', 'Cash Receipt')}
        description={t('page.orders.cash_receipts.description', 'Manage receipt search, export, creation, issuance, and deletion workflows.')}
        routePath='/orders/cash-receipts'
      />
    </PageContainer>
  );
}
