'use client'

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

const VIEWERS = [
  { href: '/profile', label: 'Profile', sub: '13軸ツインの現在地',       color: '#8b5cf6', glyph: '◉' },
  { href: '/mirror',  label: 'Mirror',  sub: '気づきへのフィードバック', color: '#ec4899', glyph: '◈' },
  { href: '/journal', label: 'Journal', sub: '全アプリ横断の観測ログ',   color: '#06b6d4', glyph: '≡' },
]

const APPS = [
  { id: 'resonance',         label: 'resonance',         desc: '感情パターン',         color: '#ef4444', url: 'https://resonance-eta-woad.vercel.app' },
  { id: 'feelings',          label: 'feelings',          desc: '感情の自由記述',       color: '#f97316', url: 'https://feelings-tawny.vercel.app' },
  { id: 'how-feelings-work', label: 'how-feelings-work', desc: '感情の理由を考察',     color: '#eab308', url: 'https://how-feelings-work.vercel.app' },
  { id: 'valuse',            label: 'valuse',            desc: '価値の階層',           color: '#84cc16', url: 'https://valuse.vercel.app' },
  { id: 'pazst',             label: 'pazst',             desc: '日常の選択',           color: '#10b981', url: 'https://pazst.vercel.app' },
  { id: 'minus',             label: 'minus',             desc: '手放す',               color: '#06b6d4', url: 'https://minus-kappa.vercel.app' },
  { id: 'gap',               label: 'gap',               desc: '言いたいこと',         color: '#6366f1', url: 'https://gap-steel.vercel.app' },
  { id: 'evolve',            label: 'evolve',            desc: '成長の記録',           color: '#a855f7', url: 'https://evolve-zekiahandales-6710s-projects.vercel.app' },
  { id: 'narrative',         label: 'narrative',         desc: '今の自分を一文で',     color: '#ec4899', url: '#' },
  { id: 'atlas',             label: 'atlas',             desc: '感受性を記録',         color: '#f59e0b', url: '#' },
  { id: 'lie',               label: 'lie',               desc: 'ついた嘘を振り返る',   color: '#64748b', url: 'https://lie-six.vercel.app' },
]

function ViewerCard({ href, label, sub, color, glyph }: typeof VIEWERS[0]) {
  const rgb = hexToRgb(color)
  return (
    <a
      href={href}
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        padding: '24px 22px',
        borderRadius: 18,
        textDecoration: 'none',
        border: `1px solid rgba(${rgb},0.18)`,
        background: `rgba(${rgb},0.04)`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: `0 0 0 1px rgba(${rgb},0.05), 0 8px 32px rgba(${rgb},0.06)`,
        transition: 'all 0.4s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        const s = e.currentTarget.style
        s.border = `1px solid rgba(${rgb},0.45)`
        s.boxShadow = `0 0 0 1px rgba(${rgb},0.18), 0 12px 48px rgba(${rgb},0.22), 0 0 80px rgba(${rgb},0.09)`
        s.transform = 'translateY(-3px)'
        s.background = `rgba(${rgb},0.07)`
      }}
      onMouseLeave={(e) => {
        const s = e.currentTarget.style
        s.border = `1px solid rgba(${rgb},0.18)`
        s.boxShadow = `0 0 0 1px rgba(${rgb},0.05), 0 8px 32px rgba(${rgb},0.06)`
        s.transform = 'translateY(0)'
        s.background = `rgba(${rgb},0.04)`
      }}
    >
      <div style={{
        fontSize: 30,
        color,
        opacity: 0.6,
        marginBottom: 18,
        lineHeight: 1,
        textShadow: `0 0 24px rgba(${rgb},0.7)`,
      }}>
        {glyph}
      </div>
      <div style={{
        fontSize: 10,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color,
        marginBottom: 10,
        opacity: 0.9,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 12,
        color: 'rgba(255,255,255,0.45)',
        lineHeight: 1.6,
      }}>
        {sub}
      </div>
    </a>
  )
}

