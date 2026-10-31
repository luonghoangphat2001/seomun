import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { AppButton } from '@/components/shared/app-button';
import { AppInputFormField } from '@/components/shared/form-fields';
import { branding } from '@/config/branding';
import { useAuthStore } from '@/stores/auth-store';
import { TokenService } from '@/utils/token';
import { IMAGE } from '@/assets/images';
import { useTranslation } from 'react-i18next';
import { useLoginMutation } from '../api';
import { type LoginFormValues, loginSchema } from '../schemas/login-form.schema';

interface LoginScreenProps {
  homePath: string;
}

export function LoginForm({ homePath }: LoginScreenProps) {
  const { t } = useTranslation('form');
  const { t: tMessage } = useTranslation('message');
  const { t: tValidate } = useTranslation('validation');
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema(t, tValidate)),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const { mutate: loginUser, isPending } = useLoginMutation();

  const onSubmit = (values: LoginFormValues) => {
    loginUser(
      {
        ...values,
        device_name: 'Admin Web',
      },
      {
        onSuccess: (response) => {
          const { access_token, refresh_token, expires_in, user } = response.data;
          const finalRefreshToken = refresh_token ?? access_token;
          TokenService.setTokens(access_token, finalRefreshToken, expires_in);

          setUser(user);
          toast.success(tMessage('auth.login_success'));
          void navigate({ to: homePath });
        },
        onError: () => {
          toast.error(tMessage('auth.login_failed'));
        },
      },
    );
  };

  return (
    <div className='flex min-h-dvh items-center justify-center gap-4 rounded-lg p-10 shadow-md'>
      <div className='flex w-[430px] flex-col gap-4 rounded-lg bg-white p-10 shadow-md'>
        <div className='mb-4 flex size-14 h-full w-full shrink-0 items-center justify-center rounded-lg transition-all'>
          <img src={IMAGE.logo} alt={branding.appName} className='object-contain' />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          <AppInputFormField
            name='username'
            control={control}
            label={t('auth.fields.username.label')}
            placeholder={t('auth.fields.username.placeholder')}
            disabled={isPending}
          />

          <AppInputFormField
            name='password'
            control={control}
            type='password'
            label={t('auth.fields.password.label')}
            placeholder={t('auth.fields.password.placeholder')}
            disabled={isPending}
          />

          <AppButton className='mt-2 h-10 w-full font-medium' type='submit' isLoading={isPending}>
            {t('auth.actions.login')}
          </AppButton>
        </form>
      </div>
    </div>
  );
}
