'use client';

import { useSocialLoginMutation } from '@/apis/auth/auth.query';
import Loading from '@/components/common/loading';
import { useRouter } from '@/i18n/navigation';
import { getSafeReturnUrl, saveAuthSession } from '@/lib/utils/auth';
import { ROUTES } from '@/routes';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

const SocialCallBack = () => {
  const tCommon = useTranslations('common');
  const tAuth = useTranslations('auth');
  const router = useRouter();
  const params = useParams<{ provider: string }>();
  const searchParams = useSearchParams();
  const hasSubmittedRef = useRef(false);

  const provider = params.provider;
  const code = searchParams.get('code');
  const returnUrl = searchParams.get('returnUrl');

  const { mutate: socialLogin } = useSocialLoginMutation({
    onSuccess: async (data) => {
      await saveAuthSession({
        accessToken: data.data.access_token,
        refreshToken: data.data.refresh_token,
        user: data.data.user,
        refreshProfile: false,
      });

      toast.success(data.message ?? tCommon('success'));
      window.location.replace(getSafeReturnUrl(returnUrl));
    },
    onError: (error) => {
      toast.error(error.response?.data.message ?? tCommon('error'));
      router.push(ROUTES.LOGIN);
    },
  });

  useEffect(() => {
    if (hasSubmittedRef.current) return;

    if (!provider || !code) {
      toast.error(tCommon('error'));
      router.push(ROUTES.LOGIN);
      return;
    }

    hasSubmittedRef.current = true;
    socialLogin({ provider, code });
  }, [code, provider, router, socialLogin, tCommon]);

  return (
    <section className='flex min-h-80 flex-col items-center justify-center gap-4'>
      <Loading />
      <p className='body-16 md:body-18 text-text-secondary'>{tAuth('social_login_loading')}</p>
    </section>
  );
};

export default SocialCallBack;
