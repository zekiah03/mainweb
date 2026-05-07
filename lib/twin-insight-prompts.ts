/**
 * Solnova Digital Twin — LLM Insight Prompt Templates (SUST v0.2)
 *
 * 局面: insight 生成パイプラインの LLM 層。
 * プロンプトテンプレート + リント + Anthropic API 呼び出し。
 */

import type { AxisId, HypothesisId, AppId } from '@/lib/twin-types';

// ============================================================
//  システムプロンプト
// ============================================================

export const SYSTEM_PROMPT = `あなたは Solnova というアプリ群が共有するデジタルツインのナレッジ・ナラティブ層です。

役割:
- ユーザー自身の自己理解を支援する短いカード文を書く
- ユーザーの内省を起動する「問いと観察」を提示する

絶対に守ること:
- 断定形ではなく仮説形 (“〜かもしれません” “〜のように見えます”) を使う
- 過去の他者 (親・恋人・上司など) への帰貣表現を避ける
- 医学的診断、病名、治療助言は出さない
- 数値スコアそのものを本文に出さない
- 1 カードは 80〜180 字程度
- 確信度が低いと指示された場合、「もしかすると」を冒頭に付ける

出力形式 (厳密):
{
  "title": "12 字以内の見出し",
  "body":  "80〜180 字の本文",
  "actions": [
    { "kind": "reflect" | "open_app" | "feedback", "label": "短いラベル", "app"?: "AppId" }
  ]
}`;

// ============================================================
//  軸の自然言語表現
// ============================================================

const AXIS_NL: Record<AxisId, string> = {
  A: '幼少期から青年期の生育環境ベクトル',
  B: '感情の時間構造への崗好',
  C: '意識の覚醒位相',
  D: '心理的ニーズの充足度',
  E: '価値観の優先順位',
  F: '自己境界 (どこに侵害を感じるか)',
  G: '感情のベース水準',
  H: '感情の発火閾値',
  I: '感情の持続性',
  J: '表現スタイル',
  K: '関係性ごとの本音開放度',
  L: '感情の遷移パターン',
  M: '自己物語の整合性',
};

// ============================================================
//  仮説別プロンプト生成
// ============================================================

interface PromptContext {
  hypothesis: HypothesisId;
  confidence: number;
  axesReferenced: AxisId[];
  evidenceSummary: Record<string, number>;
}

export function buildInsightPrompt(ctx: PromptContext): string {
  const axisDescriptions = ctx.axesReferenced.map((a) => `- 軸 ${a}: ${AXIS_NL[a]}`).join('\n');
  const confidenceGuidance =
    ctx.confidence > 0.75 ? '比較的はっきりした傾向として書いてよい。ただし断定はしない。'
    : ctx.confidence > 0.5 ? '弱い仮説として提示する。「〜のような兆しがあります」のトーン。'
    : '非常に弱い兆しなので、「もしかすると」を冠して提示する。';
  const hCtx = HYPOTHESIS_CONTEXTS[ctx.hypothesis];

  return `# 検出された仮説
${ctx.hypothesis} ― ${hCtx.summary}

# 関連軸
${axisDescriptions}

# 観測された証拠
${Object.entries(ctx.evidenceSummary).map(([k,v]) => `- ${k}: ${typeof v === 'number' ? v.toFixed(2) : v}`).join('\n')}

# 信頼度
${(ctx.confidence * 100).toFixed(0)}%
${confidenceGuidance}

# このカードでユーザーに伝えたいこと
${hCtx.intent}

# 推奨されるアクションの方向性
${hCtx.actionHint}

# 注意
${hCtx.caveat}

JSON で出力してください。`;
}

// ============================================================
//  各仮説の文脈情報
// ============================================================

interface HypothesisContext {
  summary: string;
  intent: string;
  actionHint: string;
  caveat: string;
  defaultActions: Array<{ kind: 'reflect'|'open_app'|'feedback'; label: string; app?: AppId }>;
}

