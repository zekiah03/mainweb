import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { AxisKey, AXIS_KEYS } from '@/lib/twin-types'
import Anthropic from '@anthropic-ai/sdk'

interface Payload {
  app_id: string
  raw_data: Record<string, unknown>
  access_token?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: Payload = await req.json()
    const { app_id, raw_data } = body
    if (!app_id || !raw_data) {
      return NextResponse.json({ error: 'app_id and raw_data required' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Resolve user from Bearer token or body token
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : body.access_token
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = user.id

    // Store contribution
    const { data: contribution } = await supabase
      .from('app_contributions')
      .insert({ user_id: userId, app_id, raw_data, axes_updated: [] })
      .select('id')
      .single()

    // Run AI mapping asynchronously (fire-and-forget)
    mapToTwin(userId, app_id, raw_data, contribution?.id, supabase).catch(console.error)

    return NextResponse.json({ ok: true, contribution_id: contribution?.id })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

async function mapToTwin(
  userId: string,
  appId: string,
  rawData: Record<string, unknown>,
  contributionId: string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
) {
  const { data: current } = await supabase
    .from('twin_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  const currentAxes: Record<string, number> =
    current?.axes12 ?? Object.fromEntries(AXIS_KEYS.map(k => [k, 5]))
  const currentConf: Record<string, number> =
    current?.axes12_confidence ?? Object.fromEntries(AXIS_KEYS.map(k => [k, 0]))

  const anthropic = new Anthropic()
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: buildPrompt(appId, rawData, currentAxes) }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  let parsed: {
    axes: Partial<Record<AxisKey, number>>
    rationale?: Partial<Record<AxisKey, string>>
    summary?: string
    catchphrase?: string
  } | null = null
  try {
    const m = text.match(/```json\n?([\s\S]+?)\n?```/)
    parsed = JSON.parse(m?.[1] ?? text)
  } catch { return }
  if (!parsed?.axes) return

  // Confidence-weighted blend
  const newAxes = { ...currentAxes }
  const newConf = { ...currentConf }
  const updated: AxisKey[] = []
  const CONF_GAIN = 0.15

  for (const [k, v] of Object.entries(parsed.axes) as [AxisKey, number][]) {
    if (!AXIS_KEYS.includes(k) || typeof v !== 'number') continue
    const prev = (newConf[k] as number) ?? 0
    const next = Math.min(1, prev + CONF_GAIN)
    newAxes[k] = prev > 0
      ? Math.max(0, Math.min(10, ((newAxes[k] as number) * prev + v * CONF_GAIN) / next))
      : Math.max(0, Math.min(10, v))
    newConf[k] = next
    updated.push(k)
  }

  const avgConf = Object.values(newConf as Record<string, number>).reduce((a, b) => a + b, 0) / 12
  const completeness = Math.min(1, avgConf)

  const profileData = {
    user_id: userId,
    axes12: newAxes,
    axes12_confidence: newConf,
    axes12_rationale: { ...(current?.axes12_rationale ?? {}), ...(parsed.rationale ?? {}) },
    completeness,
    summary: parsed.summary || current?.summary || null,
    catchphrase: parsed.catchphrase || current?.catchphrase || null,
    updated_at: new Date().toISOString(),
  }

  if (current) {
    await supabase.from('twin_profiles').update(profileData).eq('user_id', userId)
  } else {
    await supabase.from('twin_profiles').insert({ ...profileData, created_at: new Date().toISOString() })
  }

  if (contributionId) {
    await supabase
      .from('app_contributions')
      .update({ ai_result: parsed, axes_updated: updated })
      .eq('id', contributionId)
  }
}

function buildPrompt(
  appId: string,
  rawData: Record<string, unknown>,
  currentAxes: Record<string, number>
): string {
  return `You are the digital twin inference engine for Solnova Lab.
Update the Morpho 12-axis profile based on data from app: "${appId}".

Morpho axes (each 0–10):
A=構造(Structure)  B=エネルギー(Energy)  C=入出力(I/O)  D=制御(Control)
E=健康(Health)     F=環境依存(Env Dep)   G=相互作用(Interaction)  H=重力(Gravity)
I=排除(Exclusion)  J=流動性(Fluidity)    K=プライド(Pride)  L=死との距離(Dist Death)

Current axes: ${JSON.stringify(currentAxes)}
New data from ${appId}: ${JSON.stringify(rawData, null, 2)}

Infer only axes meaningfully informed by this app's data.
Respond with JSON:
\`\`\`json
{
  "axes": { "B": 7.2, "G": 6.1 },
  "rationale": { "B": "reason", "G": "reason" },
  "summary": "One paragraph about what this data reveals.",
  "catchphrase": "Short evocative phrase (optional)"
}
\`\`\`
Only include axes this app can meaningfully measure.`
}
