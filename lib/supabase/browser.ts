import { createBrowserClient } from '@supabase/ssr'
import { setSupabaseDown } from '@components/providers/MaintenanceProvider'

// Transient HTTP/2 errors that Chrome retries internally for subresources but
// surfaces through fetch(). Most common: ERR_HTTP2_SERVER_REFUSED_STREAM on
// cold Cloudflare connections.
const TRANSIENT_ERROR_PATTERNS = [
  'ERR_HTTP2_SERVER_REFUSED_STREAM',
  'ERR_HTTP2_PROTOCOL_ERROR',
  'ERR_NETWORK_CHANGED',
  'ERR_QUIC_PROTOCOL_ERROR',
  'ERR_CONNECTION_CLOSED',
  'ERR_CONNECTION_RESET',
  'Failed to fetch',
] as const

function isTransientFetchError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const msg = `${err.name} ${err.message}`
  return TRANSIENT_ERROR_PATTERNS.some((p) => msg.includes(p))
}

async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  maxAttempts = 3,
): Promise<Response> {
  let lastErr: unknown
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fetch(input, init)
    } catch (err) {
      lastErr = err
      if (attempt === maxAttempts || !isTransientFetchError(err)) throw err
      const delay = 150 * 2 ** (attempt - 1) + Math.random() * 100
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  throw lastErr
}

export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: async (input, init) => {
          try {
            const res = await fetchWithRetry(input, init)
            if (res.status === 502 || res.status === 503 || res.status === 504) {
              setSupabaseDown(true)
            }
            return res
          } catch (err) {
            setSupabaseDown(true)
            throw err
          }
        },
      },
    },
  )
}
