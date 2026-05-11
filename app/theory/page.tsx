'use client'

const LAYERS = [
  {
    id: 'I', name: 'Substrate', nameJa: '基盤層', scale: '±年〜10年',
    color: '#a78bfa', bg: 'rgba(167,139,250,0.05)',
    axes: [
      { id: 'A', nameJa: '発達起源', name: 'Developmental Origin', dim: 12, tau: 3650, apps: ['evolve'] },
      { id: 'B', nameJa: '時間構造', name: 'Temporal Structure', dim: 9, tau: 365, apps: ['pazst'] },
      { id: 'C', nameJa: '覚醒段階', name: 'Awakening Phase', dim: 1, tau: 365, apps: ['evolve'] },
    ],
  },
  {
    id: 'II', name: 'Structural', nameJa: '構造層', scale: '±月〜年',
    color: '#60a5fa', bg: 'rgba(96,165,250,0.05)',
    axes: [
      { id: 'D', nameJa: 'ニーズ充足', name: 'Needs Satisfaction', dim: 10, tau: 180, apps: ['valuse','gap'] },
      { id: 'E', nameJa: '価値階層', name: 'Value Hierarchy', dim: 11, tau: 180, apps: ['valuse','pazst'] },
      { id: 'F', nameJa: '自他境界', name: 'Self-Boundary', dim: 6, tau: 180, apps: ['minus'] },
    ],
  },
  {
    id: 'III', name: 'Dynamic', nameJa: '動的層', scale: '±週〜月',
    color: '#34d399', bg: 'rgba(52,211,153,0.05)',
    axes: [
      { id: 'G', nameJa: '感情強度', name: 'Emotion Intensity', dim: 28, tau: 60, apps: ['resonance','feelings','how-feelings-work'] },
      { id: 'H', nameJa: '感情感受性', name: 'Emotion Sensitivity', dim: 28, tau: 60, apps: ['resonance','feelings'] },
      { id: 'I', nameJa: '感情持続', name: 'Emotion Duration', dim: 28, tau: 60, apps: ['resonance'] },
    ],
  },
  {
    id: 'IV', name: 'Expressive', nameJa: '表現層', scale: '±日〜週',
    color: '#fbbf24', bg: 'rgba(251,191,36,0.05)',
    axes: [
      { id: 'J', nameJa: '表現様式', name: 'Expression Style', dim: 4, tau: 30, apps: ['feelings','gap'] },
      { id: 'K', nameJa: '関係開放性', name: 'Relational Openness', dim: 5, tau: 30, apps: ['gap'] },
      { id: 'L', nameJa: '感情遷移', name: 'Emotion Transition', dim: 8, tau: 30, apps: ['resonance'] },
      { id: 'M', nameJa: '物語一貫性', name: 'Narrative Coherence', dim: 8, tau: 90, apps: ['narrative'] },
    ],
  },
]

const APPS_MAP = [
  { id: 'resonance',         nameJa: '感情パターン',       axes: ['G','H','I','L'] },
  { id: 'feelings',          nameJa: '感情の自由記述',     axes: ['G','H','J'] },
  { id: 'how-feelings-work', nameJa: '感情の理由を考察',   axes: ['G','H'] },
  { id: 'valuse',            nameJa: '価値の階層',         axes: ['D','E'] },
  { id: 'pazst',             nameJa: '日常の選択',         axes: ['B','E'] },
  { id: 'minus',             nameJa: '手放す',             axes: ['F'] },
  { id: 'gap',               nameJa: '言いたいこと',       axes: ['D','J','K'] },
  { id: 'evolve',            nameJa: '成長の記録',         axes: ['A','C'] },
  { id: 'narrative',         nameJa: '今の自分を一文で',   axes: ['M'] },
  { id: 'atlas',             nameJa: '感受性を記録',       axes: ['σ_u'] },
  { id: 'lie',               nameJa: 'ついた嘘を振り返る', axes: ['F','M'] },
]

