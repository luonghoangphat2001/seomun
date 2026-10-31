import { routePaths } from '@/app/router/route-paths';
import { IMAGE } from '@/assets/images';
import { env } from '@/config/env';

export const branding = {
  appName: env.VITE_APP_NAME,
  logoSrc: IMAGE.logoMark,
  homePath: routePaths.home,
} as const;
