import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — never instantiated at module load time so that
// Next.js static analysis of API routes works without env vars.
let _client: SupabaseClient | null = null

function getBrowserClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}

// Backward-compatible named export — all existing `supabase.auth.*` and
// `supabase.from(...)` calls continue to work; the real client is created
// only when a method is first accessed at runtime.
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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? anonKey
  return createClient(url, serviceKey)
}
