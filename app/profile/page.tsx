'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { AXIS_META_V2, AXIS_DIMENSIONS, type AxisId } from '@/lib/twin-types'

interface MorphoAxisRow {
  axis: AxisId
  mu: number[]
  variance: number[]
  last_updated: string
  observation_count: number
}

interface HypothesisRow {
  hypothesis: string
  score: number
  threshold: number
  fired: boolean
  last_evaluated: string
}

interface SigmaInfo {
  sigma: number
  source: string
  hsp_score: number | null
  observation_n: number
}

const LAYER_COLOR: Record<string, string> = {
  I:   '#a78bfa',
  II:  '#60a5fa',
  III: '#34d399',
  IV:  '#fbbf24',
}

export default function ProfilePage() {
  const [morpho, setMorpho] = useState<Record<AxisId, MorphoAxisRow | null>>({} as Record<AxisId, MorphoAxisRow | null>)
  const [sigma, setSigma] = useState<SigmaInfo | null>(null)
  const [hypotheses, setHypotheses] = useState<HypothesisRow[]>([])
  const [contributionCount, setContributionCount] = useState(0)
  const [byApp, setByApp] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      let session = (await supabase.auth.getSession()).data.session
      if (!session) {
        await supabase.auth.signInAnonymously()
        session = (await supabase.auth.getSession()).data.session
      }
      if (!session) { setLoading(false); return }
      const userId = session.user.id

      const [m, s, h, c] = await Promise.all([
        supabase.from('twin_morpho_axis').select('*').eq('user_id', userId),
        supabase.from('twin_sigma').select('sigma, source, hsp_score, observation_n').eq('user_id', userId).maybeSingle(),
        supabase.from('twin_hypotheses').select('hypothesis, score, threshold, fired, last_evaluated').eq('user_id', userId),
        supabase.from('twin_contributions').select('app').eq('user_id', userId),
      ])

      const map: Record<string, MorphoAxisRow | null> = {}
      for (const ax of Object.keys(AXIS_META_V2)) map[ax] = null
      for (const r of (m.data ?? []) as MorphoAxisRow[]) map[r.axis] = r
      setMorpho(map as Record<AxisId, MorphoAxisRow | null>)
      setSigma(s.data ?? null)
      setHypotheses(((h.data ?? []) as HypothesisRow[]).sort((a,b) => b.score - a.score))

      const apps: Record<string, number> = {}
      for (const row of (c.data ?? []) as { app: string }[]) {
        apps[row.app] = (apps[row.app] ?? 0) + 1
      }
      setByApp(apps)
      setContributionCount((c.data ?? []).length)

      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div className="text-gray-600 text-sm">読み込み中...</div>
      </div>
    )
  }

  const axisIds = Object.keys(AXIS_META_V2) as AxisId[]
  const firedCount = hypotheses.filter((h) => h.fired).length

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <div className="text-xs tracking-widest text-indigo-400 uppercase mb-2">SUST v0.3 Profile</div>
        <h1 className="text-3xl font-light text-white mb-2">13 軸 Morpho Profile</h1>
        <p className="text-gray-500 text-sm">
          各軸のバー: 平均µ / 透明度: 分散の低さ (確信度)。 13 軸 × 4 層を一覧で見られます。
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <Stat label="寄与件数" value={String(contributionCount)} />
        <Stat label="個体差 σ_u" value={sigma?.sigma?.toFixed(2) ?? '—'} sub={sigma?.source ?? ''} />
        <Stat label="発火仮説" value={String(firedCount)} sub={`/ ${hypotheses.length}`} />
        <Stat label="記録軸" value={String(Object.values(morpho).filter(Boolean).length)} sub="/ 13" />
      </div>

      {(['I','II','III','IV'] as const).map((layer) => {
        const layerAxes = axisIds.filter((id) => AXIS_META_V2[id].layer === layer)
        const layerName = { I:'Substrate (±年)', II:'Structural (±月)', III:'Dynamic (±週)', IV:'Expressive (±日)' }[layer]
        return (
          <section key={layer} className="mb-10">
            <div className="flex items-baseline gap-3 mb-4">
              <h2 className="text-xs tracking-widest uppercase" style={{ color: LAYER_COLOR[layer] }}>
                Layer {layer}
              </h2>
              <span className="text-xs text-gray-600">{layerName}</span>
            </div>
            <div className="space-y-3">
              {layerAxes.map((axId) => (
                <AxisRow key={axId} axId={axId} row={morpho[axId]} color={LAYER_COLOR[layer]} />
              ))}
            </div>
          </section>
        )
      })}

      {hypotheses.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs tracking-widest text-gray-600 uppercase mb-4">仮説スコア</h2>
          <div className="space-y-2">
            {hypotheses.map((h) => (
              <div key={h.hypothesis} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                   style={{ border: '1px solid rgba(255,255,255,0.06)', background: h.fired ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.02)' }}>
                <span className="text-xs font-mono" style={{ color: h.fired ? '#6366f1' : '#6b7280' }}>{h.hypothesis}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full"
                    style={{ width: `${h.score * 100}%`, background: h.fired ? '#6366f1' : '#4b5563' }} />
                </div>
                <span className="text-xs tabular-nums text-gray-500" style={{ minWidth: 60 }}>
                  {h.score.toFixed(2)} / {h.threshold.toFixed(2)}
                </span>
                {h.fired && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>fired</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {Object.keys(byApp).length > 0 && (
        <section>
          <h2 className="text-xs tracking-widest text-gray-600 uppercase mb-4">アプリ別寄与</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(byApp).sort((a,b) => b[1] - a[1]).map(([app, n]) => (
              <div key={app} className="px-3 py-1.5 rounded-full text-xs"
                   style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-gray-400">{app}</span>
                <span className="ml-2 text-gray-600">{n}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex flex-wrap gap-3 text-xs">
          <Link href="/mirror" className="px-3 py-1.5 rounded-full text-pink-300"
                style={{ border: '1px solid rgba(236,72,153,0.3)' }}>→ mirror</Link>
          <Link href="/journal" className="px-3 py-1.5 rounded-full text-cyan-300"
                style={{ border: '1px solid rgba(6,182,212,0.3)' }}>→ journal</Link>
        </div>
      </div>
    </main>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
      <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-light text-white">{value}</span>
        {sub && <span className="text-xs text-gray-600">{sub}</span>}
      </div>
    </div>
  )
}

function AxisRow({ axId, row, color }: { axId: AxisId; row: MorphoAxisRow | null; color: string }) {
  const meta = AXIS_META_V2[axId]
  const dims = AXIS_DIMENSIONS[axId]
  const has = row !== null

  const muAvg = has ? row.mu.reduce((a,b) => a+b, 0) / row.mu.length : 50
  const varAvg = has ? row.variance.reduce((a,b) => a+b, 0) / row.variance.length : 2500
  const confidence = Math.max(0, Math.min(1, 1 - varAvg / 2500))

  const ranked = has
    ? row.mu.map((v, i) => ({ name: dims[i], v }))
            .sort((a, b) => Math.abs(b.v - 50) - Math.abs(a.v - 50))
            .slice(0, 3)
    : []

  return (
    <div className="p-4 rounded-xl"
         style={{ border: `1px solid ${color}${has ? '20' : '08'}`, background: has ? `${color}05` : 'rgba(255,255,255,0.01)' }}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-base font-bold" style={{ color }}>{axId}</span>
        <span className="text-sm text-gray-300">{meta.name}</span>
        <span className="text-xs text-gray-700 ml-auto">
          {has ? `µ̄ ${muAvg.toFixed(1)} · conf ${(confidence * 100).toFixed(0)}% · obs ${row.observation_count}` : '未観測'}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="h-full rounded-full transition-all"
          style={{ width: `${muAvg}%`, background: color, opacity: 0.2 + confidence * 0.8 }} />
      </div>
      {ranked.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {ranked.map((d) => (
            <span key={d.name} className="text-xs text-gray-500">
              <span className="text-gray-700">{d.name}</span> {d.v.toFixed(0)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
