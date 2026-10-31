'use client';

import { useProxyLoginMutation } from '@/apis/auth/auth.query';
import Loading from '@/components/common/loading';
import { useAuthStore } from '@/hooks';
import { useRouter } from '@/i18n/navigation';
import { saveProxyAuthSession } from '@/lib/utils/auth';
import { ROUTES } from '@/routes';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

const ProxyLoginCallback = () => {
  const tCommon = useTranslations('common');
  const router = useRouter();
  const hasExchangedRef = useRef(false);

  const redirectToLogin = () => {
    useAuthStore.getState().logout();
    router.replace(ROUTES.LOGIN);
  };

  const { mutate: exchangeProxyLogin } = useProxyLoginMutation({
    onSuccess: async ({ data }) => {
      try {
        await saveProxyAuthSession({
          accessToken: data.access_token,
          expiresIn: data.expires_in,
        });

        // A document navigation lets Next's proxy observe the new auth cookie.
        window.location.replace(ROUTES.HOME);
      } catch {
        toast.error(tCommon('error'));
        redirectToLogin();
      }
    },
    onError: (error) => {
      toast.error(error.response?.data.message ?? tCommon('error'));
      redirectToLogin();
    },
  });

  useEffect(() => {
    // React strict mode runs effects twice in development. The handoff token is
    // single-use, so exchange it at most once from this page.
    if (hasExchangedRef.current) return;

    hasExchangedRef.current = true;
    // Do not send a previous customer's Bearer token along with the handoff.
    // `logout` only removes this app's auth cookies; it leaves proxy_handoff intact.
    useAuthStore.getState().logout();
    exchangeProxyLogin();
  }, [exchangeProxyLogin]);

  return (
    <section className='flex min-h-80 flex-col items-center justify-center gap-4'>
      <Loading />
      <p className='body-16 md:body-18 text-text-secondary'>{tCommon('loading')}</p>
    </section>
  );
};

export default ProxyLoginCallback;
