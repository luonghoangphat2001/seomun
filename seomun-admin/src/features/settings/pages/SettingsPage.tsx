import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';

import { useCompanySettingsQuery } from '../api/company-settings.query';
import { useTransactionSettingsQuery } from '../api/transaction-settings.query';
import { CompanySettingsSection } from '../components/CompanySettingsSection';
import { SettingsQueryState } from '../components/SettingsQueryState';
import { TransactionSettingsSection } from '../components/TransactionSettingsSection';

export function SettingsPage() {
  const { t } = useTranslation('page');

  const companyQuery = useCompanySettingsQuery();
  const transactionQuery = useTransactionSettingsQuery();

  return (
    <PageContainer>
      <div>
        <h1 className='text-xl font-semibold'>{t('settings.title')}</h1>
        <p className='text-muted-foreground mt-0.5 text-sm'>{t('settings.description')}</p>
      </div>

      <Separator />

      <div className='space-y-4'>
        <SettingsQueryState
          query={companyQuery}
          errorTitle={t('settings.company.error.load_title')}
          errorDescription={t('settings.company.error.load_description')}
        >
          {(response) => <CompanySettingsSection settings={response.data} />}
        </SettingsQueryState>

        <SettingsQueryState
          query={transactionQuery}
          errorTitle={t('settings.transaction.error.load_title')}
          errorDescription={t('settings.transaction.error.load_description')}
        >
          {(response) => <TransactionSettingsSection settings={response.data} />}
        </SettingsQueryState>
      </div>
    </PageContainer>
  );
}
