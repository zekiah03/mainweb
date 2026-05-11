'use client'

const VIEWERS = [
  { href: '/profile', label: 'Profile', sub: '13軸ツインの現在地',       glyph: '◉', delay: 0.18 },
  { href: '/mirror',  label: 'Mirror',  sub: '気づきへのフィードバック', glyph: '◈', delay: 0.26 },
  { href: '/journal', label: 'Journal', sub: '全アプリ横断の観測ログ',   glyph: '≡', delay: 0.34 },
]

const APPS = [
  { id: 'resonance',         label: 'resonance',         desc: '感情パターン',       url: 'https://resonance-eta-woad.vercel.app' },
  { id: 'feelings',          label: 'feelings',          desc: '感情の自由記述',     url: 'https://feelings-tawny.vercel.app' },
  { id: 'how-feelings-work', label: 'how-feelings-work', desc: '感情の理由を考察',   url: 'https://how-feelings-work.vercel.app' },
  { id: 'valuse',            label: 'valuse',            desc: '価値の階層',         url: 'https://valuse.vercel.app' },
  { id: 'pazst',             label: 'pazst',             desc: '日常の選択',         url: 'https://pazst.vercel.app' },
  { id: 'minus',             label: 'minus',             desc: '手放す',             url: 'https://minus-kappa.vercel.app' },
  { id: 'gap',               label: 'gap',               desc: '言いたいこと',       url: 'https://gap-steel.vercel.app' },
  { id: 'evolve',            label: 'evolve',            desc: '成長の記録',         url: 'https://evolve-zekiahandales-6710s-projects.vercel.app' },
  { id: 'narrative',         label: 'narrative',         desc: '今の自分を一文で',   url: '#' },
  { id: 'atlas',             label: 'atlas',             desc: '感受性を記録',       url: '#' },
  { id: 'lie',               label: 'lie',               desc: 'ついた嘘を振り返る', url: 'https://lie-six.vercel.app' },
]

function ViewerCard({ href, label, sub, glyph, delay }: typeof VIEWERS[0]) {
  return (
    <a
      href={href}
      className="fsi"
      style={{
        animationDelay: `${delay}s`,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        padding: '26px 22px',
        borderRadius: 18,
        textDecoration: 'none',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.025)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.35)',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        const s = e.currentTarget.style
        s.border = '1px solid rgba(255,255,255,0.22)'
        s.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.09), 0 0 0 1px rgba(255,255,255,0.07), 0 16px 48px rgba(255,255,255,0.06), 0 0 80px rgba(255,255,255,0.03)'
        s.background = 'rgba(255,255,255,0.05)'
        s.transform = 'translateY(-4px) scale(1.01)'
      }}
      onMouseLeave={(e) => {
        const s = e.currentTarget.style
        s.border = '1px solid rgba(255,255,255,0.08)'
        s.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.35)'
        s.background = 'rgba(255,255,255,0.025)'
        s.transform = 'translateY(0) scale(1)'
      }}
    >
      <div style={{
        fontSize: 32,
        color: 'rgba(255,255,255,0.55)',
        marginBottom: 20,
        lineHeight: 1,
        textShadow: '0 0 24px rgba(255,255,255,0.4)',
      }}>
        {glyph}
      </div>
      <div style={{
        fontSize: 10,
        letterSpacing: '0.24em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 10,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 12,
        color: 'rgba(255,255,255,0.32)',
        lineHeight: 1.65,
      }}>
        {sub}
      </div>
    </a>
  )
}

