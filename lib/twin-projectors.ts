/**
 * Solnova Digital Twin — App Projection Functions (SUST v0.2)
 *
 * 各アプリ payload を AxisContribution[] に純粋変換する。
 * 副作用なし。 context (sigma_u, alpha_app) を引数で受け取る。
 */

import type {
  AxisContribution,
  AxisId,
  ProjectionFn,
  ResonancePayload,
  FeelingsPayload,
  HowFeelingsWorkPayload,
  ValusePayload,
  PazstPayload,
  MinusPayload,
  GapPayload,
  EvolvePayload,
} from '@/lib/twin-types';

// ============================================================
//  共通ユーティリティ
// ============================================================

const NU_BASE = 100;

const noiseFor = (alpha: number) => NU_BASE / Math.max(alpha, 0.01);

const mk = (
  axis: AxisId,
  dimension: string,
  delta_mu: number,
  weight: number,
  alpha: number,
): AxisContribution => ({ axis, dimension, delta_mu, delta_variance: noiseFor(alpha), weight });

const clip = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
void clip;

const F9_TO_NETWORK: Record<string, string[]> = {
  anger:    ['anger', 'frustration', 'contempt'],
  sadness:  ['sadness', 'grief', 'disappointment', 'loneliness'],
  fear:     ['fear', 'anxiety'],
  joy:      ['joy', 'gratitude', 'pride', 'hope', 'relief', 'contentment'],
  disgust:  ['disgust'],
  surprise: ['surprise', 'curiosity', 'awe'],
  numbness: ['boredom'],
  guilt:    ['guilt', 'regret'],
  shame:    ['shame'],
};

const RESONANCE_PATTERN_TO_EMOTION: Record<string, string[]> = {
  laughter:   ['joy'],
  kandou:     ['gratitude', 'awe', 'love'],
  suspense:   ['anxiety', 'fear'],
  nostalgia:  ['nostalgia', 'sadness'],
  yearning:   ['hope', 'sadness'],
  embarrass:  ['shame'],
  catharsis:  ['relief', 'joy'],
  irritation: ['frustration', 'anger'],
  serenity:   ['contentment'],
  flow:       ['flow', 'curiosity'],
};

const PAZST_NEED_TO_D: Record<string, string> = {
  recognition: 'recognition', love: 'love', safety: 'safety', freedom: 'freedom',
  order: 'order', achievement: 'achievement', expression: 'expression',
  belonging: 'belonging', fairness: 'fairness', trust: 'trust',
};

const MINUS_DOMAIN_TO_F: Record<string, string> = {
  relationship: 'domain_relationship', environment: 'domain_environment',
  work: 'domain_work', time: 'domain_time', values: 'domain_values',
};

const GAP_RELATION_TO_K: Record<string, string> = {
  '職場': 'rel_workplace', '家族': 'rel_family', '恋愛': 'rel_romance',
  '友人': 'rel_friend', '社会': 'rel_society',
};

const EVOLVE_AXIS_TO_EMOTIONS: Record<string, Array<[string, number]>> = {
  expression:  [['joy', +1], ['frustration', -1]],
  speed:       [['surprise', +1], ['curiosity', +1]],
  distance:    [['contentment', +1], ['loneliness', -1]],
  direction:   [['anger', +1], ['fear', -1]],
  fuel:        [['hope', +1], ['boredom', -1]],
  conformity:  [['shame', +1], ['pride', -1]],
};

// ============================================================
//  resonance
// ============================================================

export const projectResonance: ProjectionFn<ResonancePayload> = (payload, ctx) => {
  const out: AxisContribution[] = [];
  const { alpha_app, sigma_u } = ctx;
  const w = alpha_app * Math.pow(sigma_u, 0.7);

  out.push(mk('B', `type_${payload.trajectory}`, +5, alpha_app, alpha_app));

  for (const emo of RESONANCE_PATTERN_TO_EMOTION[payload.patternId] ?? []) {
    out.push(mk('G', emo, +3, alpha_app * sigma_u, alpha_app));
  }

  if (payload.style === 'sns' || payload.style === 'essay') {
    out.push(mk('J', 'humor', +2, w, alpha_app));
  }
  if (payload.style === 'novel' || payload.style === 'script') {
    out.push(mk('J', 'empathy', +2, w, alpha_app));
  }

  out.push(mk('L', 'pc_1', +1, w * 0.5, alpha_app));

  return out;
};

// ============================================================
//  feelings
// ============================================================

