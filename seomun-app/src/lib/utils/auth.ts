import { ProfileApi } from '@/apis/my/profile/profile.api';
import { ProfileUser } from '@/apis/my/profile/profile.response';
import { TokenService } from '@/config/token';
import { useAuthStore } from '@/hooks';
import { ROUTES } from '@/routes';
import { User } from '@/types';

type SaveAuthSessionParams = {
  accessToken: string;
  refreshToken: string;
  user: User;
  refreshProfile?: boolean;
};

type SaveProxyAuthSessionParams = {
  accessToken: string;
  expiresIn?: number;
};

export const getSafeReturnUrl = (returnUrl?: string | null) => {
  if (returnUrl?.startsWith('/') && !returnUrl.startsWith('//')) {
    return returnUrl;
  }

  return ROUTES.HOME;
};

export const transformProfileUserToUser = (profileUser: ProfileUser, currentUser?: User | null): User => ({
  ...(currentUser ?? profileUser),
  ...profileUser,
  avatar: profileUser.avatar ?? currentUser?.avatar ?? '',
  headquarters: profileUser.headquarters ?? currentUser?.headquarters ?? '',
  business_office: profileUser.business_office ?? currentUser?.business_office ?? '',
  team: profileUser.team ?? currentUser?.team ?? '',
  position: profileUser.position ?? currentUser?.position ?? '',
  customer: profileUser.customer ?? undefined,
});

export const refreshAuthProfile = async () => {
  const profileResponse = await ProfileApi.get();
  const { setProfile, setUser, user } = useAuthStore.getState();

  setProfile(profileResponse.data);
  setUser(transformProfileUserToUser(profileResponse.data.profile, user));

  return profileResponse.data;
};

export const saveAuthSession = async ({ accessToken, refreshToken, user, refreshProfile = true }: SaveAuthSessionParams) => {
  TokenService.setTokens(accessToken, refreshToken);

  const { setProfile, setUser } = useAuthStore.getState();

  setUser(user);

  if (!refreshProfile) return;

  void refreshAuthProfile().catch(() => setProfile(null));
};

/**
 * The proxy-login exchange returns no user or refresh token. Fetching the
 * profile after storing its access token restores the same client auth state
 * as a normal login without changing that login flow.
 */
export const saveProxyAuthSession = async ({ accessToken, expiresIn }: SaveProxyAuthSessionParams) => {
  TokenService.setAccessToken(accessToken, expiresIn);

  const { setProfile, setUser } = useAuthStore.getState();
  setProfile(null);
  setUser(null);

  await refreshAuthProfile();
};
