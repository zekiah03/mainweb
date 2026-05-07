export type AxisKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L'

export const AXIS_KEYS: AxisKey[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

export const AXIS_META: Record<AxisKey, { label: string; labelJa: string; color: string }> = {
  A: { label: 'Structure',          labelJa: '構造',       color: '#6366f1' },
  B: { label: 'Energy',             labelJa: 'エネルギー', color: '#f59e0b' },
  C: { label: 'I/O',                labelJa: '入出力',     color: '#10b981' },
  D: { label: 'Control',            labelJa: '制御',       color: '#3b82f6' },
  E: { label: 'Health',             labelJa: '健康',       color: '#22c55e' },
  F: { label: 'Env Dependency',     labelJa: '環境依存',   color: '#84cc16' },
  G: { label: 'Interaction',        labelJa: '相互作用',   color: '#ec4899' },
  H: { label: 'Gravity',            labelJa: '重力',       color: '#f97316' },
  I: { label: 'Exclusion',          labelJa: '排除',       color: '#ef4444' },
  J: { label: 'Fluidity',           labelJa: '流動性',     color: '#06b6d4' },
  K: { label: 'Pride',              labelJa: 'プライド',   color: '#a855f7' },
  L: { label: 'Dist. from Death',   labelJa: '死との距離', color: '#64748b' },
}

export interface TwinProfile {
  id: string
  user_id: string
  axes12: Record<AxisKey, number>            // 0–10
  axes12_confidence: Record<AxisKey, number> // 0–1
  axes12_rationale?: Partial<Record<AxisKey, string>>
  layers?: Record<string, unknown>
  emotions?: string[]
  metrics?: Record<string, number>
  env_dna?: Record<string, number>
  object_type?: string
  catchphrase?: string
  summary?: string
  completeness: number
  updated_at: string
  created_at: string
}

export interface AppContribution {
  id: string
  user_id: string
  app_id: string
  raw_data: Record<string, unknown>
  ai_result?: Record<string, unknown>
  axes_updated: AxisKey[]
  created_at: string
}