function AppCard({ id, label, desc, color, url }: typeof APPS[0]) {
  const rgb = hexToRgb(color)
  const ready = url !== '#'

  const content = (
    <>
      <div style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: ready ? color : 'transparent',
        border: ready ? 'none' : `1px solid rgba(${rgb},0.3)`,
        boxShadow: ready ? `0 0 8px rgba(${rgb},0.8), 0 0 18px rgba(${rgb},0.35)` : 'none',
        marginBottom: 11,
        flexShrink: 0,
      }} />
      <div style={{
        fontSize: 11,
        fontFamily: '"SF Mono", "Fira Code", monospace',
        color: ready ? color : `rgba(${rgb},0.35)`,
        marginBottom: 5,
        letterSpacing: '0.04em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', lineHeight: 1.4 }}>
        {desc}
      </div>
      {!ready && (
        <div style={{
          fontSize: 9,
          color: 'rgba(255,255,255,0.14)',
          marginTop: 8,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          準備中
        </div>
      )}
    </>
  )

  const baseStyle: React.CSSProperties = {
    display: 'block',
    padding: '14px',
    borderRadius: 14,
    border: `1px solid rgba(${rgb},${ready ? '0.13' : '0.05'})`,
    background: `rgba(${rgb},${ready ? '0.03' : '0.01'})`,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: ready ? `0 0 0 1px rgba(${rgb},0.04), 0 4px 16px rgba(${rgb},0.04)` : 'none',
    transition: 'all 0.32s ease',
    opacity: ready ? 1 : 0.4,
    textDecoration: 'none',
    cursor: ready ? 'pointer' : 'not-allowed',
  }

  if (!ready) return <div style={baseStyle}>{content}</div>

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      style={baseStyle}
      onMouseEnter={(e) => {
        const s = e.currentTarget.style
        s.border = `1px solid rgba(${rgb},0.38)`
        s.boxShadow = `0 0 0 1px rgba(${rgb},0.14), 0 6px 24px rgba(${rgb},0.18), 0 0 48px rgba(${rgb},0.07)`
        s.transform = 'translateY(-1px)'
        s.background = `rgba(${rgb},0.06)`
      }}
      onMouseLeave={(e) => {
        const s = e.currentTarget.style
        s.border = `1px solid rgba(${rgb},0.13)`
        s.boxShadow = `0 0 0 1px rgba(${rgb},0.04), 0 4px 16px rgba(${rgb},0.04)`
        s.transform = 'translateY(0)'
        s.background = `rgba(${rgb},0.03)`
      }}
    >
      {content}
    </a>
  )
}

export default function Home() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '52px 28px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: 52 }}>
        <div style={{
          fontSize: 9,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.18)',
          marginBottom: 14,
        }}>
          Digital Twin Hub
        </div>
        <h1 style={{
          fontSize: 26,
          fontWeight: 300,
          color: 'rgba(255,255,255,0.88)',
          margin: '0 0 14px 0',
          letterSpacing: '-0.015em',
          lineHeight: 1.3,
        }}>
          もうひとりの自分を、育てる
        </h1>
        <p style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.3)',
          lineHeight: 1.8,
          maxWidth: 440,
          margin: 0,
        }}>
          複数のアプリで記録したものが、ひとつのツインに集められます。<br />
          このページでは、その動きを見るだけ。
        </p>
      </div>

      {/* Twin viewers */}
      <section style={{ marginBottom: 52 }}>
        <div style={{
          fontSize: 9,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.18)',
          marginBottom: 18,
        }}>
          ツインを見る
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {VIEWERS.map((v) => <ViewerCard key={v.href} {...v} />)}
        </div>
      </section>

      {/* Satellite apps */}
      <section>
        <div style={{
          fontSize: 9,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.18)',
          marginBottom: 18,
        }}>
          アプリで記録する
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
        }}>
          {APPS.map((a) => <AppCard key={a.id} {...a} />)}
        </div>
      </section>
    </div>
  )
}
