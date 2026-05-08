/**
 * POST /api/twin/atlas
 *
 * SUST v0.3 Phase 2: HSP-8 self-report を受け取り、σ_u を更新する。
 * 軸への寄与とは別ルート。
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { updateSigmaFromHSP } from '@/lib/twin-learning';

const HspSchema = z.object({
  type: z.literal('hsp_score'),
  hspItems: z.array(z.number().min(1).max(7)).length(8),
});

function getServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

async function authenticateUser(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const sb = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

export async function POST(req: NextRequest) {
  const user = await authenticateUser(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: z.infer<typeof HspSchema>;
  try {
    body = HspSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: 'invalid_payload', detail: String(err) }, { status: 400 });
  }

  const sb = getServiceClient();
  const result = await updateSigmaFromHSP(sb, user.id, body.hspItems);
  if (!result) return NextResponse.json({ error: 'invalid_hsp_items' }, { status: 400});

  return NextResponse.json({
    ok: true,
    sigma_before: result.before,
    sigma_after: result.after,
    sigma_self_report: result.sigmaSelf,
    hsp_average: result.avg,
  });
}

export async function GET(req: NextRequest) {
  const user = await authenticateUser(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const sb = getServiceClient();
  const { data } = await sb
    .from('twin_sigma')
    .select('sigma, source, hsp_score, observation_n, updated_at')
    .eq('user_id', user.id).maybeSingle();
  return NextResponse.json({
    sigma: data?.sigma ?? 1.0,
    source: data?.source ?? 'hybrid',
    hsp_score: data?.hsp_score ?? null,
    observation_n: data?.observation_n ?? 0,
    updated_at: data?.updated_at ?? null,
  });
}