const HYPOTHESIS_CONTEXTS: Record<HypothesisId, HypothesisContext> = {
  'SUST-1': {
    summary: '初期環境で感情不足の可能性があるが、現在のニーズは比較的満たされている。earned secure attachment パターン。',
    intent: '「いま自分が穏やかでいられる」のは過去の不足を取り戻したからである、という気づきを与える。誇りや感謝につながる文体で。',
    actionHint: '今の安心の源 (人・場・習慣) を 1 つ思い出してもらう。',
    caveat: '「親が悪かった」という方向の文章にしない。あくまで本人の獲得物として描く。',
    defaultActions: [{ kind:'reflect', label:'いまの安心の源を書き出す' }, { kind:'open_app', app:'feelings', label:'感情の背景を見直す' }],
  },
  'SUST-2': {
    summary: '感情抑制と感情爆発が同時に高い。表現の “窓” が狭く、抑え込んだものが突発的に出る周期構造の可能性。',
    intent: '「弱さ」ではなく「窓が狭い」状態だと再フレームする。介入が可能であることを示唠する。',
    actionHint: '直近 1 週間のイラ立ちを 3 行で書き出す。',
    caveat: '病名 (境界性、衝動性等) を絶対に使わない。',
    defaultActions: [{ kind:'reflect', label:'直近のイラつきを 3 行で書く' }],
  },
  'SUST-3': {
    summary: '価値観の優先順位 (E) と自己境界の感受性領域 (F) が整合している。',
    intent: '「大事にしているものを、ちゃんと守れている」状態であるとフィードバックする。肯定的に。',
    actionHint: '自己評価のフィードバックを募る (これがしっくりくるか)。',
    caveat: '誤張しない。整合は良いことだが、固執につながる可能性も控えめに示唠。',
    defaultActions: [{ kind:'feedback', label:'これは自分らしい?' }],
  },
  'SUST-4': {
    summary: 'resonance で選ぶ軸跡型と自分の感情強度プロファイルが整合していない。「自分にないものへの憧れ」の可能性。',
    intent: '自分が表現で求めるものは、いま欠けているものかもしれない、という気づき。',
    actionHint: 'なぜその時間構造に惹かれるかを内省する。',
    caveat: '欠如としてだけでなく、補完運動として描く。',
    defaultActions: [{ kind:'reflect', label:'いま惹かれている物語の質を書く' }],
  },
  'SUST-5': {
    summary: '覚醒位相 (C) と軸間整合度の関連を観測。',
    intent: '自分の各層が整っているとき、覚醒も進む傾向にあるという観察。',
    actionHint: '今後の縦断観察を促す。',
    caveat: '因果的に書かない。“並走する” 程度の表現に。',
    defaultActions: [{ kind:'feedback', label:'これはピンと来る?' }],
  },
  'SUST-6': {
    summary: '特定の関係性で開放度が低く、同時にその関係性が満たすべきニーズの渇望が高い。',
    intent: 'その関係性の中で言えていないことが穏もっている可能性。具体的な記録アプリへ橋渡し。',
    actionHint: 'gap で該当関係の場面を 1 つ記録する。',
    caveat: '「相手が悪い」とは言わない。本人が抑えている言えなさに焦点。',
    defaultActions: [{ kind:'open_app', app:'gap', label:'gap で記録する' }, { kind:'reflect', label:'伝えたいことを 1 つ書く' }],
  },
  'SUST-7': {
    summary: '時間とともに層間整合 M_2 が上昇。自己理解の統合が進んでいる。',
    intent: '自分の歴史と現在が結びついてきている、というポジティブな観察。',
    actionHint: 'この感覚が続くかを次回確認する。',
    caveat: '誤大化しない。',
    defaultActions: [{ kind:'feedback', label:'この変化を実感している?' }],
  },
  'SUST-8': {
    summary: '自己物語の更新可能性 (M_8) が低く、提示された insight に misaligned が多い。',
    intent: '自己像が固まっていることに気づきを与える。劉性自体は良くも悪くもない。',
    actionHint: '「もし自分の見方が違っていたら」という思考実験。',
    caveat: '「あなたは頑固」のような評価語を避ける。',
    defaultActions: [{ kind:'reflect', label:'今の自分像を一言で書く' }],
  },
  'SUST-9': {
    summary: '個体差 σ_u が高く、Layer I の負の経験から Layer III の不安・悖しみへの感度が大きい。',
    intent: '自分が環境に対して感受性が高いことを、リソースとして再フレーム。',
    actionHint: '感受性が活きる場面を 1 つ思い出してもらう。',
    caveat: '「敏感すぎる」のような評価を避ける。',
    defaultActions: [{ kind:'reflect', label:'感受性が役立った場面を書く' }],
  },
  'SUST-10': {
    summary: '境界 F とニーズ D の対応ペアが同期している。',
    intent: '自己理解の整合度の高さをフィードバック。',
    actionHint: '次に挑戦したい未充足ペアがあるかを内省。',
    caveat: '完全に同期 = 完璧という誤解を防ぐ。',
    defaultActions: [{ kind:'feedback', label:'これはしっくり来る?' }],
  },
};

