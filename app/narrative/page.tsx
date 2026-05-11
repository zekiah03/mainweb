'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function NarrativePage() {
  const [text, setText] = useState('')
  const [rating, setRating] = useState(3)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!text.trim()) return
    setLoading(true)
    let session = (await supabase.auth.getSession()).data.session
    if (!session) {
      await supabase.auth.signInAnonymously()
      session = (await supabase.auth.getSession()).data.session
    }
    if (!session) { setLoading(false); return }

    await fetch('/api/twin/contribute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        app_id: 'narrative',
        raw_data: { text: text.trim(), consistency_rating: rating },
      }),
    })
    setDone(true)
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '52px 28px 80px' }}>

      <div className="fsi" style={{ animationDelay: '0.04s', marginBottom: 52 }}>
        <div style={{
          fontSize: 9, letterSpacing: '0.32em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.18)', marginBottom: 14,
        }}>
          Narrative
        </div>
        <h1 style={{
          fontSize: 26, fontWeight: 300,
          color: 'rgba(255,255,255,0.88)',
          margin: '0 0 14px 0', letterSpacing: '-0.015em',
        }}>
          今の自分を、一文で
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.28)', lineHeight: 1.8, margin: 0 }}>
          今日の自分を一文で表してください。<br />
          ツインの M軸（整合性）が更新されます。
        </p>
      </div>

      {done ? (
        <div className="fsi" style={{ animationDelay: '0.1s', textAlign: 'center', padding: '64px 0' }}>
          <div style={{ fontSize: 36, color: 'rgba(255,255,255,0.45)', marginBottom: 20 }}>◉</div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: 0 }}>記録しました。また明日。</p>
        </div>
      ) : (
        <>
          <div className="fsi" style={{ animationDelay: '0.12s', marginBottom: 28 }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="今日の自分は…"
              rows={5}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14,
                padding: '18px',
                color: 'rgba(255,255,255,0.85)',
                fontSize: 15, lineHeight: 1.75,
                resize: 'none', outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                transition: 'border 0.25s ease',
              }}
              onFocus={(e) => { e.target.style.border = '1px solid rgba(255,255,255,0.22)' }}
              onBlur={(e) => { e.target.style.border = '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div className="fsi" style={{ animationDelay: '0.2s', marginBottom: 36 }}>
            <div style={{
              fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)', marginBottom: 14,
            }}>
              今日の自分との一貫性
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  style={{
                    width: 44, height: 44, borderRadius: 11,
                    border: `1px solid rgba(255,255,255,${n <= rating ? '0.28' : '0.07'})`,
                    background: n <= rating ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
                    color: n <= rating ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.22)',
                    fontSize: 14, cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    boxShadow: n <= rating ? '0 0 12px rgba(255,255,255,0.06)' : 'none',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="fsi" style={{ animationDelay: '0.28s' }}>
            <button
              onClick={submit}
              disabled={!text.trim() || loading}
              style={{
                padding: '13px 32px', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.15)',
                background: text.trim() ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
                color: text.trim() ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)',
                fontSize: 13, cursor: text.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.25s ease', letterSpacing: '0.05em',
                boxShadow: text.trim() ? '0 0 20px rgba(255,255,255,0.04)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!text.trim()) return
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.25)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.15)'
                e.currentTarget.style.background = text.trim() ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)'
              }}
            >
              {loading ? '送信中…' : '記録する'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
