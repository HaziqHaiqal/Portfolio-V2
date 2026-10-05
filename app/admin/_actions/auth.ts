import 'server-only';
import { createServerSupabase } from '@lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
    this.name = 'UnauthorizedError';
  }
}

/** Throws UnauthorizedError unless an admin is signed in. Call first in every mutating action. */
export async function requireAdminClient(): Promise<SupabaseClient> {
  const db = await createServerSupabase();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) throw new UnauthorizedError();
  return db;
}
