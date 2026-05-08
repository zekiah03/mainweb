import Link from 'next/link'
import { APPS } from '@/lib/app-mappings'
import { AXIS_META, AXIS_KEYS } from '@/lib/twin-types'

const CATEGORY_LABELS = {
  diagnosis: '診断',
  record: '記録',
  research: '探索・研究',
  game: 'ゲーム',
  service: 'サービス',
} as const

type Category = keyof typeof CATEGORY_LABELS
const CATEGORIES: Category[] = ['diagnosis', 'record', 'research', 'game', 'service']

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="mb-16 text-center">
        <div className="text-xs tracking-[0.3em] text-indigo-400 uppercase mb-4">Solnova Lab</div>
        <h1 className="text-4xl font-light tracking-tight text-white mb-4">
          あなたを、理論にする。
        </h1>
        <p className="text-gray-400 max-w-md mx-auto">
          各アプリのデータが積み重なり、<br />
          あなたというエンティティの輪郭が浮かび上がる。
        </p>
      </header>

      {/* Digital Twin CTA */}
      <section className="mb-16">
        <Link href="/twin" className="block group">
          <div
            className="border rounded-2xl p-8 transition-all"
            style={{
              borderColor: 'rgba(99,102,241,0.3)',
              background: 'rgba(99,102,241,0.05)',
            }}
          >
            <div className="flex items-start justify-between gap-8">
              <div className="flex-1">
                <div className="text-xs tracking-widest text-indigo-400 uppercase mb-2">Digital Twin</div>
                <h2 className="text-2xl font-light text-white mb-3">あなたのデジタルツイン</h2>
                <p className="text-gray-400 text-sm max-w-md mb-5">
                  Morpho理論の12軸で構成されたあなたのプロファイル。
                  アプリを使うたびに精度が上がっていく。
                </p>
                <div className="flex flex-wrap gap-2">
                  {AXIS_KEYS.map(key => (
                    <span
                      key={key}
                      className="text-xs px-2 py-0.5 rounded-full border"
                      style={{
                        borderColor: `${AXIS_META[key].color}40`,
                        color: AXIS_META[key].color,
                        background: `${AXIS_META[key].color}10`,
                      }}
                    >
                      {key} {AXIS_META[key].labelJa}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-indigo-400 text-2xl mt-1 group-hover:translate-x-1 transition-transform">
                →
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* App Grid */}
      <section>
        <h2 className="text-xs tracking-widest text-gray-600 uppercase mb-8">Apps</h2>
        {CATEGORIES.map(cat => {
          const catApps = APPS.filter(a => a.category === cat)
          if (catApps.length === 0) return null
          return (
            <div key={cat} className="mb-10">
              <div className="text-xs text-gray-600 tracking-widest uppercase mb-4">
                {CATEGORY_LABELS[cat]}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {catApps.map(app => (
                  <a
                    key={app.id}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-xl transition-all group"
                    style={{
                      border: '1px solid rgba(255,255,255,0.05)',
                      background: 'rgba(255,255,255,0.01)',
                    }}
                  >
                    <div className="text-white font-medium mb-1">{app.title}</div>
                    <div className="text-gray-500 text-xs mb-3 leading-relaxed">{app.question}</div>
                    <div className="flex flex-wrap gap-1">
                      {app.primaryAxes.slice(0, 5).map(axis => (
                        <span
                          key={axis}
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{
                            background: `${AXIS_META[axis].color}15`,
                            color: AXIS_META[axis].color,
                          }}
                        >
                          {axis}
                        </span>
                      ))}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )
        })}
      </section>
    </main>
  )
}
