'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const QUESTIONS = [
  '細かいことに気づきやすい',
  '他人の気分に影響されやすい',
  '芸術や音楽に深く感動する',
  '騒がしい場所では疲れやすい',
  '一度に多くのことが起きると不快になる',
  '豊かな内面生活がある',
  '強い山激（音・光など）に敏感',
  '物事を深く考えてから行動する',
]

export default function AtlasPage() {
  const [answers, setAnswers] = useState<number[]>(new Array(8).fill(4))
  const [sigma, setSigma] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit() {
    setLoading(true)
    let session = (await supabase.auth.getSession()).data.session
    if (!session) {
      await supabase.auth.signInAnonymously()
      session = (await supabase.auth.getSession()).data.session
    }
    if (!session) { setLoading(false); return }

    const avg = answers.reduce((a, b) => a + b, 0) / answers.length
    const sigmaNew = parseFloat((0.7 + (avg - 1) / 6 * 0.7).toFixed(3))

    const res = await fetch('/api/twin/contribute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        app_id: 'atlas',
        raw_data: { answers, hsp_avg: avg, sigma_estimate: sigmaNew },
      }),
    })

    if (res.ok) setSigma(sigmaNew)
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '52px 28px 80px' }}>

      <div className="fsi" style={{ animationDelay: '0.04s', marginBottom: 52 }}>
        <div style={{
          fontSize: 9, letterSpacing: '0.32em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.18)', marginBottom: 14,
        }}>
          Atlas · HSP-8
        </div>
        <h1 style={{
          fontSize: 26, fontWeight: 300,
          color: 'rgba(255,255,255,0.88)',
          margin: '0 0 14px 0', letterSpacing: '-0.015em',
        }}>
          感受性を記録する
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.28)', lineHeight: 1.8, margin: 0 }}>
          8つの質問に 1～7 で答えてください。<br />
          あなたの個体差 σᵤ が更新されます。
        </p>
      </div>

      {sigma !== null ? (
        <div className="fsi" style={{ animationDelay: '0.08s', textAlign: 'center', padding: '60px 0' }}>
          <div style={{
            fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.25)', marginBottom: 16,
          }}>
            σᵤ UPDATED
          </div>
          <div style={{
            fontSize: 56, fontWeight: 200,
            color: 'rgba(255,255,255,0.88)',
            letterSpacing: '-0.02em',
            textShadow: '0 0 40px rgba(255,255,255,0.2)',
          }}>
            {sigma.toFixed(3)}
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', marginTop: 20 }}>
            個体差パラメータが更新されました
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 44 }}>
            {QUESTIONS.map((q, i) => (
              <div key={i} className="fsi" style={{ animationDelay: `${0.1 + i * 0.06}s` }}>
                <div style={{
                  fontSize: 13, color: 'rgba(255,255,255,0.62)',
                  marginBottom: 12, lineHeight: 1.55,
                  display: 'flex', alignItems: 'baseline', gap: 10,
                }}>
                  <span style={{
                    fontSize: 9, letterSpacing: '0.1em',
                    color: 'rgba(255,255,255,0.22)', flexShrink: 0,
                  }}>
                    Q{i + 1}
                  </span>
                  {q}
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <button
                      key={n}
                      onClick={() => {
                        const next = [...answers]
                        next[i] = n
                        setAnswers(next)
                      }}
                      style={{
                        flex: 1, height: 36, borderRadius: 8,
                        border: `1px solid rgba(255,255,255,${answers[i] === n ? '0.28' : '0.06'})`,
                        background: answers[i] === n ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.02)',
                        color: answers[i] === n ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
                        fontSize: 12, cursor: 'pointer',
                        transition: 'all 0.16s ease',
                        boxShadow: answers[i] === n ? '0 0 10px rgba(255,255,255,0.05)' : 'none',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.05em' }}>あてはまらない</span>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.05em' }}>とてもあてはまる</span>
                </div>
              </div>
            ))}
          </div>

          <div className="fsi" style={{ animationDelay: '0.6s' }}>
            <button
              onClick={submit}
              disabled={loading}
              style={{
                padding: '13px 32px', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.82)',
                fontSize: 13, cursor: 'pointer',
                transition: 'all 0.25s ease', letterSpacing: '0.05em',
                opacity: loading ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.25)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.15)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
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
