import type { MetadataRoute } from 'next';

export interface PwaOptions {
  name: string;
  shortName: string;
  description: string;
  /** Where the installed app opens, and the path it stays within. */
  scope: string;
  themeColor: string;
  backgroundColor: string;
  /** Square PNGs: 192px and 512px. The 512px one is also used as maskable. */
  icons: { small: string; large: string };
}

/** Web app manifest for `app/manifest.ts`, or a route for sites under a path. */
export function pwaManifest(options: PwaOptions): MetadataRoute.Manifest {
  return {
    name: options.name,
    short_name: options.shortName,
    description: options.description,
    start_url: options.scope,
    scope: options.scope,
    display: 'standalone',
    background_color: options.backgroundColor,
    theme_color: options.themeColor,
    icons: [
      { src: options.icons.small, sizes: '192x192', type: 'image/png' },
      { src: options.icons.large, sizes: '512x512', type: 'image/png' },
      {
        src: options.icons.large,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
