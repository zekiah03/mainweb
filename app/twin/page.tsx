'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { TwinProfile, AXIS_KEYS, AXIS_META, AxisKey } from '@/lib/twin-types'
import { TwinRadar } from '@/components/TwinRadar'
import { getAppsForAxis, getMostNeededApp } from '@/lib/app-mappings'

const EMPTY_AXES = Object.fromEntries(AXIS_KEYS.map(k => [k, 0])) as Record<AxisKey, number>
const EMPTY_CONF = Object.fromEntries(AXIS_KEYS.map(k => [k, 0])) as Record<AxisKey, number>

export default function TwinPage() {
  const [profile, setProfile] = useState<TwinProfile | null>(null)
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
        .from('twin_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle()
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [])

  const axes = (profile?.axes12 ?? EMPTY_AXES) as Record<AxisKey, number>
  const confidence = (profile?.axes12_confidence ?? EMPTY_CONF) as Record<AxisKey, number>
  const completeness = profile?.completeness ?? 0
  const nextApp = getMostNeededApp(axes, confidence)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 text-sm">読み込み中...</div>
      </div>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/"
        className="text-xs text-gray-600 hover:text-gray-400 transition-colors mb-8 block"
      >
        ← Solnova Lab
      </Link>

      <div className="mb-10">
        <div className="text-xs tracking-widest text-indigo-400 uppercase mb-2">Digital Twin</div>
        <h1 className="text-3xl font-light text-white mb-2">あなたのデジタルツイン</h1>
        {profile ? (
          <p className="text-gray-500 text-sm">完成度 {Math.round(completeness * 100)}%</p>
        ) : (
          <p className="text-gray-600 text-sm">まだデータがありません。アプリを使い始めると構築されていきます。</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Radar */}
        <div className="flex flex-col items-center justify-center py-4">
          <TwinRadar axes12={axes} confidence={confidence} size={280} />
          {profile?.catchphrase && (
            <p className="mt-5 text-center text-indigo-300 text-sm italic">&ldquo;{profile.catchphrase}&rdquo;</p>
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Completeness */}
          <div
            className="p-4 rounded-xl"
            style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
          >
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">完成度</div>
            <div className="flex items-end gap-1 mb-2">
              <span className="text-3xl font-light text-white">{Math.round(completeness * 100)}</span>
              <span className="text-gray-500 mb-0.5">%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${completeness * 100}%`, background: '#6366f1' }}
              />
            </div>
          </div>

          {/* Object Type */}
          {profile?.object_type && (
            <div
              className="p-4 rounded-xl"
              style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">オブジェクトタイプ</div>
              <div className="text-white">{profile.object_type}</div>
            </div>
          )}

          {/* Next App Recommendation */}
          {nextApp && (
            <div
              className="p-4 rounded-xl"
              style={{ border: '1px solid rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.05)' }}
            >
              <div className="text-xs text-indigo-400 uppercase tracking-widest mb-2">次のステップ</div>
              <div className="text-white text-sm font-medium mb-1">{nextApp.title}</div>
              <div className="text-gray-400 text-xs mb-3">{nextApp.axisPitch}</div>
              <a
                href={nextApp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                開く →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 12-Axis Detail Grid */}
      <div className="mb-12">
        <h2 className="text-xs tracking-widest text-gray-600 uppercase mb-6">12軸の詳細</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {AXIS_KEYS.map(key => {
            const val = axes[key] ?? 0
            const conf = confidence[key] ?? 0
            const relatedApp = getAppsForAxis(key)[0]
            return (
              <div
                key={key}
                className="p-3 rounded-xl transition-all"
                style={{
                  border: conf > 0.1
                    ? `1px solid ${AXIS_META[key].color}35`
                    : '1px solid rgba(255,255,255,0.04)',
                  background: conf > 0.1
                    ? `${AXIS_META[key].color}08`
                    : 'rgba(255,255,255,0.01)',
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color: AXIS_META[key].color }}>
                    {key}
                  </span>
                  <span className="text-xs text-gray-600">{val.toFixed(1)}</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">{AXIS_META[key].labelJa}</div>
                <div
                  className="h-1 rounded-full overflow-hidden mb-2"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(val / 10) * 100}%`,
                      background: AXIS_META[key].color,
                      opacity: conf > 0 ? 0.3 + conf * 0.7 : 0.15,
                    }}
                  />
                </div>
                {relatedApp && (
                  <div className="text-xs text-gray-700 truncate">{relatedApp.title}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Summary */}
      {profile?.summary && (
        <div
          className="p-6 rounded-2xl"
          style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="text-xs tracking-widest text-gray-500 uppercase mb-3">AI分析サマリー</div>
          <p className="text-gray-300 text-sm leading-relaxed">{profile.summary}</p>
        </div>
      )}
    </main>
  )
}
