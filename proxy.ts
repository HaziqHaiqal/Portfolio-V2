import type { NextRequest } from 'next/server';
import { updateSession } from '@lib/supabase/middleware';

export default async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Only the authenticated surface needs a session. Running this on every
  // public request cost a Supabase `getUser()` roundtrip per page view for a
  // result nothing read — the redirect below only ever applies to /admin.
  // `/login` stays matched so tokens refresh right after sign-in.
  matcher: ['/admin/:path*', '/login'],
};
