'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useLoginMutation, useSocialRedirectMutation } from '@/apis/auth/auth.query';
import { LoginREQ } from '@/apis/auth/auth.request';
import { Button, SafeImage } from '@/components/common';
import { FormCheckbox, FormInput } from '@/components/form';
import { useRouter } from '@/i18n/navigation';
import { getSafeReturnUrl, saveAuthSession } from '@/lib/utils/auth';
import { ROUTES } from '@/routes';
import { useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { FindIdModal, FindIdModalHandle } from './FindIdModal';
import { FindPasswordModal, FindPasswordModalHandle } from './FindPasswordModal';
import { createLoginSchema, LoginFormValues } from './schema';

type SocialProvider = 'kakao' | 'naver';

export default function LoginPage() {
  const tAuth = useTranslations('auth');
  const tValidation = useTranslations('validation');
  const tCommon = useTranslations('common');

  const findIdModalRef = useRef<FindIdModalHandle>(null);
  const findPasswordModalRef = useRef<FindPasswordModalHandle>(null);
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  const loginSchema = createLoginSchema(tAuth, tValidation);

  const { control, handleSubmit, reset } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      remember: false,
    },
  });

  const { mutate: signIn, isPending } = useLoginMutation({
    onSuccess: async (data) => {
      await saveAuthSession({
        accessToken: data.data.access_token,
        refreshToken: data.data.refresh_token,
        user: data.data.user,
      });

      toast.success(data.message ?? tCommon('success'));
      reset();

      const destination = getSafeReturnUrl(returnUrl);
      if (destination.includes('/my')) {
        window.location.replace(destination);
        return;
      }

      router.push(destination);
    },
    onError: (error) => {
      toast.error(error.response?.data.message ?? tCommon('error'));
    },
  });

  //api get social redirect
  const { mutate: mutateSocialRedirect, isPending: isPendingSocialRedirect } = useSocialRedirectMutation();

  const onSubmit = (data: LoginFormValues) => {
    const req: LoginREQ = {
      username: data.username.trim(),
      password: data.password.trim(),
      remember: data.remember,
    };
    signIn(req);
  };

  const navigateToSocialUrl = (url: string) => {
    window.location.href = url;
  };

  const onClickSocial = (provider: SocialProvider) => {
    if (isPendingSocialRedirect) return;

    setLoadingProvider(provider);
    mutateSocialRedirect(provider, {
      onSuccess: (resp) => {
        navigateToSocialUrl(resp.data.redirect_url);
      },
      onError: (error) => {
        toast.error(error.response?.data.message ?? tCommon('error'));
        setLoadingProvider(null);
      },
    });
  };

  const onClickKakao = () => {
    onClickSocial('kakao');
  };

  const onClickNaver = () => {
    onClickSocial('naver');
  };

  return (
    <div className='flex flex-col items-center justify-center pb-12 md:py-12'>
      <div className='w-full max-w-145 space-y-4 px-4 md:space-y-10 md:px-16'>
        <h2 className='title-24 md:title-32'>{tAuth('login')}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <FormInput
            name='username'
            control={control}
            label={tAuth('id')}
            placeholder={tAuth('id')}
            className='h-12'
            showClear={false}
          />

          <FormInput
            name='password'
            control={control}
            label={tAuth('password')}
            placeholder={tAuth('password')}
            type='password'
            className='h-12'
            showClear={false}
          />

          <div className='caption-12 flex items-center justify-between'>
            <FormCheckbox name='remember' control={control} label={tAuth('save_info')} className='[&>span]:caption-12' />
            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => findPasswordModalRef.current?.open()}
                className='caption-12 text-text-main hover:text-text-brand p-0 transition-colors hover:bg-transparent'>
                {tAuth('forgot_password')}
              </Button>
              <span className='text-text-main'>|</span>
              <Button
                type='button'
                variant='ghost'
                onClick={() => findIdModalRef.current?.open()}
                className='caption-12 text-text-main hover:text-text-brand p-0 transition-colors hover:bg-transparent'>
                {tAuth('find_id')}
              </Button>
            </div>
          </div>

          <Button
            type='submit'
            variant='primary'
            fullWidth
            size='lg'
            className='body-16 md:mt-6'
            loading={isPending}
            disabled={isPending}>
            {tAuth('login')}
          </Button>
        </form>

        <div className='mt-8 mb-6 w-full'>
          <div className='relative flex items-center justify-center'>
            <div className='border-border-soft w-full border-t'></div>
            <span className='bg-background body-14 text-text-secondary absolute px-4 text-[13px]'>{tAuth('sns_login')}</span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <Button
            variant='outline'
            size='lg'
            disabled={isPending || isPendingSocialRedirect}
            loading={loadingProvider === 'kakao'}
            leftIcon={<SafeImage src='/images/kakaotalk.png' alt='kakaotalk' width={24} height={24} />}
            onClick={onClickKakao}>
            <span className='font-medium text-[#232323]'>{tAuth('kakao_login')}</span>
          </Button>
          <Button
            variant='outline'
            size='lg'
            disabled={isPending || isPendingSocialRedirect}
            loading={loadingProvider === 'naver'}
            leftIcon={<SafeImage src='/images/naver.png' alt='naver' width={24} height={24} />}
            onClick={onClickNaver}>
            <span className='font-medium text-[#03C75A]'>{tAuth('naver_login')}</span>
          </Button>
        </div>

        <div className='mt-4 flex flex-col items-center gap-2 md:mt-10'>
          <p className='body-14 text-text-secondary py-1'>{tAuth('first_time')}</p>
          <Button
            type='button'
            variant='outline'
            size='lg'
            fullWidth
            disabled={isPending}
            className='body-16'
            onClick={() => router.push(ROUTES.REGISTER)}>
            {tAuth('signup')}
          </Button>
        </div>
      </div>
      <FindIdModal ref={findIdModalRef} onFindPassword={() => findPasswordModalRef.current?.open()} />
      <FindPasswordModal ref={findPasswordModalRef} />
    </div>
  );
}
