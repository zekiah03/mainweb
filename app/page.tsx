'use client'
import Link from 'next/link'

const VIEWERS = [
  { href: '/profile', label: 'Profile', desc: '13軸ツインの現在地',         color: '#8b5cf6' },
  { href: '/mirror',  label: 'Mirror',  desc: '気づきへのフィードバック',     color: '#ec4899' },
  { href: '/journal', label: 'Journal', desc: '全アプリ横断の観測ログ',     color: '#06b6d4' },
]

const APPS = [
  { id: 'resonance',         label: 'resonance',         desc: '感情パターン',           color: '#ef4444', url: 'https://resonance-eta-woad.vercel.app' },
  { id: 'feelings',          label: 'feelings',          desc: '感情の自由記述',         color: '#f97316', url: 'https://feelings-tawny.vercel.app' },
  { id: 'how-feelings-work', label: 'how-feelings-work', desc: '感情の理由を考察',       color: '#eab308', url: 'https://how-feelings-work.vercel.app' },
  { id: 'valuse',            label: 'valuse',            desc: '価値の階層',             color: '#84cc16', url: 'https://valuse.vercel.app' },
  { id: 'pazst',             label: 'pazst',             desc: '日常の選択',             color: '#10b981', url: 'https://pazst.vercel.app' },
  { id: 'minus',             label: 'minus',             desc: '手放す',                 color: '#06b6d4', url: 'https://minus-kappa.vercel.app' },
  { id: 'gap',               label: 'gap',               desc: '言いたいこと',           color: '#6366f1', url: 'https://gap-steel.vercel.app' },
  { id: 'evolve',            label: 'evolve',            desc: '成長の記録',             color: '#a855f7', url: 'https://evolve-zekiahandales-6710s-projects.vercel.app' },
  { id: 'narrative',         label: 'narrative',         desc: '今の自分を一文で',       color: '#ec4899', url: '#' },
  { id: 'atlas',             label: 'atlas',             desc: '感受性を記録 (HSP-8)',   color: '#f59e0b', url: '#' },
  { id: 'lie',               label: 'lie',               desc: 'ついた嘘を振り返る',     color: '#64748b', url: 'https://lie-six.vercel.app' },
]

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      <header className="mb-10">
        <div className="text-xs tracking-widest text-gray-500 uppercase mb-3">Solnova</div>
        <h1 className="text-3xl sm:text-4xl font-light text-white mb-3">もうひとりの自分を、育てる</h1>
        <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
          複数のアプリで記録したものが、Solnova 上でひとつのツインに集められます。
          このページでは、その動きを見るだけ。記録は下のアプリたちで行います。
        </p>
      </header>

      {/* Twin viewers */}
      <section className="mb-12">
        <h2 className="text-xs tracking-widest text-gray-600 uppercase mb-4">ツインを見る</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {VIEWERS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="p-4 rounded-2xl transition-all hover:scale-[1.02]"
              style={{ border: `1px solid ${c.color}25`, background: `${c.color}05` }}
            >
              <div className="text-xs uppercase tracking-widest mb-2" style={{ color: c.color }}>{c.label}</div>
              <div className="text-sm text-gray-300">{c.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Satellite apps */}
      <section>
        <h2 className="text-xs tracking-widest text-gray-600 uppercase mb-4">アプリで記録する</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {APPS.map((a) => (
            a.url === '#'
              ? (
                <div
                  key={a.id}
                  className="p-3 rounded-xl opacity-40 cursor-not-allowed"
                  style={{ border: `1px solid ${a.color}20`, background: `${a.color}04` }}
                >
                  <div className="text-xs font-mono mb-1" style={{ color: a.color }}>{a.label}</div>
                  <div className="text-xs text-gray-500">{a.desc}</div>
                  <div className="text-xs text-gray-600 mt-1">準備中</div>
                </div>
              ) : (
                <a
                  key={a.id}
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ border: `1px solid ${a.color}20`, background: `${a.color}04` }}
                >
                  <div className="text-xs font-mono mb-1" style={{ color: a.color }}>{a.label}</div>
                  <div className="text-xs text-gray-500">{a.desc}</div>
                </a>
              )
          ))}
        </div>
      </section>

      <footer className="mt-16 pt-6 text-xs text-gray-700" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        SUST v0.3 · Aggregator-type · 11 satellite apps + 3 viewers
      </footer>
    </main>
  )
}
