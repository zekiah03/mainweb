'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const HSP_QUESTIONS = [
  '一度に多くのことを託されると、すぐに圧倒される',
  '环境の細かい変化 (香り・光・音など) によく気づく',
  '他人の気分に強く影響される',
  '痛みに敏感だと思う',
  '慌ただしい日には、一人で静かにさせてほしい',
  'カフェインや薬、刺激物に敏感である',
  '騒々しい場所や強い光 · 音で不快になりやすい',
  '豊かな内面生活を持っていると感じる',
] as const

interface SigmaState {
  sigma: number
  source: string
  hsp_score: number | null
  observation_n: number
  updated_at: string | null
}

export default function AtlasPage() {
  const [items, setItems] = useState<(number | null)[]>(Array(8).fill(null))
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ before: number; after: number; avg: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState<SigmaState | null>(null)

  useEffect(() => {
    async function load() {
      let session = (await supabase.auth.getSession()).data.session
      if (!session) {
        await supabase.auth.signInAnonymously()
        session = (await supabase.auth.getSession()).data.session
      }
      if (!session) { setLoading(false); return }

      const res = await fetch('/api/twin/atlas', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
      if (res.ok) setCurrent(await res.json())
      setLoading(false)
    }
    load()
  }, [])

  const allAnswered = items.every((v) => v !== null)

  async function submit() {
    if (!allAnswered || submitting) return
    setSubmitting(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSubmitting(false); return }

    const res = await fetch('/api/twin/atlas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ type: 'hsp_score', hspItems: items }),
    })

    if (res.ok) {
      const d = await res.json()
      setResult({ before: d.sigma_before, after: d.sigma_after, avg: d.hsp_average })
      setCurrent({ sigma: d.sigma_after, source: 'self_report', hsp_score: d.hsp_average, observation_n: 0, updated_at: new Date().toISOString() })
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 text-sm">読み込み中...</div>
      </div>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors mb-8 block">
        ← Solnova Lab
      </Link>

      <div className="mb-10">
        <div className="text-xs tracking-widest text-amber-400 uppercase mb-2">Atlas</div>
        <h1 className="text-3xl font-light text-white mb-2">感受性を記録</h1>
        <p className="text-gray-500 text-sm">
          HSP-8 に答えると、あなたのツインの個体差スケール σ_u が更新されます。
          高感受性の人ほど、同じ出来事に対しても Layer III (感情) への影響が大きく推定されます。
        </p>
      </div>

      {current && (
        <div className="mb-8 p-4 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">現在の σ_u</div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-light text-white">{current.sigma.toFixed(2)}</span>
            <span className="text-xs text-gray-500">
              source: {current.source}
              {current.hsp_score != null && (
                <span> · HSP={current.hsp_score.toFixed(1)}</span>
              )}
            </span>
          </div>
          <div className="text-xs text-gray-600 mt-2">範囲: 0.70 (低感受) 〜 1.40 (高感受)</div>
        </div>
      )}

      <section className="mb-8 space-y-5">
        {HSP_QUESTIONS.map((q, i) => (
          <div key={i} className="p-4 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-sm text-gray-300 mb-3 leading-relaxed">{i + 1}. {q}</p>
            <div className="flex gap-1.5">
              {[1,2,3,4,5,6,7].map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    const next = [...items]
                    next[i] = n
                    setItems(next)
                  }}
                  className="flex-1 h-9 rounded-md text-xs transition-colors"
                  style={{
                    background: items[i] === n ? '#f59e0b' : 'rgba(255,255,255,0.04)',
                    color: items[i] === n ? '#fff' : '#9ca3af',
                    border: items[i] === n ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-700 mt-1.5 px-1">
              <span>全くあてはまらない</span>
              <span>とてもあてはまる</span>
            </div>
          </div>
        ))}
      </section>

      <button
        onClick={submit}
        disabled={!allAnswered || submitting}
        className="w-full py-3 rounded-full text-sm font-medium transition-opacity disabled:opacity-40"
        style={{ background: '#f59e0b', color: '#fff' }}
      >
        {submitting ? '送信中...' : 'σ_u を更新する'}
      </button>

      {result && (
        <div className="mt-6 p-5 rounded-2xl" style={{ border: '1px solid rgba(245,158,11,0.30)', background: 'rgba(245,158,11,0.05)' }}>
          <p className="text-xs text-amber-400 uppercase tracking-widest mb-2">更新完了</p>
          <div className="text-sm text-gray-300">
            <div className="flex items-baseline gap-2">
              <span className="text-gray-500">{result.before.toFixed(3)}</span>
              <span className="text-gray-700">→</span>
              <span className="text-2xl font-light text-white">{result.after.toFixed(3)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              HSP-8 平均 {result.avg.toFixed(2)} から σ_u を Bayesian ブレンドしました。
              今後の寄与はこの個体差を反映した重みで作用します。
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
