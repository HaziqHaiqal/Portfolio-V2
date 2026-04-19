import type { SupabaseClient } from '@supabase/supabase-js'

// A minimally-typed Supabase client (we don't have generated DB types yet,
// but the data layer is fully typed at the return-value boundary).
export type DB = SupabaseClient
