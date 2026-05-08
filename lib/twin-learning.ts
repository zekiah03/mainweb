/**
 * Solnova Digital Twin — Learning Foundation (SUST v0.3)
 *
 * Phase 1: feedback → σ_u / threshold / α_app
 * Phase 2: HSP-8 self-report → σ_u (Bayesian blend)
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppId, HypothesisId, InsightFeedback } from '@/lib/twin-types';

// チューニング
const THRESHOLD_DEFAULT = 0.6;
const THRESHOLD_MIN = 0.3;
const THRESHOLD_MAX = 0.9;
const THRESHOLD_LR  = 0.02;

const ALPHA_MIN = 0.05;
const ALPHA_MAX = 0.95;
const ALPHA_BOOST = 1.05;
const ALPHA_DECAY = 0.95;

const SIGMA_MIN = 0.7;
const SIGMA_MAX = 1.4;
const SIGMA_LR  = 0.01;

// HSP-8 スコアの重み (自己評価は観測 n 個分の重みとして代入)
const HSP_PRIOR_WEIGHT = 5;

// ============================================================
//  ユーザー別 threshold / α_app 取得
// ============================================================

export async function getUserThresholds(
  sb: SupabaseClient, userId: string,
): Promise<Partial<Record<HypothesisId, number>>> {
  const { data } = await sb
    .from('twin_user_thresholds').select('hypothesis, threshold')
    .eq('user_id', userId);
  const out: Partial<Record<HypothesisId, number>> = {};
  for (const row of data ?? []) {
    out[row.hypothesis as HypothesisId] = Number(row.threshold);
  }
  return out;
}

export async function getUserAlpha(
  sb: SupabaseClient, userId: string, app: AppId, defaultAlpha: number,
): Promise<number> {
  const { data } = await sb
    .from('twin_user_alpha').select('alpha')
    .eq('user_id', userId).eq('app', app).maybeSingle();
  if (data?.alpha) return Number(data.alpha);
  return defaultAlpha;
}

// ============================================================
//  threshold 適応更新
// ============================================================

export async function updateThreshold(
  sb: SupabaseClient, userId: string, hypothesis: HypothesisId, feedback: InsightFeedback,
): Promise<void> {
  const { data: row } = await sb
    .from('twin_user_thresholds')
    .select('threshold, resonate_count, misalign_count, unsure_count')
    .eq('user_id', userId).eq('hypothesis', hypothesis).maybeSingle();

  const current = Number(row?.threshold ?? THRESHOLD_DEFAULT);
  const rc = (row?.resonate_count ?? 0) + (feedback === 'resonated' ? 1 : 0);
  const mc = (row?.misalign_count ?? 0) + (feedback === 'misaligned' ? 1 : 0);
  const uc = (row?.unsure_count   ?? 0) + (feedback === 'unsure'    ? 1 : 0);

  let next = current;
  if (feedback === 'resonated') next = current - THRESHOLD_LR;
  if (feedback === 'misaligned') next = current + THRESHOLD_LR;
  next = Math.max(THRESHOLD_MIN, Math.min(THRESHOLD_MAX, next));

  await sb.from('twin_user_thresholds').upsert({
    user_id: userId, hypothesis, threshold: next,
    resonate_count: rc, misalign_count: mc, unsure_count: uc,
    last_updated: new Date().toISOString(),
  }, { onConflict: 'user_id,hypothesis' });
}

// ============================================================
//  α_app 適応更新
// ============================================================

export async function updateAlphaFromInsight(
  sb: SupabaseClient, userId: string, insightId: string,
  feedback: InsightFeedback, appDefaults: Record<AppId, number>,
): Promise<AppId[]> {
  const { data: insight } = await sb
    .from('twin_insights')
    .select('axes_referenced, created_at')
    .eq('id', insightId).maybeSingle();
  if (!insight) return [];

  const axes = (insight.axes_referenced ?? []) as string[];
  const since = new Date(new Date(insight.created_at).getTime() - 30 * 24 * 3600 * 1000).toISOString();

  const { data: contribs } = await sb
    .from('twin_contributions')
    .select('app, axis_contributions')
    .eq('user_id', userId)
    .gte('server_ts', since)
    .lte('server_ts', insight.created_at);

  const appWeights = new Map<AppId, number>();
  for (const c of contribs ?? []) {
    const list = (c.axis_contributions ?? []) as Array<{ axis: string; weight: number }>;
    let w = 0;
    for (const ac of list) {
      if (axes.includes(ac.axis)) w += Number(ac.weight ?? 0);
    }
    if (w > 0) {
      const app = c.app as AppId;
      appWeights.set(app, (appWeights.get(app) ?? 0) + w);
    }
  }

  if (appWeights.size === 0) return [];
  const factor = feedback === 'resonated' ? ALPHA_BOOST
               : feedback === 'misaligned' ? ALPHA_DECAY
               : 1.0;
  if (factor === 1.0) return [];

  const updated: AppId[] = [];
  for (const [app] of appWeights.entries()) {
    const { data: row } = await sb
      .from('twin_user_alpha')
      .select('alpha, resonate_count, misalign_count')
      .eq('user_id', userId).eq('app', app).maybeSingle();
    const current = Number(row?.alpha ?? appDefaults[app] ?? 0.5);
    const next = Math.max(ALPHA_MIN, Math.min(ALPHA_MAX, current * factor));
    await sb.from('twin_user_alpha').upsert({
      user_id: userId, app, alpha: next,
      resonate_count: (row?.resonate_count ?? 0) + (feedback === 'resonated'  ? 1 : 0),
      misalign_count: (row?.misalign_count ?? 0) + (feedback === 'misaligned' ? 1 : 0),
      last_updated: new Date().toISOString(),
    }, { onConflict: 'user_id,app' });
    updated.push(app);
  }
  return updated;
}

// ============================================================
//  σ_u 適応更新 (feedback 経由)
// ============================================================

const LAYER_III_AXES = new Set(['G','H','I']);

export async function updateSigmaFromFeedback(
  sb: SupabaseClient, userId: string, insightId: string, feedback: InsightFeedback,
): Promise<{ before: number; after: number } | null> {
  if (feedback === 'unsure') return null;

  const { data: insight } = await sb
    .from('twin_insights').select('axes_referenced')
    .eq('id', insightId).maybeSingle();
  if (!insight) return null;
  const axes = (insight.axes_referenced ?? []) as string[];
  const layerIIIHit = axes.some((a) => LAYER_III_AXES.has(a));
  if (!layerIIIHit) return null;

  const { data: srow } = await sb
    .from('twin_sigma').select('sigma, observation_n')
    .eq('user_id', userId).maybeSingle();
  const before = Number(srow?.sigma ?? 1.0);

  let after = before;
  if (feedback === 'misaligned') {
    after = before + (1.0 - before) * SIGMA_LR * 5;
  } else if (feedback === 'resonated') {
    const drift = before - 1.0;
    after = before + drift * SIGMA_LR;
  }

  after = Math.max(SIGMA_MIN, Math.min(SIGMA_MAX, after));
  if (Math.abs(after - before) < 1e-4) return null;

  await sb.from('twin_sigma').upsert({
    user_id: userId, sigma: after,
    source: 'observation',
    observation_n: (srow?.observation_n ?? 0) + 1,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  await sb.from('twin_sigma_history').insert({
    user_id: userId, sigma_before: before, sigma_after: after,
    source: 'feedback', n_signals: 1,
    note: `insight=${insightId} feedback=${feedback}`,
  });

  return { before, after };
}

// ============================================================
//  σ_u 適応更新 (HSP-8 self-report 経由) — Phase 2
//
//  HSP-8 は Aron の高感受性スケールを 8 項目に縮めたもの (1〓7 likert)
//  平均 1 → σ=0.7 / 平均 4 → σ=1.0 / 平均 7 → σ=1.4
// ============================================================

export async function updateSigmaFromHSP(
  sb: SupabaseClient, userId: string, items: number[],
): Promise<{ before: number; after: number; sigmaSelf: number; avg: number } | null> {
  if (!Array.isArray(items) || items.length !== 8) return null;
  if (items.some((v) => typeof v !== 'number' || v < 1 || v > 7)) return null;

  const avg = items.reduce((a, b) => a + b, 0) / items.length;
  // 線形写像 [1, 7] → [0.7, 1.4]
  const sigmaSelf = 0.7 + ((avg - 1) / 6) * 0.7;

  const { data: srow } = await sb
    .from('twin_sigma').select('sigma, observation_n')
    .eq('user_id', userId).maybeSingle();
  const before = Number(srow?.sigma ?? 1.0);
  const n_obs = Number(srow?.observation_n ?? 0);

  // Bayesian blend: HSP 自己評価は観測 n 個分の重み
  const after = (sigmaSelf * HSP_PRIOR_WEIGHT + before * n_obs) / (HSP_PRIOR_WEIGHT + n_obs);
  const clipped = Math.max(SIGMA_MIN, Math.min(SIGMA_MAX, after));

  await sb.from('twin_sigma').upsert({
    user_id: userId, sigma: clipped,
    source: 'self_report', hsp_score: avg,
    observation_n: n_obs,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  await sb.from('twin_sigma_history').insert({
    user_id: userId, sigma_before: before, sigma_after: clipped,
    source: 'self_report', n_signals: 8,
    note: `HSP-8 avg=${avg.toFixed(2)}`,
  });

  return { before, after: clipped, sigmaSelf, avg };
}

// ============================================================
//  エントリポイント
// ============================================================

export interface FeedbackLearningResult {
  thresholdUpdated: boolean;
  alphaUpdatedFor: AppId[];
  sigmaChange: { before: number; after: number } | null;
}

export async function applyFeedbackLearning(
  sb: SupabaseClient, userId: string, insightId: string,
  feedback: InsightFeedback, appDefaults: Record<AppId, number>,
): Promise<FeedbackLearningResult> {
  const { data: insight } = await sb
    .from('twin_insights').select('hypothesis_id')
    .eq('id', insightId).maybeSingle();

  let thresholdUpdated = false;
  if (insight?.hypothesis_id) {
    await updateThreshold(sb, userId, insight.hypothesis_id as HypothesisId, feedback);
    thresholdUpdated = true;
  }

  const alphaUpdatedFor = await updateAlphaFromInsight(sb, userId, insightId, feedback, appDefaults);
  const sigmaChange = await updateSigmaFromFeedback(sb, userId, insightId, feedback);

  return { thresholdUpdated, alphaUpdatedFor, sigmaChange };
}