// ============================================================
//  Drift / Conflict用テンプレート
// ============================================================

export function buildDriftPrompt(axis: AxisId, dimension: string, delta24h: number, delta7d: number): string {
  return `# 急変イベント
軸 ${axis} の次元 "${dimension}" が変動しています。
- 24 時間: ${delta24h > 0 ? '+' : ''}${delta24h.toFixed(1)}
- 7 日:    ${delta7d  > 0 ? '+' : ''}${delta7d.toFixed(1)}

変化が起きていることを観察として示し、原因を本人が考える素材を提供する。変化を「悪化」「改善」と価値判断しない。JSON で出力（title/body/actions）。`;
}

export function buildConflictPrompt(axis: AxisId, dimension: string, contributors: Array<{ app: AppId; suggested_value: number }>): string {
  const detail = contributors.map((c) => `- ${c.app}: ${c.suggested_value.toFixed(1)}`).join('\n');
  return `# アプリ間の見え方の摇らぎ
軸 ${axis} の次元 "${dimension}" について、アプリ間で異なる像が出ています。
${detail}

両方とも本人の側面である可能性を示す。数値を表に出さず定性的に。JSON で出力（title/body/actions）。`;
}

// ============================================================
//  Anthropic API 呼び出し
// ============================================================

export async function callLLMForInsight(
  userPrompt: string,
  apiKey: string,
  model = 'claude-sonnet-4-6',
): Promise<{ title: string; body: string; actions: unknown[] } | null> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const text = data.content?.[0]?.text ?? '';
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    if (!parsed.title || !parsed.body) return null;
    return parsed;
  } catch { return null; }
}

// ============================================================
//  Lint
// ============================================================

export function lintInsight(card: { title: string; body: string }, confidence: number): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const text = card.title + '\n' + card.body;

  const banned = ['うつ病','不安障害','PTSD','ADHD','境界性','パーソナリティ障害','診断','治療'];
  for (const w of banned) { if (text.includes(w)) issues.push(`禁止語: ${w}`); }

  const blame = ['親が','親のせい','家族のせい','のせいで','原因は'];
  for (const p of blame) { if (text.includes(p)) issues.push(`帰貣表現: ${p}`); }

  if (confidence < 0.5) {
    const hasHesitancy = ['かもしれ','のように見え','もしかすると','可能性'].some((h) => text.includes(h));
    if (!hasHesitancy) issues.push('低確信度なのに仮説形が含まれていない');
  }

  if (card.body.length > 220) issues.push(`本文が長すぎる (${card.body.length}字)`);
  if (card.body.length < 40)  issues.push(`本文が短すぎる (${card.body.length}字)`);
  if (/\d+(\.\d+)?\s*(点|スコア|％|%)/.test(text)) issues.push('数値スコアが本文に露出している');

  return { ok: issues.length === 0, issues };
}
