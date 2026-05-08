/**
 * POST /api/twin/feedback
 *
 * ユーザーが insight に feedback を返したときのエンドポイント。
 * ・ feedback を twin_insights に記録
 * ・ threshold / α_app / σ_u への適応更新を applyFeedbackLearning で反映
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { applyFeedbackLearning } from '@/lib/twin-learning';
import { PROJECTORS } from '@/lib/twin-projectors';
import type { AppId } from '@/lib/twin-types';

const FeedbackSchema = z.object({
  insight_id: z.string().uuid(),
  feedback: z.enum(['resonated','misaligned','unsure']),
  note: z.string().max(500).optional(),
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

  let body: z.infer<typeof FeedbackSchema>;
  try {
    body = FeedbackSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: 'invalid_payload', detail: String(err) }, { status: 400 });
  }

  const sb = getServiceClient();

  // 該当 insight がそのユーザーのものか確認
  const { data: insight } = await sb
    .from('twin_insights')
    .select('id, user_id, feedback')
    .eq('id', body.insight_id)
    .maybeSingle();
  if (!insight || insight.user_id !== user.id) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  if (insight.feedback) {
    return NextResponse.json({ error: 'already_submitted' }, { status: 409 });
  }

  // feedback を記録
  await sb.from('twin_insights').update({
    feedback: body.feedback,
    feedback_at: new Date().toISOString(),
    feedback_note: body.note ?? null,
  }).eq('id', body.insight_id);

  // 学習ループを走らせる
  const appDefaults = Object.fromEntries(
    Object.entries(PROJECTORS).map(([k, v]) => [k, v.alpha_default]),
  ) as Record<AppId, number>;

  const result = await applyFeedbackLearning(
    sb, user.id, body.insight_id, body.feedback, appDefaults,
  );

  return NextResponse.json({ ok: true, ...result });
}
