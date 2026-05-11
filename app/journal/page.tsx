'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Contribution {
  id: string
  app: string
  contributed_at: string
  payload: Record<string, unknown>
}

const APP_COLOR: Record<string, string> = {
  resonance: '#ef4444', feelings: '#f97316', 'how-feelings-work': '#eab308',
  valuse: '#84cc16', pazst: '#10b981', minus: '#06b6d4',
  gap: '#6366f1', evolve: '#a855f7', narrative: '#ec4899',
  atlas: '#f59e0b', mirror: '#8b5cf6', daily: '#94a3b8',
}

function summarize(payload: Record<string, unknown>): string {
  const t = (payload as { type?: string }).type
  if (typeof t === 'string') return t
  const keys = Object.keys(payload).slice(0, 3)
  return keys.join(', ')
}

export default function JournalPage() {
  const [items, setItems] = useState<Contribution[]>([])
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
        .select('id, app, contributed_at, payload')
        .eq('user_id', session.user.id)
        .order('contributed_at', { ascending: false })
        .limit(200)
      setItems((data ?? []) as Contribution[])
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

  const byDate: Record<string, Contribution[]> = {}
  for (const c of items) {
    const d = new Date(c.contributed_at).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })
    if (!byDate[d]) byDate[d] = []
    byDate[d].push(c)
  }

  const apps = Array.from(new Set(items.map((c) => c.app)))

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10">
        <div className="text-xs tracking-widest text-cyan-400 uppercase mb-2">Journal</div>
        <h1 className="text-3xl font-light text-white mb-2">全アプリ横断の記録</h1>
        <p className="text-gray-500 text-sm">
          あなたが何らかのアプリで記録したものが、ここに並びます。
        </p>
      </div>

      {items.length === 0 && (
        <div className="p-6 rounded-2xl text-center" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-gray-500 text-sm">まだ記録がありません。</p>
          <Link href="/" className="inline-block mt-4 text-xs text-cyan-400 hover:text-cyan-300">アプリを見る →</Link>
        </div>
      )}

      {apps.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {apps.map((app) => (
            <span key={app} className="text-xs px-2.5 py-1 rounded-full"
                  style={{ border: `1px solid ${(APP_COLOR[app] ?? '#6b7280')}30`, color: APP_COLOR[app] ?? '#9ca3af' }}>
              {app} · {items.filter((c) => c.app === app).length}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-8">
        {Object.entries(byDate).map(([date, dayItems]) => (
          <section key={date}>
            <div className="text-xs tracking-wider text-gray-600 uppercase mb-3">{date}</div>
            <div className="space-y-2">
              {dayItems.map((c) => {
                const color = APP_COLOR[c.app] ?? '#6b7280'
                return (
                  <div key={c.id} className="p-3 rounded-xl flex items-center gap-3"
                       style={{ border: `1px solid ${color}20`, background: `${color}05` }}>
                    <span className="text-xs font-mono" style={{ color, minWidth: 90 }}>{c.app}</span>
                    <span className="text-sm text-gray-300 flex-1 truncate">{summarize(c.payload)}</span>
                    <span className="text-xs text-gray-700 tabular-nums">
                      {new Date(c.contributed_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
