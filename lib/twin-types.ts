/**
 * Solnova Digital Twin — Type Definitions (SUST v0.2 / v0.3)
 */

// ============================================================
//  軸定義 (SUST v0.2 以降)
// ============================================================

export type AxisId =
  | 'A' | 'B' | 'C'
  | 'D' | 'E' | 'F'
  | 'G' | 'H' | 'I'
  | 'J' | 'K' | 'L'
  | 'M';

export type AxisLayer = 'I' | 'II' | 'III' | 'IV';

export interface AxisMetaV2 {
  id: AxisId;
  name: string;
  layer: AxisLayer;
  dim: number;
  beta: number;
  tau_days: number;
  defaultUpdateRate: number;
}

export const AXIS_META_V2: Record<AxisId, AxisMetaV2> = {
  A: { id: 'A', name: 'Developmental Origin',           layer: 'I',   dim: 12, beta: 0.0, tau_days: 3650, defaultUpdateRate: 0.05 },
  B: { id: 'B', name: 'Temporal Structure Preference',  layer: 'I',   dim: 9,  beta: 0.0, tau_days: 365,  defaultUpdateRate: 0.08 },
  C: { id: 'C', name: 'Awakening Phase',                layer: 'I',   dim: 1,  beta: 0.0, tau_days: 365,  defaultUpdateRate: 0.10 },
  D: { id: 'D', name: 'Needs Satisfaction',             layer: 'II',  dim: 10, beta: 0.5, tau_days: 180,  defaultUpdateRate: 0.15 },
  E: { id: 'E', name: 'Value Hierarchy',                layer: 'II',  dim: 11, beta: 0.5, tau_days: 180,  defaultUpdateRate: 0.15 },
  F: { id: 'F', name: 'Self-Boundary Topology',         layer: 'II',  dim: 6,  beta: 0.5, tau_days: 180,  defaultUpdateRate: 0.18 },
  G: { id: 'G', name: 'Emotion Intensity',              layer: 'III', dim: 28, beta: 1.0, tau_days: 60,   defaultUpdateRate: 0.30 },
  H: { id: 'H', name: 'Emotion Sensitivity',            layer: 'III', dim: 28, beta: 1.0, tau_days: 60,   defaultUpdateRate: 0.30 },
  I: { id: 'I', name: 'Emotion Duration',               layer: 'III', dim: 28, beta: 1.0, tau_days: 60,   defaultUpdateRate: 0.25 },
  J: { id: 'J', name: 'Expression Style',               layer: 'IV',  dim: 4,  beta: 0.7, tau_days: 30,   defaultUpdateRate: 0.50 },
  K: { id: 'K', name: 'Relational Openness',            layer: 'IV',  dim: 5,  beta: 0.7, tau_days: 30,   defaultUpdateRate: 0.50 },
  L: { id: 'L', name: 'Emotion Transition Preferences', layer: 'IV',  dim: 8,  beta: 0.7, tau_days: 30,   defaultUpdateRate: 0.40 },
  M: { id: 'M', name: 'Narrative Coherence',            layer: 'IV',  dim: 8,  beta: 0.5, tau_days: 90,   defaultUpdateRate: 0.30 },
};

export const EMOTION_28 = [
  'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust',
  'love', 'gratitude', 'pride', 'hope', 'relief', 'curiosity',
  'awe', 'flow', 'elevation', 'contentment',
  'anxiety', 'grief', 'disappointment', 'regret', 'boredom', 'loneliness', 'frustration', 'nostalgia',
  'jealousy', 'envy', 'shame', 'guilt',
] as const;

export type Emotion28 = (typeof EMOTION_28)[number];

export const AXIS_DIMENSIONS: Record<AxisId, readonly string[]> = {
  A: [
    'age_0_5_family',  'age_0_5_school',  'age_0_5_events',
    'age_6_10_family', 'age_6_10_school', 'age_6_10_events',
    'age_11_15_family','age_11_15_school','age_11_15_events',
    'age_16_20_family','age_16_20_school','age_16_20_events',
  ],
  B: ['type_I','type_II','type_III','type_IV','type_V','type_VI','type_VII','type_VIII','type_IX'],
  C: ['awakening_stage'],
  D: ['recognition','love','safety','freedom','order','achievement','expression','belonging','fairness','trust'],
  E: [
    'cat_moral','cat_social','cat_personal','cat_spiritual','cat_intellectual','cat_aesthetic','cat_economic',
    'maslow_safety','maslow_belonging','maslow_esteem','maslow_self_actualization',
  ],
  F: ['domain_relationship','domain_environment','domain_work','domain_time','domain_values','overall_level'],
  G: [...EMOTION_28],
  H: [...EMOTION_28],
  I: [...EMOTION_28],
  J: ['humor','empathy','suppression','explosiveness'],
  K: ['rel_workplace','rel_family','rel_romance','rel_friend','rel_society'],
  L: ['pc_1','pc_2','pc_3','pc_4','pc_5','pc_6','pc_7','pc_8'],
  M: [
    'intra_layer_coherence','cross_layer_coherence','temporal_coherence',
    'cross_app_coherence','self_rated_coherence','productive_contradiction',
    'integration_phase','revisability',
  ],
};

