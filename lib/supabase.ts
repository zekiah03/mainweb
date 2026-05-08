import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Public values — safe to inline: anon key is already committed in
// resonance/twin.js; URL is in .env.example. Secrets (service role,
// Anthropic) are server-only and still require Vercel env vars.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  'https://bxewkghaljeucxekwltd.supabase.co'

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZXdrZ2hhbGpldWN4ZWt3bHRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjg0MzIsImV4cCI6MjA5MTk0NDQzMn0.Efo4opmFKm9TFrKamH4Yvg44nIXP8sD9JhH5Rq7KaqM'

let _client: SupabaseClient | null = null

function getBrowserClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return _client
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop: string) {
    const client = getBrowserClient()
    const val = Reflect.get(client, prop)
    return typeof val === 'function' ? val.bind(client) : val
  },
  set(_, prop: string, value: unknown) {
    return Reflect.set(getBrowserClient(), prop, value)
  },
})

export async function getUserId(): Promise<string | null> {
  const { data: { session } } = await getBrowserClient().auth.getSession()
  return session?.user?.id ?? null
}

export function createServerClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? SUPABASE_ANON_KEY
  return createClient(SUPABASE_URL, serviceKey)
}
