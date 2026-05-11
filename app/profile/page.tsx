'use client'
import { useEffect, useState } from 'react'
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        let session = (await supabase.auth.getSession()).data.session
        if (!session) {
          await supabase.auth.signInAnonymously().catch(() => {})
          session = (await supabase.auth.getSession()).data.session
        }

        // Pre-fill morpho map regardless of session
        const emptyMap: Record<string, MorphoAxisRow | null> = {}
        for (const ax of Object.keys(AXIS_META_V2)) emptyMap[ax] = null

        if (!session) {
          if (!cancelled) {
            setMorpho(emptyMap as Record<AxisId, MorphoAxisRow | null>)
            setLoading(false)
          }
          return
        }
        const userId = session.user.id

        const [m, s, h, c] = await Promise.all([
          supabase.from('twin_morpho_axis').select('*').eq('user_id', userId),
          supabase.from('twin_sigma').select('sigma, source, hsp_score, observation_n').eq('user_id', userId).maybeSingle(),
          supabase.from('twin_hypotheses').select('hypothesis, score, threshold, fired, last_evaluated').eq('user_id', userId),
          supabase.from('twin_contributions').select('app').eq('user_id', userId),
        ])

        const map = { ...emptyMap }
        for (const r of (m.data ?? []) as MorphoAxisRow[]) {
          if (r && r.axis) map[r.axis] = r
        }

        const apps: Record<string, number> = {}
        for (const row of (c.data ?? []) as { app: string }[]) {
          if (row && row.app) apps[row.app] = (apps[row.app] ?? 0) + 1
        }

        if (cancelled) return
        setMorpho(map as Record<AxisId, MorphoAxisRow | null>)
        setSigma((s.data as SigmaInfo | null) ?? null)
        setHypotheses(
          ((h.data ?? []) as HypothesisRow[])
            .filter((x) => x && typeof x.score === 'number')
            .sort((a, b) => b.score - a.score)
        )
        setByApp(apps)
        setContributionCount((c.data ?? []).length)
        setLoading(false)
      } catch (e) {
        console.error('[profile] load failed', e)
        if (!cancelled) {
          const emptyMap: Record<string, MorphoAxisRow | null> = {}
          for (const ax of Object.keys(AXIS_META_V2)) emptyMap[ax] = null
          setMorpho(emptyMap as Record<AxisId, MorphoAxisRow | null>)
          setError(e instanceof Error ? e.message : 'データ取得に失敗しました')
          setLoading(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>読み込み中...</div>
      </div>
    )
  }

  const axisIds = Object.keys(AXIS_META_V2) as AxisId[]
  const firedCount = hypotheses.filter((h) => h.fired).length

  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: '48px 24px 70px' }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)', marginBottom: 10 }}>
          SUST v0.3 Profile
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 300, color: 'rgba(255,255,255,0.9)', margin: '0 0 10px', letterSpacing: '-0.01em' }}>
          13 軸 Morpho Profile
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>
          各軸のバー: 平均µ / 透明度: 分散の低さ (確信度)。 13 軸 × 4 層を一覧で見られます。
        </p>
        {error && (
          <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(251,113,133,0.25)', background: 'rgba(251,113,133,0.06)', color: 'rgba(251,113,133,0.85)', fontSize: 12 }}>
            読み込みエラー: {error}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 40 }}>
        <Stat label="寄与件数" value={String(contributionCount)} />
        <Stat label="個体差 σ_u" value={sigma && typeof sigma.sigma === 'number' ? sigma.sigma.toFixed(2) : '—'} sub={sigma?.source ?? ''} />
        <Stat label="発火仮説" value={String(firedCount)} sub={`/ ${hypotheses.length}`} />
        <Stat label="記録軸" value={String(Object.values(morpho).filter(Boolean).length)} sub="/ 13" />
      </div>

      {(['I','II','III','IV'] as const).map((layer) => {
        const layerAxes = axisIds.filter((id) => AXIS_META_V2[id]?.layer === layer)
        const layerName = { I:'Substrate (±年)', II:'Structural (±月)', III:'Dynamic (±週)', IV:'Expressive (±日)' }[layer]
        return (
          <section key={layer} style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
              <h2 style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: LAYER_COLOR[layer], margin: 0 }}>
                Layer {layer}
              </h2>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)' }}>{layerName}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {layerAxes.map((axId) => (
                <AxisRow key={axId} axId={axId} row={morpho[axId] ?? null} color={LAYER_COLOR[layer]} />
              ))}
            </div>
          </section>
        )
      })}

      {hypotheses.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)', margin: '0 0 14px' }}>仮説スコア</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {hypotheses.map((h) => (
              <div key={h.hypothesis}
                   style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', background: h.fired ? 'rgba(167,139,250,0.07)' : 'rgba(255,255,255,0.02)' }}>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: h.fired ? '#c4b5fd' : 'rgba(255,255,255,0.4)' }}>{h.hypothesis}</span>
                <div style={{ flex: 1, height: 4, borderRadius: 4, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                  <div style={{ height: '100%', borderRadius: 4, width: `${Math.max(0, Math.min(1, h.score)) * 100}%`, background: h.fired ? '#a78bfa' : 'rgba(255,255,255,0.3)' }} />
                </div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', minWidth: 80, textAlign: 'right' }}>
                  {Number(h.score ?? 0).toFixed(2)} / {Number(h.threshold ?? 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {Object.keys(byApp).length > 0 && (
        <section>
          <h2 style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)', margin: '0 0 14px' }}>アプリ別寄与</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(byApp).sort((a,b) => b[1] - a[1]).map(([app, n]) => (
              <div key={app} style={{ padding: '6px 12px', borderRadius: 999, fontSize: 11, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>{app}</span>
                <span style={{ marginLeft: 8, color: 'rgba(255,255,255,0.32)' }}>{n}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 22, fontWeight: 300, color: 'rgba(255,255,255,0.9)' }}>{value}</span>
        {sub && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)' }}>{sub}</span>}
      </div>
    </div>
  )
}

function AxisRow({ axId, row, color }: { axId: AxisId; row: MorphoAxisRow | null; color: string }) {
  const meta = AXIS_META_V2[axId]
  const dims = AXIS_DIMENSIONS[axId] ?? []
  const muArr = row && Array.isArray(row.mu) ? row.mu : null
  const varArr = row && Array.isArray(row.variance) ? row.variance : null
  const has = muArr !== null && muArr.length > 0

  const muAvg = has ? (muArr!.reduce((a, b) => a + (Number(b) || 0), 0) / muArr!.length) : 50
  const varAvg = has && varArr && varArr.length > 0
    ? varArr.reduce((a, b) => a + (Number(b) || 0), 0) / varArr.length
    : 2500
  const confidence = Math.max(0, Math.min(1, 1 - varAvg / 2500))

  const ranked = has
    ? muArr!.map((v, i) => ({ name: dims[i] ?? `d${i}`, v: Number(v) || 50 }))
            .sort((a, b) => Math.abs(b.v - 50) - Math.abs(a.v - 50))
            .slice(0, 3)
    : []

  return (
    <div style={{
      padding: 14, borderRadius: 12,
      border: `1px solid ${color}${has ? '22' : '0a'}`,
      background: has ? `${color}08` : 'rgba(255,255,255,0.015)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color }}>{axId}</span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{meta?.name ?? axId}</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>
          {has
            ? `µ ${muAvg.toFixed(1)} · conf ${(confidence * 100).toFixed(0)}% · obs ${row?.observation_count ?? 0}`
            : '未観測'}
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 4, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
        <div style={{
          height: '100%', borderRadius: 4,
          width: `${Math.max(0, Math.min(100, muAvg))}%`,
          background: color, opacity: 0.2 + confidence * 0.8,
          transition: 'width 0.4s ease',
        }} />
      </div>
      {ranked.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
          {ranked.map((d) => (
            <span key={d.name} style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>{d.name}</span> {d.v.toFixed(0)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
