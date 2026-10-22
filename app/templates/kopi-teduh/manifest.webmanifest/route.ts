import { pwaManifest } from '@lib/pwa';
import { KOPI_TEDUH_PWA } from '@components/Templates/kopi-teduh/pwa';

export const dynamic = 'force-static';

// A route rather than app/manifest.ts, which only works at the site root.
export function GET() {
  return Response.json(pwaManifest(KOPI_TEDUH_PWA), {
    headers: { 'Content-Type': 'application/manifest+json' },
  });
}