const HYPOTHESES = [
  { id: 'SUST-1', axes: ['G','H','I'], desc: '感情強度・感受性・持続が2層以上で一致 → 自己テーマが存在する' },
  { id: 'SUST-2', axes: ['D','E'],     desc: 'ニーズ不満 + 価値乖離が持続 → 内的葛藤が顕在化' },
  { id: 'SUST-3', axes: ['C','H'],     desc: '覚醒段階が高いほど感情感受性が増幅する' },
  { id: 'SUST-4', axes: ['F','L'],     desc: '自他境界の低さは感情遷移の速さと相関する' },
  { id: 'SUST-5', axes: ['G','J'],     desc: '表現抑制が高い場合、実際の感情強度とのギャップが大きい' },
  { id: 'SUST-6', axes: ['A','H'],     desc: '発達期の環境スコアは感情感受性の基底を形成する' },
  { id: 'SUST-7', axes: ['M'],         desc: '物語一貫性が低い場合、アイデンティティの再構築が必要' },
]

const AXIS_COLORS: Record<string, string> = {
  A:'#a78bfa', B:'#a78bfa', C:'#a78bfa',
  D:'#60a5fa', E:'#60a5fa', F:'#60a5fa',
  G:'#34d399', H:'#34d399', I:'#34d399',
  J:'#fbbf24', K:'#fbbf24', L:'#fbbf24', M:'#fbbf24',
  'σ_u':'#60a5fa',
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ fontSize: 9, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>
      {children}
    </div>
  )
}

function FlowDiagram() {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.015)', padding: '8px 4px' }}>
      <svg viewBox="0 0 700 210" width="100%" style={{ minWidth: 560, display: 'block' }}>
        <defs>
          <marker id="arw" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <path d="M0,1 L6,3.5 L0,6 Z" fill="rgba(255,255,255,0.3)" />
          </marker>
          <marker id="arwb" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <path d="M0,1 L6,3.5 L0,6 Z" fill="rgba(96,165,250,0.55)" />
          </marker>
        </defs>

        {/* ── Apps ── */}
        <rect x="8" y="66" width="88" height="64" rx="10" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.13)" strokeWidth="1" />
        <text x="52" y="90" textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="11" fontFamily="sans-serif">衛星アプリ</text>
        <text x="52" y="107" textAnchor="middle" fill="rgba(255,255,255,0.38)" fontSize="10" fontFamily="sans-serif">× 11</text>
        <text x="52" y="123" textAnchor="middle" fill="rgba(255,255,255,0.22)" fontSize="9" fontFamily="sans-serif">resonance, feelings…</text>

        <line x1="98" y1="98" x2="134" y2="98" stroke="rgba(255,255,255,0.28)" strokeWidth="1" markerEnd="url(#arw)" />

        {/* ── Contribution API ── */}
        <rect x="136" y="78" width="108" height="40" rx="9" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <text x="190" y="95" textAnchor="middle" fill="rgba(255,255,255,0.68)" fontSize="10.5" fontFamily="sans-serif">Contribution</text>
        <text x="190" y="110" textAnchor="middle" fill="rgba(255,255,255,0.68)" fontSize="10.5" fontFamily="sans-serif">API</text>

        <line x1="246" y1="98" x2="282" y2="98" stroke="rgba(255,255,255,0.28)" strokeWidth="1" markerEnd="url(#arw)" />

        {/* ── Projection ── */}
        <rect x="284" y="78" width="102" height="40" rx="9" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <text x="335" y="95" textAnchor="middle" fill="rgba(255,255,255,0.68)" fontSize="10.5" fontFamily="sans-serif">Projection</text>
        <text x="335" y="110" textAnchor="middle" fill="rgba(255,255,255,0.38)" fontSize="9" fontFamily="sans-serif">+ Bayes Update</text>

        {/* ── σ_u ── */}
        <rect x="302" y="152" width="66" height="36" rx="8" fill="rgba(96,165,250,0.08)" stroke="rgba(96,165,250,0.32)" strokeWidth="1" />
        <text x="335" y="168" textAnchor="middle" fill="rgba(96,165,250,0.9)" fontSize="13" fontFamily="sans-serif">σ_u</text>
        <text x="335" y="182" textAnchor="middle" fill="rgba(96,165,250,0.5)" fontSize="8.5" fontFamily="sans-serif">個体感受性</text>
        <line x1="335" y1="152" x2="335" y2="120" stroke="rgba(96,165,250,0.45)" strokeWidth="1" strokeDasharray="3 2" markerEnd="url(#arwb)" />

        <line x1="388" y1="98" x2="424" y2="98" stroke="rgba(255,255,255,0.28)" strokeWidth="1" markerEnd="url(#arw)" />

        {/* ── Morpho Profile ── */}
        <rect x="426" y="66" width="110" height="64" rx="10" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.13)" strokeWidth="1" />
        <text x="481" y="89" textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="11" fontFamily="sans-serif">Morpho</text>
        <text x="481" y="105" textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="11" fontFamily="sans-serif">Profile</text>
        <text x="481" y="122" textAnchor="middle" fill="rgba(255,255,255,0.32)" fontSize="9" fontFamily="sans-serif">13軸 × N次元</text>

        <line x1="538" y1="98" x2="574" y2="98" stroke="rgba(255,255,255,0.28)" strokeWidth="1" markerEnd="url(#arw)" />

        {/* ── Hypotheses + Insights ── */}
        <rect x="576" y="66" width="112" height="64" rx="10" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
        <text x="632" y="89" textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="10.5" fontFamily="sans-serif">仮説エンジン</text>
        <text x="632" y="105" textAnchor="middle" fill="rgba(255,255,255,0.38)" fontSize="9.5" fontFamily="sans-serif">SUST-1〜10</text>
        <text x="632" y="122" textAnchor="middle" fill="rgba(255,255,255,0.28)" fontSize="9" fontFamily="sans-serif">→ Insight Card</text>

        {/* Legend */}
        <line x1="302" y1="200" x2="316" y2="200" stroke="rgba(96,165,250,0.45)" strokeWidth="1" strokeDasharray="3 2" />
        <text x="320" y="203" fill="rgba(96,165,250,0.55)" fontSize="9" fontFamily="sans-serif">σ_u による乗算</text>
        <line x1="420" y1="200" x2="434" y2="200" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
        <text x="438" y="203" fill="rgba(255,255,255,0.35)" fontSize="9" fontFamily="sans-serif">データフロー</text>
      </svg>
    </div>
  )
}

