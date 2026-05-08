'use client'
import Link from 'next/link'

const CARDS = [
  { href: '/twin',      label: 'Digital Twin',  desc: 'あなたの 12 軸ツイン (v0.1 リダー)',                color: '#6366f1' },
  { href: '/profile',   label: 'Profile',       desc: '13 軸 Morpho Profile (SUST v0.3)',          color: '#8b5cf6' },
  { href: '/mirror',    label: 'Mirror',        desc: 'insight カードへのフィードバック',          color: '#ec4899' },
  { href: '/narrative', label: 'Narrative',     desc: '今の自分を記録 (M 軸・一言ジャーナル)',  color: '#10b981' },
  { href: '/atlas',     label: 'Atlas',         desc: '感受性を記録 (HSP-8 → σ_u)',                 color: '#f59e0b' },
]

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <header className="mb-12">
        <div className="text-xs tracking-widest text-gray-500 uppercase mb-3">Solnova Lab</div>
        <h1 className="text-4xl font-light text-white mb-3">あなたをもう一人作る</h1>
        <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
          Solnova は 13 軸の Morpho Profile であなたの「デジタルツイン」を構築し、
          複数アプリを横断してあなた自身のパターンを提示します。
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="p-5 rounded-2xl transition-all hover:scale-[1.02]"
            style={{
              border: `1px solid ${c.color}25`,
              background: `${c.color}05`,
            }}
          >
            <div className="text-xs uppercase tracking-widest mb-2" style={{ color: c.color }}>
              {c.label}
            </div>
            <div className="text-sm text-gray-300">{c.desc}</div>
          </Link>
        ))}
      </section>

      <footer className="mt-16 pt-6 text-xs text-gray-700" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        SUST v0.3 · Phase 2 · 8 contributing apps + narrative + atlas + mirror
      </footer>
    </main>
  )
}
