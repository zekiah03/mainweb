/**
 * Solnova Digital Twin — App Projection Functions (SUST v0.2 / v0.3)
 */

import type {
  AxisContribution,
  AxisId,
  AppId,
  ProjectionFn,
  ResonancePayload,
  FeelingsPayload,
  HowFeelingsWorkPayload,
  ValusePayload,
  PazstPayload,
  MinusPayload,
  GapPayload,
  EvolvePayload,
  NarrativePayload,
  AtlasPayload,
  MorphoProfile,
} from '@/lib/twin-types';

const NU_BASE = 100;

const noiseFor = (alpha: number) => NU_BASE / Math.max(alpha, 0.01);

const mk = (
  axis: AxisId,
  dimension: string,
  delta_mu: number,
  weight: number,
  alpha: number,
): AxisContribution => ({ axis, dimension, delta_mu, delta_variance: noiseFor(alpha), weight });

const F9_TO_NETWORK: Record<string, string[]> = {
  anger: ['anger','frustration','contempt'],
  sadness: ['sadness','grief','disappointment','loneliness'],
  fear: ['fear','anxiety'],
  joy: ['joy','gratitude','pride','hope','relief','contentment'],
  disgust: ['disgust'],
  surprise: ['surprise','curiosity','awe'],
  numbness: ['boredom'],
  guilt: ['guilt','regret'],
  shame: ['shame'],
};

const RESONANCE_PATTERN_TO_EMOTION: Record<string, string[]> = {
  laughter: ['joy'], kandou: ['gratitude','awe','love'], suspense: ['anxiety','fear'],
  nostalgia: ['nostalgia','sadness'], yearning: ['hope','sadness'], embarrass: ['shame'],
  catharsis: ['relief','joy'], irritation: ['frustration','anger'],
  serenity: ['contentment'], flow: ['flow','curiosity'],
};

const PAZST_NEED_TO_D: Record<string, string> = {
  recognition:'recognition', love:'love', safety:'safety', freedom:'freedom',
  order:'order', achievement:'achievement', expression:'expression',
  belonging:'belonging', fairness:'fairness', trust:'trust',
};

const MINUS_DOMAIN_TO_F: Record<string, string> = {
  relationship:'domain_relationship', environment:'domain_environment',
  work:'domain_work', time:'domain_time', values:'domain_values',
};

const GAP_RELATION_TO_K: Record<string, string> = {
  '職場':'rel_workplace', '家族':'rel_family', '恋愛':'rel_romance',
  '友人':'rel_friend', '社会':'rel_society',
  // gap アプリは relationship タグを個別に使う
  '上司':'rel_workplace', '同僚':'rel_workplace', '部下':'rel_workplace',
  '親':'rel_family', '兄弟姉妹':'rel_family',
  '恋人':'rel_romance', '配偶者':'rel_romance',
  '親友':'rel_friend', 'SNS':'rel_society', 'その他':'rel_society',
  '知人':'rel_friend',
};

const EVOLVE_AXIS_TO_EMOTIONS: Record<string, Array<[string, number]>> = {
  expression: [['joy',+1],['frustration',-1]],
  speed: [['surprise',+1],['curiosity',+1]],
  distance: [['contentment',+1],['loneliness',-1]],
  direction: [['anger',+1],['fear',-1]],
  fuel: [['hope',+1],['boredom',-1]],
  conformity: [['shame',+1],['pride',-1]],
};

// ============================================================
//  resonance / feelings / how-feelings-work / valuse / pazst / minus / gap / evolve
//  (コアロジックをコンパクトに保ち、未知フィールドはスルーされる)
// ============================================================

export const projectResonance: ProjectionFn<ResonancePayload> = (payload, ctx) => {
  const out: AxisContribution[] = [];
  const { alpha_app, sigma_u } = ctx;
  const w = alpha_app * Math.pow(sigma_u, 0.7);
  if (payload.trajectory) out.push(mk('B', `type_${payload.trajectory}`, +5, alpha_app, alpha_app));
  for (const emo of RESONANCE_PATTERN_TO_EMOTION[payload.patternId] ?? []) {
    out.push(mk('G', emo, +3, alpha_app * sigma_u, alpha_app));
  }
  if (payload.style === 'sns' || payload.style === 'essay') out.push(mk('J','humor',+2,w,alpha_app));
  if (payload.style === 'novel' || payload.style === 'script') out.push(mk('J','empathy',+2,w,alpha_app));
  out.push(mk('L','pc_1',+1,w*0.5,alpha_app));
  return out;
};

