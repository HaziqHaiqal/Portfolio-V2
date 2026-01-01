import { createBrowserClient } from '@supabase/ssr'
import { setSupabaseDown } from '@components/providers/MaintenanceProvider'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: async (input, init) => {
          try {
            const res = await fetch(input, init)
            // Detect 502/503/504 = Supabase down
            if (res.status === 502 || res.status === 503 || res.status === 504) {
              setSupabaseDown(true)
            }
            return res
          } catch (err) {
            // Network error = also down
            setSupabaseDown(true)
            throw err
          }
        },
      },
    }
  )
}