export interface AxisDistribution {
  mu: number[];
  variance: number[];
  lastUpdated: string;
  observationCount: number;
}

export type MorphoProfile = { [K in AxisId]: AxisDistribution };

export interface UserSusceptibility {
  user_id: string;
  sigma: number;
  source: 'self_report' | 'observation' | 'hybrid';
  hsp_score: number | null;
  observation_n: number;
  updated_at: string;
}

// ============================================================
//  AppId  (SUST v0.3 Phase 2 — narrative / atlas / mirror 追加)
// ============================================================

export type AppId =
  | 'resonance' | 'feelings' | 'how-feelings-work' | 'valuse'
  | 'pazst' | 'minus' | 'gap' | 'evolve'
  | 'narrative' | 'atlas' | 'mirror';

export interface ResonancePayload {
  patternId: string;
  trajectory: 'I'|'II'|'III'|'IV'|'V'|'VI'|'VII'|'VIII'|'IX';
  style: 'sns'|'note'|'novel'|'script'|'essay';
  length: 'short'|'medium'|'long';
  intensity?: 'soft'|'standard'|'strong';
  type?: 'compose'|'refine';
}

export interface FeelingsPayload {
  emotionProfile: Record<string, { intensity: number; sensitivity: number; duration: number }>;
  expression: { humor: number; empathy: number; suppression: number; explosiveness: number };
  ageBracketScores?: Record<string, Record<string, number>>;
}

export interface HowFeelingsWorkPayload {
  exploredEmotions?: string[];
  emotionId?: string;
  emotionName?: string;
  category?: string;
  totalEmotions?: number;
  explored?: boolean;
}

export interface ValusePayload {
  categories: Array<{ category: string; label: string; score: number }>;
  dominantMaslow: 'safety'|'belonging'|'esteem'|'selfActualization';
  maslow: Array<{ stage: string; label: string; score: number }>;
}

export interface PazstPayload {
  profileType: string;
  axes: Record<string, number>;
  contradictions: Array<Record<string, unknown>>;
}

export interface MinusPayload {
  typeName: string;
  totalScore: number;
  level: '鈍感域'|'標準域'|'敏感域'|'過敏域';
  categoryScores: Record<string, number>;
}

export interface GapPayload {
  entryCount: number;
  relationships: Array<{ relationship: string; count: number }>;
  criticalPointCount?: number;
}

export interface EvolvePayload {
  awakeningStage: number;
  emotionAxes: Record<string, number>;
  envAxes: Record<string, number>;
}

// SUST v0.3: クロスアプリで使えるセルフレゾナンス payload
export interface SelfResonancePayload {
  type: 'self_resonance';
  rating: 'yes' | 'mid' | 'no';
  // 他のメタ情報は任意
  [key: string]: unknown;
}

export interface NarrativePayload {
  type: 'self_now' | 'consistency_check' | 'retell';
  text?: string;
  rating?: number;       // 1、5 (consistency_check 用)
  targetEpisodeId?: string;
}

export interface AtlasPayload {
  type: 'hsp_score' | 'life_event' | 'context_card';
  hspItems?: number[];   // 8 項目 1–7
  event?: { date: string; label: string; valence: number };
  context?: Record<string, string>;
}

export interface AxisContribution {
  axis: AxisId;
  dimension: string;
  delta_mu: number;
  delta_variance: number;
  weight: number;
}

export interface ContributionRecord {
  id: string;
  user_id: string;
  app: AppId;
  payload: Record<string, unknown>;
  payload_hash: string;
  axis_contributions: AxisContribution[];
  server_ts: string;
  client_ts: string | null;
  alpha_app: number;
  sigma_u: number;
}

export type ProjectionFn<P> = (
  payload: P,
  context: { sigma_u: number; alpha_app: number; current_morpho: MorphoProfile },
) => AxisContribution[];

export interface AppProjector<P> {
  app: AppId;
  alpha_default: number;
  project: ProjectionFn<P>;
}

