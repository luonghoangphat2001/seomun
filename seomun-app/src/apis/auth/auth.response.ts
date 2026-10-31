import { User } from '@/types';

export interface LoginRESP {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export type RegisterRESP = LoginRESP;

export interface FindIdRESP {
  username: string;
  created_at: string;
}

export type SocialRedirectRESP = {
  redirect_url: string;
};

export type ProxyLoginExchangeRESP = {
  access_token: string;
  token_type: string;
  expires_in: number;
  proxy_login: {
    session_id: number;
    target_user_id: number;
    expires_at: string;
  };
};