export const projectFeelings: ProjectionFn<FeelingsPayload> = (payload, ctx) => {
  const out: AxisContribution[] = [];
  const { alpha_app, sigma_u } = ctx;
  const w_J = alpha_app * Math.pow(sigma_u, 0.7);
  const w_GHI = alpha_app * sigma_u;
  if (payload.expression) {
    for (const [k, v] of Object.entries(payload.expression)) {
      out.push(mk('J', k, v - 30, w_J, alpha_app));
    }
  }
  if (payload.emotionProfile) {
    for (const [emo9, layers] of Object.entries(payload.emotionProfile)) {
      const targets = F9_TO_NETWORK[emo9] ?? [];
      const fanout = 1 / Math.max(targets.length, 1);
      for (const emo28 of targets) {
        out.push(mk('G', emo28, (layers.intensity - 30) * fanout, w_GHI, alpha_app));
        out.push(mk('H', emo28, (layers.sensitivity - 30) * fanout, w_GHI, alpha_app));
        out.push(mk('I', emo28, (layers.duration - 30) * fanout, w_GHI, alpha_app));
      }
    }
  }
  if (payload.ageBracketScores) {
    for (const [bracket, scores] of Object.entries(payload.ageBracketScores)) {
      for (const [cat, val] of Object.entries(scores)) {
        out.push(mk('A', `age_${bracket}_${cat}`, val - 50, alpha_app, alpha_app));
      }
    }
  }
  return out;
};

export const projectHowFeelings: ProjectionFn<HowFeelingsWorkPayload> = (payload, ctx) => {
  const out: AxisContribution[] = [];
  const { alpha_app, sigma_u } = ctx;
  const w = alpha_app * sigma_u;
  for (const emo of payload.exploredEmotions ?? []) out.push(mk('G', emo, +1, w * 0.3, alpha_app));
  if (payload.emotionId) out.push(mk('G', payload.emotionId, +0.5, w * 0.2, alpha_app));
  if (payload.category === 'social') out.push(mk('K','rel_society',+1,w*0.3,alpha_app));
  if ((payload.exploredEmotions?.length ?? 0) >= 2) out.push(mk('L','pc_1',+0.5,w*0.4,alpha_app));
  return out;
};

export const projectValuse: ProjectionFn<ValusePayload> = (payload, ctx) => {
  const out: AxisContribution[] = [];
  const { alpha_app, sigma_u } = ctx;
  const w = alpha_app * Math.pow(sigma_u, 0.5);
  for (const c of payload.categories ?? []) out.push(mk('E', `cat_${c.category}`, c.score - 50, w, alpha_app));
  for (const m of payload.maslow ?? []) {
    const dim = `maslow_${m.stage === 'selfActualization' ? 'self_actualization' : m.stage}`;
    out.push(mk('E', dim, m.score - 50, w, alpha_app));
  }
  for (const c of payload.categories ?? []) {
    if (c.category === 'personal' && c.score > 60) out.push(mk('D','freedom',(c.score-60)*0.5,w*0.4,alpha_app));
    if (c.category === 'social' && c.score > 60) out.push(mk('D','belonging',-(c.score-60)*0.3,w*0.4,alpha_app));
    if (c.category === 'economic' && c.score > 60) out.push(mk('D','safety',(c.score-60)*0.5,w*0.4,alpha_app));
    if (c.category === 'moral' && c.score > 60) out.push(mk('D','fairness',(c.score-60)*0.4,w*0.4,alpha_app));
  }
  return out;
};

export const projectPazst: ProjectionFn<PazstPayload> = (payload, ctx) => {
  const out: AxisContribution[] = [];
  const { alpha_app, sigma_u } = ctx;
  const w = alpha_app * Math.pow(sigma_u, 0.5);
  for (const [need, score] of Object.entries(payload.axes ?? {})) {
    const dim = PAZST_NEED_TO_D[need];
    if (dim) out.push(mk('D', dim, (score as number) - 50, w, alpha_app));
  }
  return out;
};

