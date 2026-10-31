import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { TOKEN_KEYS } from './config';
import { routing } from './i18n/routing';
import { privateRoutes, publicRoutes, ROUTES } from './routes';

function isMatch(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function normalizePathname(pathname: string) {
  const locale = routing.locales.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));

  return locale ? pathname.replace(`/${locale}`, '') || ROUTES.HOME : pathname;
}

const intlMiddleware = createMiddleware(routing);

function preventAuthRouteCaching(response: NextResponse) {
  response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
  response.headers.append('Vary', 'Cookie');
  return response;
}

function getSafeReturnUrl(returnUrl: string | null) {
  if (returnUrl?.startsWith('/') && !returnUrl.startsWith('//')) {
    return returnUrl;
  }

  return ROUTES.HOME;
}

export default async function proxy(req: NextRequest) {
  const hostname = req.headers.get('host')?.split(':')[0].toLowerCase();

  if (hostname === 'print-ly.co.kr') {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.protocol = 'https';
    redirectUrl.hostname = 'www.print-ly.co.kr';
    redirectUrl.port = '';

    return NextResponse.redirect(redirectUrl, 301);
  }

  const intlResponse = intlMiddleware(req);

  const { pathname } = req.nextUrl;
  const path = normalizePathname(pathname);

  if (!isMatch(path, [...publicRoutes, ...privateRoutes])) {
    return intlResponse ?? NextResponse.next();
  }

  const token = req.cookies.get(TOKEN_KEYS.AUTH_SESSION)?.value ?? req.cookies.get(TOKEN_KEYS.ACCESS_TOKEN)?.value;

  if (token && (path === ROUTES.LOGIN || path === ROUTES.REGISTER)) {
    const locale = routing.locales.find((l) => pathname.startsWith(`/${l}`));
    const returnUrl = getSafeReturnUrl(req.nextUrl.searchParams.get('returnUrl'));

    return preventAuthRouteCaching(NextResponse.redirect(new URL(`/${locale ?? 'ko'}${returnUrl}`, req.url)));
  }

  if (isMatch(path, publicRoutes)) {
    if (path === ROUTES.LOGIN || path === ROUTES.REGISTER) {
      return preventAuthRouteCaching(intlResponse ?? NextResponse.next());
    }

    return intlResponse ?? NextResponse.next();
  }

  if (!token) {
    const locale = routing.locales.find((l) => pathname.startsWith(`/${l}`));

    const loginUrl = new URL(`/${locale ?? 'ko'}${ROUTES.LOGIN}`, req.url);
    loginUrl.searchParams.set('returnUrl', path + req.nextUrl.search);

    return preventAuthRouteCaching(NextResponse.redirect(loginUrl));
  }

  return preventAuthRouteCaching(intlResponse ?? NextResponse.next());
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
