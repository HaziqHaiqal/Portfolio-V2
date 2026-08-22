import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { DB } from '@lib/data/types';

/**
 * Cookieless anon-key client for reading public portfolio data.
 *
 * `createServerSupabase` binds to the request's cookies, which makes any route
 * that touches it dynamic and makes it illegal inside a cache scope —
 * `unstable_cache` forbids reading `cookies()`/`headers()`. This client reads
 * the same anon-level (RLS-governed) data without a request context, so its
 * results can be cached and shared across visitors.
 *
 * Use it for public reads only. Anything that depends on the signed-in user
 * must keep using `createServerSupabase`.
 */
export function createPublicSupabase(): DB {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).'
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