export const projectFeelings: ProjectionFn<FeelingsPayload> = (payload, ctx) => {
  const out: AxisContribution[] = [];
  const { alpha_app, sigma_u } = ctx;
  const w_J = alpha_app * Math.pow(sigma_u, 0.7);
  const w_GHI = alpha_app * sigma_u;

  for (const [k, v] of Object.entries(payload.expression)) {
    out.push(mk('J', k, v - 30, w_J, alpha_app));
  }

  for (const [emo9, layers] of Object.entries(payload.emotionProfile)) {
    const targets = F9_TO_NETWORK[emo9] ?? [];
    const fanout = 1 / Math.max(targets.length, 1);
    for (const emo28 of targets) {
      out.push(mk('G', emo28, (layers.intensity   - 30) * fanout, w_GHI, alpha_app));
      out.push(mk('H', emo28, (layers.sensitivity - 30) * fanout, w_GHI, alpha_app));
      out.push(mk('I', emo28, (layers.duration    - 30) * fanout, w_GHI, alpha_app));
    }
  }

  if (payload.ageBracketScores) {
    for (const [bracket, scores] of Object.entries(payload.ageBracketScores)) {
      for (const [cat, val] of Object.entries(scores)) {
        out.push(mk('A', `age_${bracket}_${cat}`, val - 50, alpha_app, alpha_app));
      }
    }
  }

  const sup = payload.expression.suppression;
  const exp = payload.expression.explosiveness;
  if (sup > 60 || exp > 60) {
    out.push(mk('F', 'overall_level', Math.max(sup, exp) - 50, alpha_app * 0.3, alpha_app));
  }

  return out;
};

// ============================================================
//  how-feelings-work
// ============================================================

export const projectHowFeelings: ProjectionFn<HowFeelingsWorkPayload> = (payload, ctx) => {
  const out: AxisContribution[] = [];
  const { alpha_app, sigma_u } = ctx;
  const w = alpha_app * sigma_u;

  for (const emo of payload.exploredEmotions ?? []) {
    out.push(mk('G', emo, +1, w * 0.3, alpha_app));
  }
  if (payload.emotionId) {
    out.push(mk('G', payload.emotionId, +0.5, w * 0.2, alpha_app));
  }
  if (payload.category === 'social') {
    out.push(mk('K', 'rel_society', +1, w * 0.3, alpha_app));
  }
  if ((payload.exploredEmotions?.length ?? 0) >= 2) {
    out.push(mk('L', 'pc_1', +0.5, w * 0.4, alpha_app));
  }

  return out;
};

// ============================================================
//  valuse
// ============================================================

export const projectValuse: ProjectionFn<ValusePayload> = (payload, ctx) => {
  const out: AxisContribution[] = [];
  const { alpha_app, sigma_u } = ctx;
  const w = alpha_app * Math.pow(sigma_u, 0.5);

  for (const c of payload.categories) {
    out.push(mk('E', `cat_${c.category}`, c.score - 50, w, alpha_app));
  }
  for (const m of payload.maslow) {
    const dim = `maslow_${m.stage === 'selfActualization' ? 'self_actualization' : m.stage}`;
    out.push(mk('E', dim, m.score - 50, w, alpha_app));
  }

  for (const c of payload.categories) {
    if (c.category === 'personal'  && c.score > 60) out.push(mk('D', 'freedom',   (c.score - 60) * 0.5,  w * 0.4, alpha_app));
    if (c.category === 'social'    && c.score > 60) out.push(mk('D', 'belonging', -(c.score - 60) * 0.3, w * 0.4, alpha_app));
    if (c.category === 'economic'  && c.score > 60) out.push(mk('D', 'safety',    (c.score - 60) * 0.5,  w * 0.4, alpha_app));
    if (c.category === 'moral'     && c.score > 60) out.push(mk('D', 'fairness',  (c.score - 60) * 0.4,  w * 0.4, alpha_app));
  }

  return out;
};

// ============================================================
//  pazst
// ============================================================

export const projectPazst: ProjectionFn<PazstPayload> = (payload, ctx) => {
  const out: AxisContribution[] = [];
  const { alpha_app, sigma_u } = ctx;
  const w = alpha_app * Math.pow(sigma_u, 0.5);

  for (const [need, score] of Object.entries(payload.axes)) {
    const dim = PAZST_NEED_TO_D[need];
    if (dim) out.push(mk('D', dim, (score as number) - 50, w, alpha_app));
  }

  if (typeof payload.axes.love     === 'number' && payload.axes.love     > 70) out.push(mk('A', 'age_0_5_family',   -(payload.axes.love     - 70) * 0.3, alpha_app * 0.2, alpha_app));
  if (typeof payload.axes.safety   === 'number' && payload.axes.safety   > 70) out.push(mk('A', 'age_0_5_family',   -(payload.axes.safety   - 70) * 0.3, alpha_app * 0.2, alpha_app));
  if (typeof payload.axes.belonging=== 'number' && payload.axes.belonging> 70) out.push(mk('A', 'age_11_15_school', -(payload.axes.belonging- 70) * 0.3, alpha_app * 0.2, alpha_app));

  const needToBoundary: Record<string, string> = {
    love: 'domain_relationship', expression: 'domain_relationship',
    safety: 'domain_environment', achievement: 'domain_work',
    freedom: 'domain_time', fairness: 'domain_values', trust: 'domain_values',
  };
  for (const [need, score] of Object.entries(payload.axes)) {
    if (typeof score !== 'number') continue;
    const fdim = needToBoundary[need];
    if (fdim && score > 60) out.push(mk('F', fdim, (score - 60) * 0.3, alpha_app * 0.3, alpha_app));
  }

  return out;
};

