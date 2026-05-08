/**
 * Solnova Digital Twin — Learning Foundation (SUST v0.3 Phase 1)
 *
 * feedback → σ_u / threshold / α_app への反映ループ。
 *
 * 設計原則:
 *   ・ すべての更新は緊やか (ҷ=0.02 以下)
 *   ・ resonate / misalign / unsure カウントを累積してビータ事後として扱う
 *   ・ 万一のバグでも暴走しないよう [0.2, 0.95] に clip
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppId, HypothesisId, InsightFeedback } from '@/lib/twin-types';

// ============================================================
//  チューニングパラメータ
// ============================================================

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

// ============================================================
//  ユーザー別 threshold 取得 (デフォルトフォールバック)
// ============================================================

export async function getUserThresholds(
  sb: SupabaseClient,
  userId: string,
): Promise<Partial<Record<HypothesisId, number>>> {
  const { data } = await sb
    .from('twin_user_thresholds')
    .select('hypothesis, threshold')
    .eq('user_id', userId);
  const out: Partial<Record<HypothesisId, number>> = {};
  for (const row of data ?? []) {
    out[row.hypothesis as HypothesisId] = Number(row.threshold);
  }
  return out;
}

// ============================================================
//  ユーザー別 α_app 取得 (デフォルトフォールバック)
// ============================================================

export async function getUserAlpha(
  sb: SupabaseClient,
  userId: string,
  app: AppId,
  defaultAlpha: number,
): Promise<number> {
  const { data } = await sb
    .from('twin_user_alpha')
    .select('alpha')
    .eq('user_id', userId)
    .eq('app', app)
    .maybeSingle();
  if (data?.alpha) return Number(data.alpha);
  return defaultAlpha;
}

// ============================================================
//  threshold 適応更新
// ============================================================

export async function updateThreshold(
  sb: SupabaseClient,
  userId: string,
  hypothesis: HypothesisId,
  feedback: InsightFeedback,
): Promise<void> {
  const { data: row } = await sb
    .from('twin_user_thresholds')
    .select('threshold, resonate_count, misalign_count, unsure_count')
    .eq('user_id', userId)
    .eq('hypothesis', hypothesis)
    .maybeSingle();

  const current = Number(row?.threshold ?? THRESHOLD_DEFAULT);
  const rc = (row?.resonate_count ?? 0) + (feedback === 'resonated' ? 1 : 0);
  const mc = (row?.misalign_count ?? 0) + (feedback === 'misaligned' ? 1 : 0);
  const uc = (row?.unsure_count   ?? 0) + (feedback === 'unsure'    ? 1 : 0);

  // resonate された → もっと発火しやすく (threshold を下げる)
  // misalign された → 発火しにくく (threshold を上げる)
  // unsure   → 動かさない
  let next = current;
  if (feedback === 'resonated') next = current - THRESHOLD_LR;
  if (feedback === 'misaligned') next = current + THRESHOLD_LR;
  next = Math.max(THRESHOLD_MIN, Math.min(THRESHOLD_MAX, next));

  await sb.from('twin_user_thresholds').upsert({
    user_id: userId,
    hypothesis,
    threshold: next,
    resonate_count: rc,
    misalign_count: mc,
    unsure_count: uc,
    last_updated: new Date().toISOString(),
  }, { onConflict: 'user_id,hypothesis' });
}

// ============================================================
//  α_app 適応更新
//  該当 insight の軸を動かしたアプリを逆引きして調整
// ============================================================

export async function updateAlphaFromInsight(
  sb: SupabaseClient,
  userId: string,
  insightId: string,
  feedback: InsightFeedback,
  appDefaults: Record<AppId, number>,
): Promise<AppId[]> {
  // 該当 insight の軸を取得
  const { data: insight } = await sb
    .from('twin_insights')
    .select('axes_referenced, created_at')
    .eq('id', insightId)
    .maybeSingle();
  if (!insight) return [];

  const axes = (insight.axes_referenced ?? []) as string[];
  const since = new Date(new Date(insight.created_at).getTime() - 30 * 24 * 3600 * 1000).toISOString();

  // その insight 生成前 30 日間で、関連軸に寄与したアプリを集計
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

  const updated: AppId[] = [];
  const factor = feedback === 'resonated' ? ALPHA_BOOST
               : feedback === 'misaligned' ? ALPHA_DECAY
               : 1.0;
  if (factor === 1.0) return [];

  for (const [app, weight] of appWeights.entries()) {
    void weight; // 現在は weight で重み付けせず一律調整
    const { data: row } = await sb
      .from('twin_user_alpha')
      .select('alpha, resonate_count, misalign_count')
      .eq('user_id', userId).eq('app', app).maybeSingle();
    const current = Number(row?.alpha ?? appDefaults[app] ?? 0.5);
    const next = Math.max(ALPHA_MIN, Math.min(ALPHA_MAX, current * factor));
    await sb.from('twin_user_alpha').upsert({
      user_id: userId, app,
      alpha: next,
      resonate_count: (row?.resonate_count ?? 0) + (feedback === 'resonated'  ? 1 : 0),
      misalign_count: (row?.misalign_count ?? 0) + (feedback === 'misaligned' ? 1 : 0),
      last_updated: new Date().toISOString(),
    }, { onConflict: 'user_id,app' });
    updated.push(app);
  }
  return updated;
}

// ============================================================
//  σ_u 適応更新 (feedback observation 経由)
//
//  Layer III 仮説 (感情軸中心) で misalign が多い → σ_u を 1.0 側に引き戻す
//  逆に resonate が多い → 現在の推定を補強
// ============================================================

const LAYER_III_AXES = new Set(['G','H','I']);

export async function updateSigmaFromFeedback(
  sb: SupabaseClient,
  userId: string,
  insightId: string,
  feedback: InsightFeedback,
): Promise<{ before: number; after: number } | null> {
  if (feedback === 'unsure') return null;

  const { data: insight } = await sb
    .from('twin_insights')
    .select('axes_referenced')
    .eq('id', insightId).maybeSingle();
  if (!insight) return null;
  const axes = (insight.axes_referenced ?? []) as string[];
  const layerIIIHit = axes.some((a) => LAYER_III_AXES.has(a));

  // 現在の σ_u
  const { data: srow } = await sb
    .from('twin_sigma').select('sigma, observation_n')
    .eq('user_id', userId).maybeSingle();
  const before = Number(srow?.sigma ?? 1.0);

  let after = before;
  if (layerIIIHit) {
    if (feedback === 'misaligned') {
      // 現状の σ 推定が過創の可能性 → 1.0 に引き戻す
      after = before + (1.0 - before) * SIGMA_LR * 5;
    } else if (feedback === 'resonated') {
      // 現状の σ 推定が妥当 → そのまま (わずかに補強)
      // 増幅はもとからの偶差を拡大する方向
      const drift = before - 1.0;
      after = before + drift * SIGMA_LR;
    }
  } else {
    // Layer III 以外は σ_u を規制しない (現状維持)
    return null;
  }

  after = Math.max(SIGMA_MIN, Math.min(SIGMA_MAX, after));
  if (Math.abs(after - before) < 1e-4) return null;

  await sb.from('twin_sigma').upsert({
    user_id: userId,
    sigma: after,
    source: 'observation',
    observation_n: (srow?.observation_n ?? 0) + 1,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  await sb.from('twin_sigma_history').insert({
    user_id: userId,
    sigma_before: before,
    sigma_after: after,
    source: 'feedback',
    n_signals: 1,
    note: `insight=${insightId} feedback=${feedback}`,
  });

  return { before, after };
}

// ============================================================
//  エントリポイント: 一括適用
// ============================================================

export interface FeedbackLearningResult {
  thresholdUpdated: boolean;
  alphaUpdatedFor: AppId[];
  sigmaChange: { before: number; after: number } | null;
}

export async function applyFeedbackLearning(
  sb: SupabaseClient,
  userId: string,
  insightId: string,
  feedback: InsightFeedback,
  appDefaults: Record<AppId, number>,
): Promise<FeedbackLearningResult> {
  const { data: insight } = await sb
    .from('twin_insights')
    .select('hypothesis_id')
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