function AppCard({ id, label, desc, url }: typeof APPS[0], delay: number) {
  const ready = url !== '#'

  const inner = (
    <>
      <div style={{
        width: 6, height: 6,
        borderRadius: '50%',
        background: ready ? 'rgba(255,255,255,0.7)' : 'transparent',
        border: ready ? 'none' : '1px solid rgba(255,255,255,0.2)',
        boxShadow: ready ? '0 0 6px rgba(255,255,255,0.6), 0 0 14px rgba(255,255,255,0.25)' : 'none',
        marginBottom: 10,
      }} />
      <div style={{
        fontSize: 11,
        fontFamily: '"SF Mono", "Fira Code", monospace',
        color: ready ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.2)',
        marginBottom: 5,
        letterSpacing: '0.04em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', lineHeight: 1.45 }}>
        {desc}
      </div>
      {!ready && (
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.12)', marginTop: 8, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          準備中
        </div>
      )}
    </>
  )

  const base: React.CSSProperties = {
    display: 'block',
    padding: '14px',
    borderRadius: 14,
    border: `1px solid rgba(255,255,255,${ready ? '0.08' : '0.04'})`,
    background: `rgba(255,255,255,${ready ? '0.025' : '0.01'})`,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: ready ? '0 4px 16px rgba(0,0,0,0.2)' : 'none',
    transition: 'all 0.32s cubic-bezier(0.16,1,0.3,1)',
    opacity: ready ? 1 : 0.38,
    textDecoration: 'none',
    cursor: ready ? 'pointer' : 'not-allowed',
  }

  if (!ready) return <div key={id} style={base}>{inner}</div>

  return (
    <a
      key={id}
      href={url}
      target="_blank"
      rel="noreferrer"
      style={base}
      onMouseEnter={(e) => {
        const s = e.currentTarget.style
        s.border = '1px solid rgba(255,255,255,0.2)'
        s.boxShadow = '0 0 0 1px rgba(255,255,255,0.06), 0 8px 28px rgba(255,255,255,0.05), 0 0 40px rgba(255,255,255,0.03)'
        s.transform = 'translateY(-2px) scale(1.015)'
        s.background = 'rgba(255,255,255,0.05)'
      }}
      onMouseLeave={(e) => {
        const s = e.currentTarget.style
        s.border = '1px solid rgba(255,255,255,0.08)'
        s.boxShadow = '0 4px 16px rgba(0,0,0,0.2)'
        s.transform = 'translateY(0) scale(1)'
        s.background = 'rgba(255,255,255,0.025)'
      }}
    >
      {inner}
    </a>
  )
}

export default function Home() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '52px 28px 70px' }}>

      {/* Header */}
      <div className="fsi" style={{ animationDelay: '0.04s', marginBottom: 56 }}>
        <div style={{
          fontSize: 9, letterSpacing: '0.34em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.18)', marginBottom: 14,
        }}>
          Digital Twin Hub
        </div>
        <h1 style={{
          fontSize: 27, fontWeight: 300, margin: '0 0 14px 0',
          color: 'rgba(255,255,255,0.88)', letterSpacing: '-0.018em', lineHeight: 1.3,
        }}>
          もうひとりの自分を、育てる
        </h1>
        <p style={{
          fontSize: 13, color: 'rgba(255,255,255,0.28)',
          lineHeight: 1.85, maxWidth: 420, margin: 0,
        }}>
          複数のアプリで記録したものが、ひとつのツインに集められます。<br />
          このページでは、その動きを見るだけ。
        </p>
      </div>

      {/* Viewers */}
      <section style={{ marginBottom: 56 }}>
        <div
          className="fsi"
          style={{
            animationDelay: '0.13s',
            fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.16)', marginBottom: 18,
          }}
        >
          ツインを見る
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {VIEWERS.map((v) => <ViewerCard key={v.href} {...v} />)}
        </div>
      </section>

      {/* Apps */}
      <section>
        <div
          className="fsi"
          style={{
            animationDelay: '0.42s',
            fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.16)', marginBottom: 18,
          }}
        >
          アプリで記録する
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {APPS.map((a, i) => (
            <div
              key={a.id}
              className="fsi"
              style={{ animationDelay: `${0.46 + i * 0.065}s` }}
            >
              {AppCard(a, 0.46 + i * 0.065)}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