// ============================================================
//  minus
// ============================================================

export const projectMinus: ProjectionFn<MinusPayload> = (payload, ctx) => {
  const out: AxisContribution[] = [];
  const { alpha_app, sigma_u } = ctx;
  const w = alpha_app * Math.pow(sigma_u, 0.5);

  for (const [domain, score] of Object.entries(payload.categoryScores)) {
    const dim = MINUS_DOMAIN_TO_F[domain];
    if (dim) out.push(mk('F', dim, (score as number) - 50, w, alpha_app));
  }
  out.push(mk('F', 'overall_level', payload.totalScore - 50, w, alpha_app));

  if ((payload.categoryScores.values       ?? 0) > 65) out.push(mk('E', 'cat_moral',    (payload.categoryScores.values       - 65) * 0.4, w * 0.4, alpha_app));
  if ((payload.categoryScores.relationship ?? 0) > 65) out.push(mk('E', 'cat_social',   (payload.categoryScores.relationship - 65) * 0.4, w * 0.4, alpha_app));
  if ((payload.categoryScores.work         ?? 0) > 65) out.push(mk('E', 'cat_personal', (payload.categoryScores.work         - 65) * 0.3, w * 0.4, alpha_app));

  const domainToNeed: Record<string, string> = {
    relationship: 'love', environment: 'safety', work: 'achievement', time: 'freedom', values: 'trust',
  };
  for (const [domain, score] of Object.entries(payload.categoryScores)) {
    if ((score as number) > 70) {
      const ndim = domainToNeed[domain];
      if (ndim) out.push(mk('D', ndim, ((score as number) - 70) * 0.4, w * 0.3, alpha_app));
    }
  }

  return out;
};

// ============================================================
//  gap
// ============================================================

export const projectGap: ProjectionFn<GapPayload> = (payload, ctx) => {
  const out: AxisContribution[] = [];
  const { alpha_app, sigma_u } = ctx;
  const w_K = alpha_app * Math.pow(sigma_u, 0.7);

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
  if ((payload.criticalPointCount ?? 0) >= 3) {
    out.push(mk('J', 'explosiveness', +3, alpha_app * 0.3, alpha_app));
  }

  return out;
};

// ============================================================
//  evolve
// ============================================================

export const projectEvolve: ProjectionFn<EvolvePayload> = (payload, ctx) => {
  const out: AxisContribution[] = [];
  const { alpha_app, sigma_u } = ctx;
  const w_GHI = alpha_app * sigma_u;

  out.push(mk('C', 'awakening_stage', payload.awakeningStage, alpha_app, alpha_app));

  for (const [eAxis, val] of Object.entries(payload.emotionAxes)) {
    if (typeof val !== 'number') continue;
    for (const [emo28, sign] of EVOLVE_AXIS_TO_EMOTIONS[eAxis] ?? []) {
      out.push(mk('G', emo28, val * sign * 10, w_GHI * 0.5, alpha_app));
    }
  }

  if (typeof payload.envAxes.volatility === 'number' && payload.envAxes.volatility > 1) {
    out.push(mk('A', 'age_6_10_events', payload.envAxes.volatility * 5, alpha_app * 0.2, alpha_app));
  }

  out.push(mk('L', 'pc_2', payload.awakeningStage * 0.5, alpha_app * 0.3, alpha_app));

  return out;
};

// ============================================================
//  レジストリ
// ============================================================

export const PROJECTORS = {
  resonance:           { app: 'resonance'           as const, alpha_default: 0.30, project: projectResonance   },
  feelings:            { app: 'feelings'            as const, alpha_default: 0.55, project: projectFeelings    },
  'how-feelings-work': { app: 'how-feelings-work'   as const, alpha_default: 0.20, project: projectHowFeelings },
  valuse:              { app: 'valuse'              as const, alpha_default: 0.50, project: projectValuse      },
  pazst:               { app: 'pazst'               as const, alpha_default: 0.50, project: projectPazst       },
  minus:               { app: 'minus'               as const, alpha_default: 0.50, project: projectMinus       },
  gap:                 { app: 'gap'                 as const, alpha_default: 0.40, project: projectGap         },
  evolve:              { app: 'evolve'              as const, alpha_default: 0.35, project: projectEvolve      },
} as const;

export function projectByApp(
  app: keyof typeof PROJECTORS,
  payload: unknown,
  context: { sigma_u: number; alpha_app?: number; current_morpho: import('@/lib/twin-types').MorphoProfile },
): AxisContribution[] {
  const projector = PROJECTORS[app];
  if (!projector) return [];
  const alpha = context.alpha_app ?? projector.alpha_default;
  return projector.project(payload as never, {
    sigma_u: context.sigma_u,
    alpha_app: alpha,
    current_morpho: context.current_morpho,
  });
}
