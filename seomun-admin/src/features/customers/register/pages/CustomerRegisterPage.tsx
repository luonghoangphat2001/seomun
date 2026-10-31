import { getRouteApi } from '@tanstack/react-router';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Separator } from '@/components/ui/separator';
import { getApiErrorMessage } from '@/utils/api-error';

import { useCustomerRegisterMutation } from '../api/customer-register.query';
import { CustomerRegisterForm } from '../components/CustomerRegisterForm';
import type { CustomerRegisterSubmitValues } from '../schemas';

const customerRegisterRouteApi = getRouteApi('/customers/create');

export function CustomerRegisterPage() {
  const { t } = useTranslation();
  const navigate = customerRegisterRouteApi.useNavigate();
  const registerMutation = useCustomerRegisterMutation();

  const handleSubmit = (values: CustomerRegisterSubmitValues) => {
    registerMutation.mutate(values, {
      onSuccess: () => {
        toast.success(t('message.customers.register.success'));
        navigate({ to: '/customers' });
      },
      onError: (error) => toast.error(getApiErrorMessage(error, t('message.customers.register.error'))),
    });
  };

  return (
    <PageContainer>
      <div>
        <h1 className='text-xl font-semibold'>{t('page.customers.register.title')}</h1>
        {/* <p className='text-muted-foreground text-sm'>{t('page.customers.register.description')}</p> */}
      </div>

      <Separator />

      <CustomerRegisterForm isPending={registerMutation.isPending} onCancel={() => navigate({ to: '/customers' })} onSubmit={handleSubmit} />
    </PageContainer>
  );
}