export const projectMinus: ProjectionFn<MinusPayload> = (payload, ctx) => {
  const out: AxisContribution[] = [];
  const { alpha_app, sigma_u } = ctx;
  const w = alpha_app * Math.pow(sigma_u, 0.5);
  for (const [domain, score] of Object.entries(payload.categoryScores ?? {})) {
    const dim = MINUS_DOMAIN_TO_F[domain];
    if (dim) out.push(mk('F', dim, (score as number) - 50, w, alpha_app));
  }
  if (typeof payload.totalScore === 'number') out.push(mk('F','overall_level', payload.totalScore - 50, w, alpha_app));
  return out;
};

export const projectGap: ProjectionFn<GapPayload> = (payload, ctx) => {
  const out: AxisContribution[] = [];
  const { alpha_app, sigma_u } = ctx;
  const w_K = alpha_app * Math.pow(sigma_u, 0.7);

  // 集計型 payload (entryCount + relationships)
  if (typeof payload.entryCount === 'number' && Array.isArray(payload.relationships)) {
    for (const r of payload.relationships) {
      const dim = GAP_RELATION_TO_K[r.relationship];
      if (dim && payload.entryCount > 0) {
        const ratio = r.count / payload.entryCount;
        out.push(mk('K', dim, -ratio * 30, w_K, alpha_app));
      }
    }
    if (payload.entryCount >= 5) {
      out.push(mk('J', 'suppression', +5, alpha_app * 0.4, alpha_app));
      out.push(mk('F', 'domain_relationship', +3, alpha_app * 0.3, alpha_app));
    }
  }

  // エントリ単位 payload (relationship + honne + wantToSay etc.)
  const p = payload as unknown as { relationship?: string; emotionIntensity?: number; wantToSay?: 'yes'|'no'|'unsure' };
  if (p.relationship) {
    const k_dim = GAP_RELATION_TO_K[p.relationship];
    // wantToSay は関係性開放度の真のシグナル
    if (k_dim && p.wantToSay) {
      const delta = p.wantToSay === 'yes' ? +5 : p.wantToSay === 'no' ? -3 : 0;
      if (delta !== 0) out.push(mk('K', k_dim, delta, w_K, alpha_app));
    }
    // 高強度感情は G にファンアウト
    if (typeof p.emotionIntensity === 'number' && p.emotionIntensity >= 7) {
      out.push(mk('G', 'anger', (p.emotionIntensity - 5) * 2, alpha_app * sigma_u * 0.3, alpha_app));
    }
  }

  return out;
};

export const projectEvolve: ProjectionFn<EvolvePayload> = (payload, ctx) => {
  const out: AxisContribution[] = [];
  const { alpha_app, sigma_u } = ctx;
  const w_GHI = alpha_app * sigma_u;
  if (typeof payload.awakeningStage === 'number') {
    out.push(mk('C','awakening_stage', payload.awakeningStage, alpha_app, alpha_app));
  }
  for (const [eAxis, val] of Object.entries(payload.emotionAxes ?? {})) {
    if (typeof val !== 'number') continue;
    for (const [emo28, sign] of EVOLVE_AXIS_TO_EMOTIONS[eAxis] ?? []) {
      out.push(mk('G', emo28, val * sign * 10, w_GHI * 0.5, alpha_app));
    }
  }
  return out;
};

// ============================================================
//  SUST v0.3 新規: narrative / atlas / self_resonance クロスアプリ
// ============================================================

export const projectNarrative: ProjectionFn<NarrativePayload> = (payload, ctx) => {
  const out: AxisContribution[] = [];
  const { alpha_app, sigma_u } = ctx;
  const w = alpha_app * Math.pow(sigma_u, 0.5);

  if (payload.type === 'self_now' && typeof payload.text === 'string' && payload.text.length > 0) {
    // 記述した = 読み返せる → revisability
    out.push(mk('M', 'revisability', +2, w * 0.5, alpha_app));
    // text 長さは統合思考の深さプロキシ (上限 cap)
    const lenScore = Math.min(payload.text.length / 50, 8);
    out.push(mk('M', 'integration_phase', lenScore, w * 0.7, alpha_app));
    // 入力を重ねると temporal_coherence の実測計算可能になる
    out.push(mk('M', 'temporal_coherence', +3, w * 0.7, alpha_app));
  }

  if (payload.type === 'consistency_check' && typeof payload.rating === 'number') {
    // 1–5 を -20〜+20 に写像 (3 = 中央)
    const delta = (payload.rating - 3) * 10;
    out.push(mk('M', 'self_rated_coherence', delta, w, alpha_app));
  }

  if (payload.type === 'retell' && typeof payload.text === 'string') {
    // 語り直しは revisability と productive_contradiction へ寄与
    out.push(mk('M', 'revisability', +5, w, alpha_app));
    out.push(mk('M', 'productive_contradiction', +3, w * 0.7, alpha_app));
  }

  return out;
};

