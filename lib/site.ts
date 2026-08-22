/**
 * Canonical public origin, used for metadata, sitemap, and robots.
 *
 * Overridable via `NEXT_PUBLIC_SITE_URL` so preview deployments advertise
 * their own origin rather than production's.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://haziqhaiqal.com';
