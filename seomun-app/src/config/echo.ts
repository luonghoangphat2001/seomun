import { configureEcho, echo } from '@laravel/echo-react';
import Pusher from 'pusher-js';
import { api } from './axios';

const REVERB_SCHEME = process.env.NEXT_PUBLIC_REVERB_SCHEME || 'https';
const REVERB_PORT = Number(process.env.NEXT_PUBLIC_REVERB_PORT) || (REVERB_SCHEME === 'https' ? 443 : 80);

export const isEchoEnabled = !!process.env.NEXT_PUBLIC_REVERB_APP_KEY;

let active = false;

export const setupEcho = () => {
  if (active) return;

  if (process.env.NODE_ENV === 'development') Pusher.logToConsole = true;

  configureEcho({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
    wsPort: REVERB_PORT,
    wssPort: REVERB_PORT,
    forceTLS: REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    channelAuthorization: {
      customHandler: ({ socketId, channelName }, callback) => {
        api
          .post<{ auth: string }>('/broadcasting/auth', { socket_id: socketId, channel_name: channelName })
          .then((data) => callback(null, data))
          .catch((error: Error) => callback(error, null));
      },
    },
  });
  active = true;
};

export const teardownEcho = () => {
  if (active) echo().disconnect();
  active = false;
};
