import type { PwaOptions } from '@lib/pwa';
import { BRAND } from './data';

export const PWA_SCOPE = '/templates/kopi-teduh';

export const KOPI_TEDUH_PWA: PwaOptions = {
  name: BRAND,
  shortName: BRAND,
  description: 'Menu, opening hours and pickup orders, one tap away.',
  scope: PWA_SCOPE,
  themeColor: '#0F6E4F',
  backgroundColor: '#F1F6F2',
  icons: {
    small: `${PWA_SCOPE}/pwa-icon/192`,
    large: `${PWA_SCOPE}/pwa-icon/512`,
  },
};

export const PWA_OFFLINE_URL = '/pwa/kopi-teduh-offline.html';
export const PWA_APPLE_ICON = `${PWA_SCOPE}/pwa-icon/180`;