export const projectAtlas: ProjectionFn<AtlasPayload> = (payload, ctx) => {
  const out: AxisContribution[] = [];
  // atlas は主に σ_u を動かすアプリだが、軸としても少し動く
  const { alpha_app } = ctx;
  if (payload.type === 'life_event' && payload.event) {
    // valence に応じて G に弱寄与
    if (payload.event.valence < 0) out.push(mk('G','sadness', -payload.event.valence * 10, alpha_app * 0.4, alpha_app));
    if (payload.event.valence > 0) out.push(mk('G','joy', payload.event.valence * 10, alpha_app * 0.4, alpha_app));
  }
  return out;
};

// SUST v0.3: クロスアプリ · self_resonance を M 軸へ寄与
function projectSelfResonance(
  payload: { type: 'self_resonance'; rating: 'yes'|'mid'|'no' },
  ctx: { sigma_u: number; alpha_app: number },
): AxisContribution[] {
  const { alpha_app, sigma_u } = ctx;
  const w = alpha_app * Math.pow(sigma_u, 0.5);
  const delta = payload.rating === 'yes' ? +15 : payload.rating === 'no' ? -15 : 0;
  return [
    mk('M', 'self_rated_coherence', delta, w, alpha_app),
    mk('M', 'cross_app_coherence',  delta * 0.5, w * 0.7, alpha_app),
  ];
}

// ============================================================
//  レジストリ
// ============================================================

export const PROJECTORS = {
  resonance:           { app: 'resonance'           as const, alpha_default: 0.30, project: projectResonance },
  feelings:            { app: 'feelings'            as const, alpha_default: 0.55, project: projectFeelings },
  'how-feelings-work': { app: 'how-feelings-work'   as const, alpha_default: 0.20, project: projectHowFeelings },
  valuse:              { app: 'valuse'              as const, alpha_default: 0.50, project: projectValuse },
  pazst:               { app: 'pazst'               as const, alpha_default: 0.50, project: projectPazst },
  minus:               { app: 'minus'               as const, alpha_default: 0.50, project: projectMinus },
  gap:                 { app: 'gap'                 as const, alpha_default: 0.40, project: projectGap },
  evolve:              { app: 'evolve'              as const, alpha_default: 0.35, project: projectEvolve },
  narrative:           { app: 'narrative'           as const, alpha_default: 0.60, project: projectNarrative },
  atlas:               { app: 'atlas'               as const, alpha_default: 0.50, project: projectAtlas },
} as const;

// ============================================================
//  ディスパッチャ — self_resonance はアプリ跨ぎで先に処理
// ============================================================

export function projectByApp(
  app: AppId,
  payload: unknown,
  context: { sigma_u: number; alpha_app?: number; current_morpho: MorphoProfile },
): AxisContribution[] {
  // クロスアプリ: type='self_resonance' はどのアプリからも出ていい
  const p = payload as { type?: string; rating?: 'yes'|'mid'|'no' };
  if (p?.type === 'self_resonance' && p.rating) {
    const alpha = context.alpha_app ?? 0.5;
    return projectSelfResonance(
      { type: 'self_resonance', rating: p.rating },
      { sigma_u: context.sigma_u, alpha_app: alpha },
    );
  }

  const projector = (PROJECTORS as Record<string, { alpha_default: number; project: ProjectionFn<never> }>)[app];
  if (!projector) return [];
  const alpha = context.alpha_app ?? projector.alpha_default;
  return projector.project(payload as never, {
    sigma_u: context.sigma_u,
    alpha_app: alpha,
    current_morpho: context.current_morpho,
  });
}
