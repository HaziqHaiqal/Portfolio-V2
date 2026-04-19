import 'server-only'
import { createServerSupabase } from '@lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}

/**
 * Returns a server-side Supabase client scoped to the current admin session,
 * throwing `UnauthorizedError` if the request is unauthenticated. Use at the
 * top of every server action that mutates data.
 */
export async function requireAdminClient(): Promise<SupabaseClient> {
  const db = await createServerSupabase()
  const {
    data: { user },
    error,
  } = await db.auth.getUser()
  if (error || !user) throw new UnauthorizedError()
  return db
}
