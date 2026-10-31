import { getRouteApi } from '@tanstack/react-router';
import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getApiErrorMessage } from '@/utils/api-error';

import {
  useCustomerBasicInfoUpdateMutation,
  useCustomerCompanyInfoUpdateMutation,
  useCustomerDetailQuery,
  useProxyLoginMutation,
} from '../api/customer-list.query';
import { mapMemberCompanyInfoToFormValues, mapMemberDetailToBasicInfoFormValues } from '../api/customer-list.service';
import { CustomerAuditLogSection } from '../components/detail/CustomerAuditLogSection';
import { CustomerBasicInfoForm } from '../components/detail/CustomerBasicInfoForm';
import { CustomerChangePasswordForm } from '../components/detail/CustomerChangePasswordForm';
import { CustomerCompanyInfoForm } from '../components/detail/CustomerCompanyInfoForm';
import { CustomerPaymentHistorySection } from '../components/detail/CustomerPaymentHistorySection';
import { CustomerRefundInfoSection } from '../components/detail/CustomerRefundInfoSection';
import type { CustomerBasicInfoFormValues, CustomerCompanyInfoSubmitValues } from '../schemas';

const customerDetailRouteApi = getRouteApi('/customers/$customerId');

export function CustomerDetailPage() {
  const { t } = useTranslation();
  const { customerId } = customerDetailRouteApi.useParams();
  const memberId = Number(customerId);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isProxyLoginConfirmOpen, setIsProxyLoginConfirmOpen] = useState(false);

  const detailQuery = useCustomerDetailQuery(memberId);
  const updateBasicInfoMutation = useCustomerBasicInfoUpdateMutation(memberId);
  const updateCompanyInfoMutation = useCustomerCompanyInfoUpdateMutation(memberId);
  const proxyLoginMutation = useProxyLoginMutation();

  const handleUpdateBasicInfo = (values: CustomerBasicInfoFormValues) => {
    updateBasicInfoMutation.mutate(
      { ...values, ...mapMemberCompanyInfoToFormValues(detailQuery.data?.data.member.company) },
      {
        onSuccess: () => toast.success(t('message.customers.detail.update_basic_info.success')),
        onError: (error) => toast.error(getApiErrorMessage(error, t('message.customers.detail.update_basic_info.error'))),
      },
    );
  };

  const handleUpdateCompanyInfo = (values: CustomerCompanyInfoSubmitValues) => {
    updateCompanyInfoMutation.mutate(
      { ...mapMemberDetailToBasicInfoFormValues(detailQuery.data?.data.member), ...values },
      {
        onSuccess: () => toast.success(t('message.customers.detail.update_company_info.success')),
        onError: (error) => toast.error(getApiErrorMessage(error, t('message.customers.detail.update_company_info.error'))),
      },
    );
  };

  const handleProxyLogin = () => {
    setIsProxyLoginConfirmOpen(false);

    const proxyLoginWindow = window.open('', '_blank');
    if (!proxyLoginWindow) {
      toast.error(t('page.customers.detail.messages.proxy_login_popup_blocked'));
      return;
    }

    proxyLoginMutation.mutate(memberId, {
      onSuccess: (response) => {
        proxyLoginWindow.opener = null;
        proxyLoginWindow.location.replace(`${response.data.redirect_url}/proxy-login/callback`);
      },
      onError: (error) => {
        proxyLoginWindow.close();
        toast.error(getApiErrorMessage(error, t('page.customers.detail.messages.proxy_login_error')));
      },
    });
  };

  return (
    <PageContainer>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h1 className='text-xl font-semibold'>{t('page.customers.detail.title')}</h1>
          {/* <p className='text-muted-foreground text-sm'>{t('page.customers.detail.description')}</p> */}
        </div>
        <Button
          type='button'
          onClick={() => setIsProxyLoginConfirmOpen(true)}
          disabled={!Number.isFinite(memberId) || memberId <= 0 || proxyLoginMutation.isPending}
        >
          <LogIn className='size-4' />
          {t('page.customers.detail.actions.proxy_login')}
        </Button>
      </div>

      <Separator />

      <div className='grid items-start gap-4 xl:grid-cols-2'>
        <section className='rounded-xl border'>
          <div className='border-b px-5 py-4'>
            <h2 className='text-sm font-semibold'>{t('page.customers.detail.sections.basic_info')}</h2>
          </div>
          <div className='p-5'>
            {detailQuery.isLoading ? <DetailFormSkeleton /> : null}
            {detailQuery.data?.data.member ? (
              <CustomerBasicInfoForm
                member={detailQuery.data.data.member}
                permission={detailQuery.data.data.permission}
                isPending={updateBasicInfoMutation.isPending}
                onChangePassword={() => setIsChangePasswordOpen(true)}
                onSubmit={handleUpdateBasicInfo}
              />
            ) : null}
          </div>
        </section>

        <section className='rounded-xl border'>
          <div className='border-b px-5 py-4'>
            <h2 className='text-sm font-semibold'>{t('page.customers.detail.sections.company_info')}</h2>
          </div>
          <div className='p-5'>
            {detailQuery.isLoading ? (
              <DetailFormSkeleton />
            ) : (
              <CustomerCompanyInfoForm
                company={detailQuery.data?.data.member.company}
                isPending={updateCompanyInfoMutation.isPending}
                onSubmit={handleUpdateCompanyInfo}
              />
            )}
          </div>
        </section>
      </div>

      <CustomerRefundInfoSection member={detailQuery.data?.data.member} isLoading={detailQuery.isLoading} />

      <CustomerPaymentHistorySection customerId={memberId} />

      <CustomerAuditLogSection logs={detailQuery.data?.data.auditLogs ?? []} isLoading={detailQuery.isLoading} />

      <Dialog open={isProxyLoginConfirmOpen} onOpenChange={setIsProxyLoginConfirmOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>{t('page.customers.detail.proxy_login_confirm.title')}</DialogTitle>
            <DialogDescription>{t('page.customers.detail.proxy_login_confirm.description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setIsProxyLoginConfirmOpen(false)} disabled={proxyLoginMutation.isPending}>
              {t('common.action.cancel')}
            </Button>
            <Button type='button' onClick={handleProxyLogin} disabled={proxyLoginMutation.isPending}>
              {t('common.action.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>{t('page.customers.detail.sections.change_password')}</DialogTitle>
          </DialogHeader>
          <CustomerChangePasswordForm memberId={memberId} onSuccess={() => setIsChangePasswordOpen(false)} />
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function DetailFormSkeleton() {
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className='space-y-1.5'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-9 w-full' />
        </div>
      ))}
    </div>
  );
}
