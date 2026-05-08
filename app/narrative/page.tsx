'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface NarrativeEntry {
  id: string
  payload: { type?: string; text?: string; rating?: number }
  server_ts: string
}

export default function NarrativePage() {
  const [text, setText] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [entries, setEntries] = useState<NarrativeEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      let session = (await supabase.auth.getSession()).data.session
      if (!session) {
        await supabase.auth.signInAnonymously()
        session = (await supabase.auth.getSession()).data.session
      }
      if (!session) { setLoading(false); return }

      const { data } = await supabase
        .from('twin_contributions')
        .select('id, payload, server_ts')
        .eq('user_id', session.user.id)
        .eq('app', 'narrative')
        .order('server_ts', { ascending: false })
        .limit(20)
      setEntries((data ?? []) as NarrativeEntry[])
      setLoading(false)
    }
    load()
  }, [])

  async function submitSelfNow() {
    if (!text.trim() || submitting) return
    setSubmitting(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSubmitting(false); return }

    const res = await fetch('/api/twin/contribute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        appId: 'narrative',
        data: {
          type: 'self_now',
          text: text.trim(),
          ...(rating !== null ? { consistencyRating: rating } : {}),
        },
      }),
    })

    if (res.ok) {
      // 一貫性評価も別途送る
      if (rating !== null) {
        await fetch('/api/twin/contribute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            appId: 'narrative',
            data: { type: 'consistency_check', rating },
          }),
        })
      }
      setSubmitted(true)
      setText('')
      setRating(null)
      // 一覧に追加
      setEntries((prev) => [
        { id: crypto.randomUUID(), payload: { type: 'self_now', text }, server_ts: new Date().toISOString() },
        ...prev,
      ])
      setTimeout(() => setSubmitted(false), 3000)
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
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors mb-8 block">
        ← Solnova Lab
      </Link>

      <div className="mb-10">
        <div className="text-xs tracking-widest text-emerald-400 uppercase mb-2">Narrative</div>
        <h1 className="text-3xl font-light text-white mb-2">今の自分を一言で</h1>
        <p className="text-gray-500 text-sm">
          一日 1 行、今の自分を記録しましょう。ツインの「自己物語整合性」(M 軸) の唯一のデータ源です。
        </p>
      </div>

      <section className="mb-12 p-6 rounded-2xl" style={{ border: '1px solid rgba(16,185,129,0.20)', background: 'rgba(16,185,129,0.04)' }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="例: 賠されていると感じるが、その中に今何かジッと静かさもある。"
          rows={3}
          maxLength={400}
          className="w-full rounded-xl px-4 py-3 text-sm bg-transparent text-white placeholder-gray-600 outline-none resize-none"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-600">{text.length} / 400</span>
        </div>

        <div className="mt-6">
          <p className="text-xs text-gray-500 mb-3">
            任意: 先週の自分と今週の自分は同じ人?
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(rating === n ? null : n)}
                className="w-10 h-10 rounded-full text-sm transition-colors"
                style={{
                  background: rating === n ? '#10b981' : 'rgba(255,255,255,0.04)',
                  color: rating === n ? '#fff' : '#9ca3af',
                  border: rating === n ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-700 mt-1 px-1">
            <span>全く違う</span>
            <span>同じ</span>
          </div>
        </div>

        <button
          onClick={submitSelfNow}
          disabled={!text.trim() || submitting}
          className="mt-6 px-5 py-2.5 rounded-full text-sm font-medium transition-opacity disabled:opacity-40"
          style={{ background: '#10b981', color: '#fff' }}
        >
          {submitting ? '送信中...' : '記録する'}
        </button>
        {submitted && (
          <p className="text-xs text-emerald-400 mt-3">ありがとうございます。 M 軸に寄与されました。</p>
        )}
      </section>

      {entries.length > 0 && (
        <section>
          <h2 className="text-xs tracking-widest text-gray-600 uppercase mb-4">過去の記録 ({entries.length})</h2>
          <div className="space-y-3">
            {entries.map((e) => (
              <div key={e.id} className="p-4 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                <div className="text-xs text-gray-600 mb-2">
                  {new Date(e.server_ts).toLocaleString('ja-JP')}
                  {e.payload.type === 'consistency_check' && (
                    <span className="ml-2 text-emerald-500">— 一貫性評価: {e.payload.rating}</span>
                  )}
                </div>
                {e.payload.text && (
                  <p className="text-sm text-gray-300 leading-relaxed">{e.payload.text}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
