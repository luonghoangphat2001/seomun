import { LoginForm } from '../components/login-form';

type LoginPageProps = {
  homePath: string;
};

export function LoginPage({ homePath }: LoginPageProps) {
  return <LoginForm homePath={homePath} />;
}