function LayerDiagram() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {LAYERS.map((layer) => (
        <div key={layer.id} style={{
          display: 'flex', gap: 14, padding: '14px 16px',
          borderRadius: 12,
          border: `1px solid ${layer.color}22`,
          background: layer.bg,
          flexWrap: 'wrap',
        }}>
          {/* Label */}
          <div style={{ minWidth: 80, flexShrink: 0 }}>
            <div style={{ fontSize: 9, color: layer.color, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>Layer {layer.id}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', fontWeight: 500, marginBottom: 2 }}>{layer.name}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)' }}>{layer.nameJa}</div>
          </div>
          {/* Time scale */}
          <div style={{
            alignSelf: 'center', flexShrink: 0,
            fontSize: 10, color: layer.color,
            padding: '4px 9px', borderRadius: 6,
            border: `1px solid ${layer.color}30`, background: `${layer.color}10`,
            minWidth: 72, textAlign: 'center',
          }}>
            {layer.scale}
          </div>
          {/* Axes chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center', flex: 1 }}>
            {layer.axes.map((ax) => (
              <div key={ax.id} style={{
                padding: '7px 11px', borderRadius: 9,
                border: `1px solid ${layer.color}28`,
                background: `${layer.color}0a`,
              }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: layer.color }}>{ax.id}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.62)' }}>{ax.nameJa}</span>
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)' }}>{ax.dim}次元　τ = {ax.tau}日</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function SigmaSection() {
  return (
    <div style={{
      padding: '24px',
      borderRadius: 14,
      border: '1px solid rgba(96,165,250,0.2)',
      background: 'rgba(96,165,250,0.05)',
    }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Dial SVG */}
        <svg viewBox="0 0 130 130" width="110" height="110" style={{ flexShrink: 0 }}>
          {/* Background arc */}
          <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14"
            strokeDasharray="245 80" strokeDashoffset="-40" strokeLinecap="round" />
          {/* Value arc */}
          <circle cx="65" cy="65" r="52" fill="none" stroke="rgba(96,165,250,0.5)" strokeWidth="14"
            strokeDasharray="100 225" strokeDashoffset="-40" strokeLinecap="round" />
          {/* Center text */}
          <text x="65" y="60" textAnchor="middle" fill="rgba(96,165,250,0.9)" fontSize="20" fontFamily="sans-serif" fontWeight="300">σ</text>
          <text x="65" y="78" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="sans-serif">0.7 — 1.4</text>
          {/* Min/Max labels */}
          <text x="18" y="115" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="sans-serif">低</text>
          <text x="105" y="115" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="sans-serif">高</text>
        </svg>
        {/* Description */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.9)', marginBottom: 10 }}>個体感受性パラメータ σ_u</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.52)', lineHeight: 1.75 }}>
            感情変化のしやすさを表すスカラー値。<strong style={{ color: 'rgba(96,165,250,0.8)', fontWeight: 500 }}>atlas</strong> アプリの HSP-8 問診で推定し、全軸のベイズ更新レートに乗算されます。σ_u が大きいほど新しい観測が素早く反映されます。
          </div>
        </div>
      </div>
      {/* 3 values */}
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        {[
          { val: '0.7', label: '低感受性', sub: '変化がゆっくり', color: 'rgba(96,165,250,0.8)' },
          { val: '1.0', label: '標準 (初期値)', sub: 'デフォルト', color: 'rgba(255,255,255,0.65)' },
          { val: '1.4', label: '高感受性', sub: '変化が速い', color: 'rgba(167,139,250,0.8)' },
        ].map(({ val, label, sub, color }) => (
          <div key={val} style={{
            flex: 1, padding: '12px 0', textAlign: 'center', borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <div style={{ fontSize: 24, fontWeight: 200, color }}>{val}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{label}</div>
            <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FormulaSection() {
  const mono = { fontFamily: '"SF Mono","Fira Code",monospace' } as const
  const row = { marginBottom: 22 } as const
  const label = { fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.28)', marginBottom: 8 }
  const eq = { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, ...mono }
  const note = { fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 6, lineHeight: 1.6 }
  const div1 = { height: 1, background: 'rgba(255,255,255,0.06)', margin: '20px 0' }
  return (
    <div style={{ padding: '24px 26px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', ...mono }}>
      <div style={row}>
        <div style={label}>更新レート</div>
        <div style={eq}>r = α<sub style={{fontSize:10}}>app</sub> · σ<sub style={{fontSize:10}}>u</sub> · β<sub style={{fontSize:10}}>axis</sub> · η<sub style={{fontSize:10}}>default</sub></div>
        <div style={note}>
          α_app: アプリ信頼度 (0.5–1.0)　　σ_u: 個体感受性 (0.7–1.4)<br />
          β_axis: 軸の可変性 (Layer I = 0.0, Layer III = 1.0)　　η: 軸ごとの基本レート
        </div>
      </div>
      <div style={div1} />
      <div style={row}>
        <div style={label}>平均ベクトルの更新 (Bayesian Blend)</div>
        <div style={eq}>μ<sub style={{fontSize:10}}>new</sub> = (1 − r) · μ<sub style={{fontSize:10}}>old</sub> + r · δ<sub style={{fontSize:10}}>obs</sub></div>
        <div style={note}>δ_obs: アプリから届いた観測値のベクトル</div>
      </div>
      <div style={div1} />
      <div style={row}>
        <div style={label}>分散の更新 (確信度)</div>
        <div style={eq}>σ²<sub style={{fontSize:10}}>new</sub> = (1 − r)² · σ²<sub style={{fontSize:10}}>old</sub> + ε</div>
        <div style={note}>ε = 最小ノイズ。観測が増えるほど分散が収束し確信度が上がります。</div>
      </div>
      <div style={div1} />
      <div>
        <div style={label}>時間減衰 (半減期 τ_axis)</div>
        <div style={eq}>w(t) = exp(−ln2 · Δt / τ<sub style={{fontSize:10}}>axis</sub>)</div>
        <div style={note}>
          各軸には半減期があります。Layer I (A–C): τ = 365–3650日。Layer IV (J–M): τ = 30–90日。<br />
          古い観測は自然に薄れ、直近の観測が優先されます。
        </div>
      </div>
    </div>
  )
}

function AppAxisMap() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {APPS_MAP.map((app) => (
        <div key={app.id} style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '10px 16px',
          borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.02)',
          flexWrap: 'wrap',
        }}>
          <div style={{ minWidth: 150, flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.78)' }}>{app.id}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>{app.nameJa}</div>
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)' }}>→</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {app.axes.map((ax) => (
              <span key={ax} style={{
                fontSize: 11, fontWeight: 700,
                color: AXIS_COLORS[ax] ?? 'rgba(255,255,255,0.5)',
                padding: '2px 8px', borderRadius: 5,
                border: `1px solid ${AXIS_COLORS[ax] ?? 'rgba(255,255,255,0.2)'}35`,
                background: `${AXIS_COLORS[ax] ?? 'rgba(255,255,255,0.1)'}10`,
              }}>{ax}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function HypothesesSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {HYPOTHESES.map((h) => (
        <div key={h.id} style={{
          display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 18px',
          borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.32)', flexShrink: 0, paddingTop: 1, minWidth: 52 }}>{h.id}</div>
          <div style={{ flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7 }}>{h.desc}</div>
          <div style={{ display: 'flex', gap: 5, flexShrink: 0, paddingTop: 2 }}>
            {h.axes.map((ax) => (
              <span key={ax} style={{ fontSize: 11, fontWeight: 700, color: AXIS_COLORS[ax] ?? '#fff' }}>{ax}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function Morpho28Diagram() {
  const emotions = [
    'joy','sadness','anger','fear','surprise','disgust',
    'love','gratitude','pride','hope','relief','curiosity',
    'awe','flow','elevation','contentment',
    'anxiety','grief','disappointment','regret','boredom','loneliness',
    'frustration','nostalgia','jealousy','envy','shame','guilt',
  ]
  const positive = emotions.slice(0, 16)
  const negative = emotions.slice(16)
  return (
    <div style={{ padding: '20px', borderRadius: 14, border: '1px solid rgba(52,211,153,0.18)', background: 'rgba(52,211,153,0.04)' }}>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 14 }}>
        G・H・I 軸は同じ<strong style={{ color: 'rgba(52,211,153,0.9)', fontWeight: 500 }}>28感情次元</strong>を共有します。G = 強度、H = 感受性、I = 持続。
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(52,211,153,0.6)', marginBottom: 8 }}>POSITIVE (16)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {positive.map((e) => (
              <span key={e} style={{ fontSize: 9.5, color: 'rgba(52,211,153,0.7)', padding: '2px 7px', borderRadius: 5, border: '1px solid rgba(52,211,153,0.15)', background: 'rgba(52,211,153,0.06)' }}>{e}</span>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(251,191,36,0.6)', marginBottom: 8 }}>CHALLENGING (12)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {negative.map((e) => (
              <span key={e} style={{ fontSize: 9.5, color: 'rgba(251,191,36,0.65)', padding: '2px 7px', borderRadius: 5, border: '1px solid rgba(251,191,36,0.15)', background: 'rgba(251,191,36,0.05)' }}>{e}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TheoryPage() {
  const s: React.CSSProperties = { marginBottom: 60 }
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '52px 24px 110px' }}>

      {/* Header */}
      <div className="fsi" style={{ animationDelay: '0.04s', marginBottom: 64 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.34em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: 14 }}>SUST v0.3</div>
        <h1 style={{ fontSize: 27, fontWeight: 300, margin: '0 0 14px', color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.018em', lineHeight: 1.3 }}>
          デジタルツイン理論
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', lineHeight: 1.85, margin: 0, maxWidth: 480 }}>
          複数のアプリから収集された行動・感情・価値データが、<br />
          どのようにして「もうひとりの自分」を形成するか——その全体像。
        </p>
      </div>

      {/* 01 System Flow */}
      <div className="fsi" style={{ animationDelay: '0.10s', ...s }}>
        <SectionLabel>01 · システム構成</SectionLabel>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', lineHeight: 1.8, margin: '0 0 20px' }}>
          衛星アプリが送る生データは Contribution API を経由し、プロジェクション関数が「どの軸のどの次元に何の影響があるか」を計算します。その結果を使い、Morpho Profile をベイズ更新します。更新の強さは個体感受性 σ_u で変調されます。
        </p>
        <FlowDiagram />
      </div>

      {/* 02 4-Layer */}
      <div className="fsi" style={{ animationDelay: '0.18s', ...s }}>
        <SectionLabel>02 · 4層アーキテクチャ</SectionLabel>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', lineHeight: 1.8, margin: '0 0 20px' }}>
          自己は4つの時間スケールで記述されます。Layer I ほど変化が遅く本質的。Layer IV ほど日々変動する表面的な表現です。各軸はガウス分布 μ (平均ベクトル) と σ² (分散) で保持されます。
        </p>
        <LayerDiagram />
      </div>

      {/* 03 28-emotion */}
      <div className="fsi" style={{ animationDelay: '0.24s', ...s }}>
        <SectionLabel>03 · 28感情次元 (Layer III)</SectionLabel>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', lineHeight: 1.8, margin: '0 0 20px' }}>
          感情を28種に分類し、それぞれの「強度 G」「感受性 H」「持続 I」を独立して記録します。同じ感情でも「すぐ強く感じるが短い」「じわじわ長く続く」など個人差が現れます。
        </p>
        <Morpho28Diagram />
      </div>

      {/* 04 σ_u */}
      <div className="fsi" style={{ animationDelay: '0.30s', ...s }}>
        <SectionLabel>04 · 個体感受性 σ_u</SectionLabel>
        <SigmaSection />
      </div>

      {/* 05 Formula */}
      <div className="fsi" style={{ animationDelay: '0.36s', ...s }}>
        <SectionLabel>05 · ベイズ更新式</SectionLabel>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', lineHeight: 1.8, margin: '0 0 20px' }}>
          各軸はガウス分布として表現されます。新しい観測が届くたびに平均 μ と分散 σ² が更新されます。分散が小さいほど「確信度が高い」ことを意味します。
        </p>
        <FormulaSection />
      </div>

      {/* 06 App mapping */}
      <div className="fsi" style={{ animationDelay: '0.42s', ...s }}>
        <SectionLabel>06 · アプリ → 軸マッピング</SectionLabel>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', lineHeight: 1.8, margin: '0 0 16px' }}>
          各アプリが主にどの軸を更新するかを示します。
          <span style={{ color: '#a78bfa' }}> ■ </span>Layer I
          <span style={{ color: '#60a5fa' }}> ■ </span>Layer II
          <span style={{ color: '#34d399' }}> ■ </span>Layer III
          <span style={{ color: '#fbbf24' }}> ■ </span>Layer IV
        </p>
        <AppAxisMap />
      </div>

      {/* 07 Hypotheses */}
      <div className="fsi" style={{ animationDelay: '0.48s', ...s }}>
        <SectionLabel>07 · 仮説システム SUST-1〜10</SectionLabel>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', lineHeight: 1.8, margin: '0 0 20px' }}>
          Morpho Profile の特定パターンが閾値を超えると「仮説が発火」し、インサイトカードが生成されます。仮説は新しい寄与が届くたびにリアルタイムで再評価されます。
        </p>
        <HypothesesSection />
      </div>

    </div>
  )
}
