'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type InsightFeedback = 'resonated' | 'misaligned' | 'unsure'

interface InsightAction {
  kind: string
  label: string
  app?: string
}

interface InsightRow {
  id: string
  type: string
  trigger: string
  axes_referenced: string[]
  hypothesis_id: string | null
  confidence: number
  title: string
  body: string
  actions: InsightAction[]
  created_at: string
  expires_at: string
  feedback: InsightFeedback | null
  feedback_at: string | null
  feedback_note: string | null
}

const TYPE_COLOR: Record<string, string> = {
  observation: '#6b7280',
  pattern:     '#6366f1',
  hypothesis:  '#8b5cf6',
  invitation:  '#10b981',
  caution:     '#f59e0b',
}

const TYPE_LABEL: Record<string, string> = {
  observation: '観察',
  pattern:     'パターン',
  hypothesis:  '仮説',
  invitation:  '誘い',
  caution:     '注意',
}

export default function MirrorPage() {
  const [insights, setInsights] = useState<InsightRow[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      let session = (await supabase.auth.getSession()).data.session
      if (!session) {
        await supabase.auth.signInAnonymously()
        session = (await supabase.auth.getSession()).data.session
      }
      if (!session) { setLoading(false); return }

      const { data } = await supabase
        .from('twin_insights')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      setInsights((data ?? []) as InsightRow[])
      setLoading(false)
    }
    load()
  }, [])

  async function submitFeedback(insightId: string, feedback: InsightFeedback) {
    setSubmitting(insightId)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSubmitting(null); return }

    const res = await fetch('/api/twin/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ insight_id: insightId, feedback }),
    })

    if (res.ok) {
      setInsights((prev) =>
        prev.map((it) =>
          it.id === insightId
            ? { ...it, feedback, feedback_at: new Date().toISOString() }
            : it,
        ),
      )
    }
    setSubmitting(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 text-sm">読み込み中...</div>
      </div>
    )
  }

  const pending = insights.filter((i) => !i.feedback)
  const reviewed = insights.filter((i) => !!i.feedback)

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors mb-8 block">
        ← Solnova Lab
      </Link>

      <div className="mb-10">
        <div className="text-xs tracking-widest text-indigo-400 uppercase mb-2">Mirror</div>
        <h1 className="text-3xl font-light text-white mb-2">気づきへのフィードバック</h1>
        <p className="text-gray-500 text-sm">
          ツインからの気づきカードに「しっくり来る / 違う / わからない」で答えると、
          推論パラメータがあなた向けに調整されていきます。
        </p>
      </div>

      {insights.length === 0 && (
        <div className="p-6 rounded-2xl text-center" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-gray-500 text-sm">
            まだ気づきカードがありません。アプリを使い始めると、ツインからの観察が届きます。
          </p>
        </div>
      )}

      {pending.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xs tracking-widest text-gray-600 uppercase mb-4">未回答 ({pending.length})</h2>
          <div className="space-y-4">
            {pending.map((i) => (
              <InsightCard
                key={i.id}
                insight={i}
                submitting={submitting === i.id}
                onFeedback={(f) => submitFeedback(i.id, f)}
              />
            ))}
          </div>
        </section>
      )}

      {reviewed.length > 0 && (
        <section>
          <h2 className="text-xs tracking-widest text-gray-600 uppercase mb-4">回答済み ({reviewed.length})</h2>
          <div className="space-y-3">
            {reviewed.map((i) => (
              <InsightCard
                key={i.id}
                insight={i}
                submitting={false}
                onFeedback={() => {}}
                compact
              />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

function InsightCard({
  insight,
  submitting,
  onFeedback,
  compact = false,
}: {
  insight: InsightRow
  submitting: boolean
  onFeedback: (f: InsightFeedback) => void
  compact?: boolean
}) {
  const color = TYPE_COLOR[insight.type] ?? '#6366f1'
  const label = TYPE_LABEL[insight.type] ?? insight.type

  return (
    <div
      className="p-5 rounded-2xl"
      style={{
        border: `1px solid ${color}30`,
        background: insight.feedback ? 'rgba(255,255,255,0.015)' : `${color}05`,
        opacity: insight.feedback ? 0.65 : 1,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: `${color}20`, color }}
        >
          {label}
        </span>
        <span className="text-xs text-gray-600">
          {insight.axes_referenced.join(' / ')}
        </span>
        {insight.hypothesis_id && (
          <span className="text-xs text-gray-700">{insight.hypothesis_id}</span>
        )}
        <span className="text-xs text-gray-700 ml-auto">
          信頼度 {Math.round(insight.confidence * 100)}%
        </span>
      </div>

      <h3 className="text-base font-medium text-white mb-2">{insight.title}</h3>
      {!compact && (
        <p className="text-gray-300 text-sm leading-relaxed mb-4">{insight.body}</p>
      )}

      {insight.feedback ? (
        <div className="text-xs text-gray-500">
          {insight.feedback === 'resonated'  && '→ しっくり来た'}
          {insight.feedback === 'misaligned' && '→ 違うと感じた'}
          {insight.feedback === 'unsure'     && '→ わからない'}
          {insight.feedback_at && (
            <span className="text-gray-700 ml-2">
              ({new Date(insight.feedback_at).toLocaleDateString('ja-JP')})
            </span>
          )}
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          <FeedbackButton
            label="しっくり来る"
            onClick={() => onFeedback('resonated')}
            disabled={submitting}
            variant="resonated"
          />
          <FeedbackButton
            label="違う"
            onClick={() => onFeedback('misaligned')}
            disabled={submitting}
            variant="misaligned"
          />
          <FeedbackButton
            label="わからない"
            onClick={() => onFeedback('unsure')}
            disabled={submitting}
            variant="unsure"
          />
        </div>
      )}
    </div>
  )
}

function FeedbackButton({
  label, onClick, disabled, variant,
}: {
  label: string
  onClick: () => void
  disabled: boolean
  variant: 'resonated' | 'misaligned' | 'unsure'
}) {
  const colors = {
    resonated:  { fg: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.3)'  },
    misaligned: { fg: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.3)'  },
    unsure:     { fg: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.3)' },
  }[variant]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1.5 rounded-full text-xs transition-opacity disabled:opacity-50"
      style={{ color: colors.fg, background: colors.bg, border: `1px solid ${colors.border}` }}
    >
      {label}
    </button>
  )
}
