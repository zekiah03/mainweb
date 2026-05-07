import { AxisKey, AXIS_KEYS } from './twin-types'

export interface AppDef {
  id: string
  title: string
  url: string
  category: 'diagnosis' | 'record' | 'research' | 'game' | 'service'
  primaryAxes: AxisKey[]
  axisPitch: string
  question: string
}

export const APPS: AppDef[] = [
  {
    id: 'airobot',
    title: 'AI Robot',
    url: 'https://airobot-five.vercel.app',
    category: 'diagnosis',
    primaryAxes: ['B', 'C', 'D', 'G'],
    axisPitch: '処理能力・入出力・制御力・相互作用力を測定',
    question: 'あなたはどんなスペックの人間ですか？',
  },
  {
    id: 'resonance',
    title: 'Resonance',
    url: 'https://resonance-wheat.vercel.app',
    category: 'research',
    primaryAxes: ['G', 'I', 'J', 'L'],
    axisPitch: '感情パターン・会話軌跡・排除構造を分析',
    question: 'あなたが生み出す感情の軌跡は？',
  },
  {
    id: 'evolve',
    title: 'Evolve',
    url: 'https://evolve-chi-two.vercel.app',
    category: 'game',
    primaryAxes: ['B', 'D', 'F', 'J'],
    axisPitch: '環境適応・エネルギー・流動性をシミュレーション',
    question: 'あなたの生命体はどう進化しますか？',
  },
  {
    id: 'minus',
    title: 'Minus',
    url: 'https://minus-three.vercel.app',
    category: 'diagnosis',
    primaryAxes: ['D', 'F', 'G', 'K'],
    axisPitch: '何に消耗するか・守るべき領域を特定',
    question: 'あなたは何に弱いですか？',
  },
  {
    id: 'valuse',
    title: 'Valuse',
    url: 'https://valuse.vercel.app',
    category: 'diagnosis',
    primaryAxes: ['B', 'G', 'K', 'L'],
    axisPitch: '価値観の重心・マズロー段階を可視化',
    question: 'あなたが本当に大切にしているものは？',
  },
  {
    id: 'whoyouare',
    title: 'Who You Are',
    url: 'https://whoyouare-eight.vercel.app',
    category: 'diagnosis',
    primaryAxes: ['D', 'J', 'L'],
    axisPitch: '自己同一性の哲学的位置を測定',
    question: 'あなたとは何ですか？',
  },
  {
    id: 'whoyournot',
    title: 'Who You Are Not',
    url: 'https://whoyournot.vercel.app',
    category: 'diagnosis',
    primaryAxes: ['D', 'G', 'J', 'K', 'L'],
    axisPitch: '変化に対する自己の境界線を特定',
    question: 'あなたでなくなるのはどこからですか？',
  },
  {
    id: 'pazst',
    title: 'Pazst',
    url: 'https://pazst.vercel.app',
    category: 'diagnosis',
    primaryAxes: ['C', 'D', 'G', 'K'],
    axisPitch: '過去の傷・満たされていないニーズを明らかに',
    question: 'あなたが過去に求めていたものは？',
  },
  {
    id: 'gap',
    title: 'Gap',
    url: 'https://gap-eight.vercel.app',
    category: 'record',
    primaryAxes: ['C', 'G', 'I', 'K'],
    axisPitch: '本音と建前のギャップ・フィルタリングを記録',
    question: 'あなたが本当は何を感じていましたか？',
  },
  {
    id: 'micron',
    title: 'Micron',
    url: 'https://micron-nayami.vercel.app',
    category: 'diagnosis',
    primaryAxes: ['C', 'D', 'G', 'K'],
    axisPitch: 'ジョハリの窓・思考スタイル・社会性を多次元分析',
    question: 'あなたはどんな人ですか？',
  },
  {
    id: 'people-talking',
    title: 'People Talking',
    url: 'https://people-talking.vercel.app',
    category: 'research',
    primaryAxes: ['G', 'I', 'J'],
    axisPitch: '会話の感情軌跡・相互作用パターンを生成',
    question: 'どんな感情の会話を作りましたか？',
  },
  {
    id: 'axis-life-tracker',
    title: 'Axis Life Tracker',
    url: 'https://axis-life-tracker.vercel.app',
    category: 'record',
    primaryAxes: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
    axisPitch: '日々のメトリクスを全軸にわたって記録',
    question: '今日のあなたの状態は？',
  },
  {
    id: 'how-feelings-work',
    title: 'How Feelings Work',
    url: 'https://how-feelings-work.vercel.app',
    category: 'research',
    primaryAxes: ['G', 'I', 'J', 'L'],
    axisPitch: '感情の構造・発生メカニズムを探索',
    question: 'あなたの感情はどう動きますか？',
  },
  {
    id: 'comparedna',
    title: 'Compare DNA',
    url: 'https://comparedna.vercel.app',
    category: 'research',
    primaryAxes: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
    axisPitch: 'Morpho理論で全軸を直接分析・比較',
    question: 'あなたは何型のエンティティですか？',
  },
  {
    id: 'skalegame',
    title: 'Skale Game',
    url: 'https://skalegame.vercel.app',
    category: 'game',
    primaryAxes: ['B', 'D', 'J'],
    axisPitch: 'ゲームプレイからエネルギー・制御パターンを抽出',
    question: 'あなたはどんなプレイヤーですか？',
  },
  {
    id: 'problemmach',
    title: 'Problem Match',
    url: 'https://problemmach.vercel.app',
    category: 'service',
    primaryAxes: ['D', 'G', 'I'],
    axisPitch: '問題構造の類似性・排除パターンを分析',
    question: 'あなたはどんな問題を持っていますか？',
  },
  {
    id: 'exchangeapp2',
    title: 'Exchange App',
    url: 'https://exchangeapp2.vercel.app',
    category: 'record',
    primaryAxes: ['C', 'G', 'H'],
    axisPitch: '与える/受け取るバランス・重力中心を記録',
    question: 'あなたは何を与え、何を受け取っていますか？',
  },
  {
    id: 'consequences',
    title: 'Consequences',
    url: 'https://consequences.vercel.app',
    category: 'record',
    primaryAxes: ['C', 'I', 'K'],
    axisPitch: '内外状態のギャップ・自己検閲パターンを記録',
    question: 'あなたが隠していることは何ですか？',
  },
  {
    id: 'feelings',
    title: 'Feelings',
    url: 'https://feelings-app.vercel.app',
    category: 'record',
    primaryAxes: ['G', 'J', 'L'],
    axisPitch: '感情の時系列変化・流動性を記録',
    question: 'あなたは今何を感じていますか？',
  },
]

export function getAppsForAxis(axis: AxisKey): AppDef[] {
  return APPS.filter(app => app.primaryAxes.includes(axis))
}

export function getMostNeededApp(
  axes12: Record<AxisKey, number>,
  confidence: Record<AxisKey, number>
): AppDef | null {
  let lowestConf = Infinity
  let lowestAxis: AxisKey = 'A'
  for (const key of AXIS_KEYS) {
    if ((confidence[key] ?? 0) < lowestConf) {
      lowestConf = confidence[key] ?? 0
      lowestAxis = key
    }
  }
  return getAppsForAxis(lowestAxis)[0] ?? null
}
