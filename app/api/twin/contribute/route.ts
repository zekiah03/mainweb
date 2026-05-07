/**
 * /api/twin/contribute  —  SUST v0.2 Bayesian update endpoint
 *
 * POST: Auth → consent → σ_u → morpho → project → Kalman → persist → hypotheses → insights
 * GET:  /api/twin/profile (morpho + σ)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import { z } from 'zod';
import { PROJECTORS, projectByApp } from '@/lib/twin-projectors';
import {
  AXIS_META,
  AXIS_DIMENSIONS,
  type AxisId,
  type AxisContribution,
  type AppId,
  type ContributeResponse,
  type MorphoProfile,
  type AxisDistribution,
  type HypothesisId,
} from '@/lib/twin-types';

// ============================================================
//  Validation
// ============================================================

const ContributeSchema = z.object({
  appId: z.enum([
    'resonance','feelings','how-feelings-work','valuse',
    'pazst','minus','gap','evolve',
  ]),
  data: z.record(z.unknown()),
  client_ts: z.string().datetime().optional(),
});

// ============================================================
//  Supabase helpers
// ============================================================

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

// ============================================================
//  Morpho load / init
// ============================================================

async function getMorpho(sb: ReturnType<typeof getServiceClient>, userId: string): Promise<MorphoProfile> {
  const { data: rows } = await sb
    .from('twin_morpho_axis')
    .select('axis,mu,variance,last_updated,observation_count')
    .eq('user_id', userId);

  const morpho = {} as MorphoProfile;
  for (const axisId of Object.keys(AXIS_META) as AxisId[]) {
    const meta = AXIS_META[axisId];
    const found = rows?.find((r) => r.axis === axisId);
    morpho[axisId] = found
      ? { mu: found.mu as number[], variance: found.variance as number[], lastUpdated: found.last_updated, observationCount: found.observation_count }
      : { mu: new Array(meta.dim).fill(50), variance: new Array(meta.dim).fill(2500), lastUpdated: new Date().toISOString(), observationCount: 0 };
  }
  return morpho;
}

async function getSigma(sb: ReturnType<typeof getServiceClient>, userId: string): Promise<number> {
  const { data } = await sb.from('twin_sigma').select('sigma').eq('user_id', userId).maybeSingle();
  if (data?.sigma) return Number(data.sigma);
  await sb.from('twin_sigma').insert({ user_id: userId, sigma: 1.0, source: 'hybrid', observation_n: 0 });
  return 1.0;
}

async function getConsent(sb: ReturnType<typeof getServiceClient>, userId: string): Promise<'L0'|'L1'|'L2'|'L3'> {
  const { data } = await sb.from('twin_consent').select('level').eq('user_id', userId).maybeSingle();
  if (data?.level) return data.level as 'L0'|'L1'|'L2'|'L3';
  await sb.from('twin_consent').insert({ user_id: userId, level: 'L1' });
  return 'L1';
}

// ============================================================
//  Bayesian (Kalman) update
// ============================================================

function bayesianUpdate(
  prior: AxisDistribution,
  contributions: AxisContribution[],
  axisId: AxisId,
): AxisDistribution {
  const dims = AXIS_DIMENSIONS[axisId];
  const mu = [...prior.mu];
  const variance = [...prior.variance];

  for (const c of contributions) {
    const idx = dims.indexOf(c.dimension);
    if (idx < 0) continue;
    const obsMu  = mu[idx] + c.delta_mu;
    const obsVar = c.delta_variance;
    const invSum = 1 / variance[idx] + 1 / obsVar;
    mu[idx]       = Math.max(0, Math.min(100, (mu[idx] / variance[idx] + obsMu / obsVar) / invSum));
    variance[idx] = Math.max(1, 1 / invSum);
  }

  return { mu, variance, lastUpdated: new Date().toISOString(), observationCount: prior.observationCount + 1 };
}

async function persistAxis(
  sb: ReturnType<typeof getServiceClient>,
  userId: string,
  axisId: AxisId,
  dist: AxisDistribution,
) {
  await sb.from('twin_morpho_axis').upsert({
    user_id: userId, axis: axisId,
    mu: dist.mu, variance: dist.variance,
    last_updated: dist.lastUpdated, observation_count: dist.observationCount,
  }, { onConflict: 'user_id,axis' });
}

// ============================================================
//  Hypothesis evaluation
// ============================================================

interface HypothesisDef {
  id: HypothesisId;
  axes: AxisId[];
  evaluate: (m: MorphoProfile) => number;
  threshold: number;
}

function getDim(m: MorphoProfile, axis: AxisId, dim: string): number {
  const idx = AXIS_DIMENSIONS[axis].indexOf(dim);
  return idx >= 0 ? m[axis].mu[idx] : 50;
}

const HYPOTHESES: HypothesisDef[] = [
  {
    id: 'SUST-1', axes: ['D','A'], threshold: 0.6,
    evaluate: (m) => {
      const loveNeed = getDim(m,'D','love');
      const earlyAff = getDim(m,'A','age_0_5_family');
      if (loveNeed < 30 && earlyAff < 30) return 1 - (loveNeed + earlyAff) / 60;
      return 0;
    },
  },
  {
    id: 'SUST-2', axes: ['J'], threshold: 0.6,
    evaluate: (m) => {
      const sup = getDim(m,'J','suppression'); const exp = getDim(m,'J','explosiveness');
      return (sup > 70 && exp > 70) ? Math.min(sup, exp) / 100 : 0;
    },
  },
  {
    id: 'SUST-3', axes: ['E','F'], threshold: 0.6,
    evaluate: (m) => {
      const a1 = 1 - Math.abs(getDim(m,'E','cat_moral')  - getDim(m,'F','domain_values'))      / 100;
      const a2 = 1 - Math.abs(getDim(m,'E','cat_social') - getDim(m,'F','domain_relationship')) / 100;
      return (a1 + a2) / 2;
    },
  },
  {
    id: 'SUST-6', axes: ['K','D'], threshold: 0.6,
    evaluate: (m) => {
      const family = getDim(m,'K','rel_family'); const love = getDim(m,'D','love');
      return (family < 40 && love > 60) ? ((40 - family) + (love - 60)) / 80 : 0;
    },
  },
  {
    id: 'SUST-10', axes: ['F','D'], threshold: 0.6,
    evaluate: (m) => {
      const pairs: Array<[string,string]> = [
        ['domain_relationship','love'],['domain_time','freedom'],
        ['domain_values','trust'],['domain_work','achievement'],
      ];
      const sims = pairs.map(([f,d]) => 1 - Math.abs(getDim(m,'F',f) - getDim(m,'D',d)) / 100);
      return sims.reduce((a,b) => a+b, 0) / sims.length;
    },
  },
];

async function evaluateHypotheses(
  sb: ReturnType<typeof getServiceClient>,
  userId: string,
  morpho: MorphoProfile,
  axesUpdated: Set<AxisId>,
): Promise<HypothesisId[]> {
  const fired: HypothesisId[] = [];
  for (const h of HYPOTHESES) {
    if (!h.axes.some((a) => axesUpdated.has(a))) continue;
    const score = Math.max(0, Math.min(1, h.evaluate(morpho)));
    const isFired = score >= h.threshold;
    await sb.from('twin_hypotheses').upsert({
      user_id: userId, hypothesis: h.id, score, threshold: h.threshold,
      fired: isFired, evidence_axes: h.axes,
      evidence_summary: { score, axes: h.axes }, last_evaluated: new Date().toISOString(),
    }, { onConflict: 'user_id,hypothesis' });
    if (isFired) fired.push(h.id);
  }
  return fired;
}

// ============================================================
//  Insight trigger
// ============================================================

async function triggerInsights(
  sb: ReturnType<typeof getServiceClient>,
  userId: string,
  fired: HypothesisId[],
  morpho: MorphoProfile,
): Promise<number> {
  if (fired.length === 0) return 0;

  const { data: recent } = await sb
    .from('twin_insights').select('hypothesis_id')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString())
    .in('hypothesis_id', fired);

  const recentIds = new Set((recent ?? []).map((r: { hypothesis_id: string }) => r.hypothesis_id));
  const toGenerate = fired.filter((id) => !recentIds.has(id));

  const lowVarConf = (axes: AxisId[]) => {
    const avgVar = axes.map((a) => morpho[a].variance.reduce((s,v) => s+v, 0) / morpho[a].variance.length)
      .reduce((a,b) => a+b, 0) / axes.length;
    return Math.max(0, Math.min(1, 1 - avgVar / 2500));
  };

  const CARDS: Partial<Record<HypothesisId, { type: string; axes: AxisId[]; title: string; body: string; actions: unknown[] }>> = {
    'SUST-1':  { type:'pattern',     axes:['A','D'], title:'過去の不足を取り戻しているように見える', body:'幼少期の感情環境が厳しめだった一方で、いまは感情ニーズが落ち着いているようです。後年の経験で安全感を獲得した「 earned secure 」のパターンに見えます。', actions:[{kind:'reflect',label:'いまの安心の源を書き出す'},{kind:'open_app',app:'feelings',label:'feelings で背景を見直す'}] },
    'SUST-2':  { type:'caution',     axes:['J'],     title:'抑制と爆発が両極化しているかも', body:'感情を抑える傾向と瞬発的に出る傾向が同時に高まっています。表現の窓が狭くなると、押し込めた感情が突発的に噴き出すサイクルに入りやすくなります。', actions:[{kind:'reflect',label:'直近 1 週間のイラつきを 3 行で書く'}] },
    'SUST-3':  { type:'observation', axes:['E','F'], title:'価値観と境界線が整合しています', body:'大切にしている価値領域と、侵されたくない境界領域がよく一致しています。「自分が大事にしているものをちゃんと守れている」状態の指標です。', actions:[{kind:'feedback',label:'これは自分らしい？'}] },
    'SUST-6':  { type:'invitation',  axes:['K','D'], title:'家族関係で感情のやり取りが滞っているかも', body:'家族との関係での開放度が低めで、同時に感情ニーズの渇望が高めです。家族の中で「言えていないこと」が積もっている可能性があります。', actions:[{kind:'open_app',app:'gap',label:'gap で家族との場面を記録'}] },
    'SUST-10': { type:'pattern',     axes:['F','D'], title:'境界とニーズが同期しています', body:'守りたい領域と必要としているものがきれいに対応しています。自己理解の整合度が高い状態です。', actions:[{kind:'feedback',label:'これはしっくり来る？'}] },
  };

  let count = 0;
  for (const hid of toGenerate) {
    const card = CARDS[hid];
    if (!card) continue;
    const confidence = lowVarConf(card.axes);
    await sb.from('twin_insights').insert({
      user_id: userId, type: card.type, trigger: 'hypothesis_fired',
      axes_referenced: card.axes, hypothesis_id: hid, confidence,
      title: card.title, body: card.body, actions: card.actions,
    });
    count++;
  }
  return count;
}

// ============================================================
//  POST handler
// ============================================================

export async function POST(req: NextRequest) {
  const user = await authenticateUser(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: z.infer<typeof ContributeSchema>;
  try {
    body = ContributeSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: 'invalid_payload', detail: String(err) }, { status: 400 });
  }

  const sb = getServiceClient();
  const consent = await getConsent(sb, user.id);
  const sigma   = await getSigma(sb, user.id);
  const morpho  = await getMorpho(sb, user.id);

  const alpha = PROJECTORS[body.appId].alpha_default;
  const contributions = projectByApp(body.appId, body.data, {
    sigma_u: sigma, alpha_app: alpha, current_morpho: morpho,
  });

  const axesUpdated = new Set<AxisId>();
  const grouped: Record<string, AxisContribution[]> = {};
  for (const c of contributions) {
    (grouped[c.axis] ??= []).push(c);
    axesUpdated.add(c.axis);
  }

  const updatedDists: Array<{ axis: AxisId; dist: AxisDistribution }> = [];
  for (const axisId of Array.from(axesUpdated)) {
    const updated = bayesianUpdate(morpho[axisId], grouped[axisId], axisId);
    morpho[axisId] = updated;
    updatedDists.push({ axis: axisId, dist: updated });
  }

  const contribId = crypto.randomUUID();
  await sb.from('twin_contributions').insert({
    id: contribId, user_id: user.id, app: body.appId,
    payload: body.data as AppId, payload_hash: crypto.createHash('sha256').update(JSON.stringify(body.data)).digest('hex'),
    axis_contributions: contributions, alpha_app: alpha, sigma_u: sigma,
    client_ts: body.client_ts ?? null,
  });

  for (const { axis, dist } of updatedDists) {
    await persistAxis(sb, user.id, axis, dist);
  }

  let triggeredCount = 0;
  if (consent !== 'L0') {
    const fired = await evaluateHypotheses(sb, user.id, morpho, axesUpdated);
    triggeredCount = await triggerInsights(sb, user.id, fired, morpho);
  }

  const response: ContributeResponse = {
    ok: true, contribution_id: contribId,
    axes_updated: Array.from(axesUpdated), triggered_insights: triggeredCount,
  };
  return NextResponse.json(response);
}

// ============================================================
//  GET  /api/twin/profile
// ============================================================

export async function GET(req: NextRequest) {
  const user = await authenticateUser(req);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const sb = getServiceClient();
  return NextResponse.json({
    morpho: await getMorpho(sb, user.id),
    sigma: await getSigma(sb, user.id),
    version: '0.2',
    updated_at: new Date().toISOString(),
  });
}