export type HypothesisId =
  | 'SUST-1' | 'SUST-2' | 'SUST-3' | 'SUST-4' | 'SUST-5'
  | 'SUST-6' | 'SUST-7' | 'SUST-8' | 'SUST-9' | 'SUST-10';

export interface HypothesisScore {
  user_id: string;
  hypothesis: HypothesisId;
  score: number;
  threshold: number;
  fired: boolean;
  evidence_axes: AxisId[];
  evidence_summary: Record<string, number>;
  last_evaluated: string;
}

export type InsightType = 'observation'|'pattern'|'hypothesis'|'invitation'|'caution';
export type InsightFeedback = 'resonated'|'misaligned'|'unsure';

export interface InsightAction {
  kind: 'open_app'|'reflect'|'export'|'feedback';
  app?: AppId;
  payload?: Record<string, unknown>;
  label: string;
}

export interface InsightCard {
  id: string;
  user_id: string;
  type: InsightType;
  trigger: 'hypothesis_fired'|'drift_detected'|'periodic'|'conflict';
  axes_referenced: AxisId[];
  hypothesis_id: HypothesisId | null;
  confidence: number;
  title: string;
  body: string;
  actions: InsightAction[];
  created_at: string;
  expires_at: string;
  feedback: InsightFeedback | null;
  feedback_at: string | null;
}

export interface ConflictReport {
  axis: AxisId;
  dimension: string;
  conflict_score: number;
  contributors: Array<{ app: AppId; suggested_value: number; weight: number }>;
  resolution_strategy: 'both_views'|'high_confidence'|'temporal'|'ask_user';
}

export interface DriftEvent {
  axis: AxisId;
  dimension: string;
  delta_24h: number;
  delta_7d: number;
  delta_30d: number;
  is_significant: boolean;
}

export type ConsentLevel = 'L0'|'L1'|'L2'|'L3';

export interface UserConsent {
  user_id: string;
  level: ConsentLevel;
  insights_enabled: boolean;
  aggregate_participation: boolean;
  longitudinal_participation: boolean;
  changed_at: string;
}

export interface ContributeRequest {
  appId: AppId;
  data: Record<string, unknown>;
  client_ts?: string;
}

export interface ContributeResponse {
  ok: true;
  contribution_id: string;
  axes_updated: AxisId[];
  triggered_insights: number;
}

export interface GetProfileResponse {
  morpho: MorphoProfile;
  sigma: number;
  version: '0.2' | '0.3';
  updated_at: string;
}

export interface FeedbackRequest {
  insight_id: string;
  feedback: InsightFeedback;
  note?: string;
}

export interface PopulationPrior {
  axis: AxisId;
  dimension: string;
  mu_pop: number;
  variance_pop: number;
  n: number;
  computed_at: string;
}

// ============================================================
//  v0.1 後方互換
// ============================================================

export const AXIS_KEYS = ['A','B','C','D','E','F','G','H','I','J','K','L'] as const;
export type AxisKey = (typeof AXIS_KEYS)[number];

export interface LegacyAxisMeta {
  key: AxisKey;
  labelJa: string;
  color: string;
}

export const AXIS_META: Record<AxisKey, LegacyAxisMeta> = {
  A: { key: 'A', labelJa: '構造',           color: '#ef4444' },
  B: { key: 'B', labelJa: 'エネルギー',     color: '#f97316' },
  C: { key: 'C', labelJa: '入出力',         color: '#eab308' },
  D: { key: 'D', labelJa: '制御',           color: '#84cc16' },
  E: { key: 'E', labelJa: '健康',           color: '#22c55e' },
  F: { key: 'F', labelJa: '環境依存',         color: '#10b981' },
  G: { key: 'G', labelJa: '相互作用',         color: '#06b6d4' },
  H: { key: 'H', labelJa: '重力',           color: '#0ea5e9' },
  I: { key: 'I', labelJa: '排除',           color: '#3b82f6' },
  J: { key: 'J', labelJa: '流動性',         color: '#6366f1' },
  K: { key: 'K', labelJa: 'プライド',       color: '#8b5cf6' },
  L: { key: 'L', labelJa: '死との距離',     color: '#a855f7' },
};

export interface TwinProfile {
  user_id: string;
  axes12?: Partial<Record<AxisKey, number>>;
  axes12_confidence?: Partial<Record<AxisKey, number>>;
  axes12_rationale?: Partial<Record<AxisKey, string>>;
  completeness?: number;
  summary?: string | null;
  catchphrase?: string | null;
  object_type?: string | null;
  created_at?: string;
  updated_at?: string;
}
