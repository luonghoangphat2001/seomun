'use client';

import { useEffect, useRef } from 'react';
import * as ChannelService from '@channel.io/channel-web-sdk-loader';
import { CHANNEL_TALK_PLUGIN_KEY } from '@/constants/common';
import { usePathname } from 'next/navigation';

const ChannelTalk = () => {
  const pathname = usePathname();
  const shouldHideChannelButton = pathname.includes('/web-editor');
  const shouldHideChannelButtonRef = useRef(shouldHideChannelButton);

  useEffect(() => {
    if (!CHANNEL_TALK_PLUGIN_KEY) return;

    ChannelService.loadScript();

    ChannelService.boot(
      {
        pluginKey: CHANNEL_TALK_PLUGIN_KEY,
      },
      () => {
        if (shouldHideChannelButtonRef.current) {
          ChannelService.hideChannelButton();
        }
      },
    );
  }, []);

  useEffect(() => {
    if (!CHANNEL_TALK_PLUGIN_KEY) return;

    shouldHideChannelButtonRef.current = shouldHideChannelButton;

    if (shouldHideChannelButton) {
      ChannelService.hideChannelButton();
      return;
    }

    ChannelService.showChannelButton();
  }, [shouldHideChannelButton]);

  return null;
};

export default ChannelTalk;
