import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from '@/lib/env'
import { buildKnowledge, SYSTEM_RULES, type Faq } from '@/lib/knowledge'
import { getProducts } from '@/lib/products'

export const runtime = 'nodejs'
export const maxDuration = 30

const API_URL = process.env.ANTHROPIC_API_URL || 'https://api.anthropic.com/v1/messages'
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5'

const hits = new Map<string, number[]>()
function limited(ip: string) {
  const now = Date.now()
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 60_000)
  arr.push(now)
  hits.set(ip, arr)
  if (hits.size > 5000) hits.clear()
  return arr.length > 15
}

type Role = 'user' | 'assistant'
function cleanMessages(raw: unknown): { role: Role; content: string }[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null
  const out: { role: Role; content: string }[] = []
  for (const m of raw.slice(-10)) {
    const role = m?.role === 'user' ? 'user' : m?.role === 'assistant' ? 'assistant' : null
    const content = typeof m?.content === 'string' ? m.content.trim().slice(0, 1000) : ''
    if (!role || !content) continue
    if (!out.length && role === 'assistant') continue
    if (out.length && out[out.length - 1].role === role) out[out.length - 1].content += '\n' + content
    else out.push({ role, content })
  }
  return out.length && out[out.length - 1].role === 'user' ? out : null
}

async function loadFaqs(): Promise<Faq[]> {
  if (!isSupabaseConfigured) return []
  try {
    const sb = createServerClient(SUPABASE_URL!, SUPABASE_KEY!, { cookies: { getAll: () => [], setAll: () => {} } })
    const { data } = await sb.from('faqs').select('question,answer').eq('active', true).limit(150)
    return (data ?? []) as Faq[]
  } catch {
    return []
  }
}

function logChat(q: string, a: string, handoff: boolean) {
  if (!isSupabaseConfigured) return
  try {
    const sb = createServerClient(SUPABASE_URL!, SUPABASE_KEY!, { cookies: { getAll: () => [], setAll: () => {} } })
    void Promise.resolve(sb.rpc('log_chat', { p_question: q, p_answer: a, p_handoff: handoff })).catch(() => {})
  } catch {
    /* bỏ qua lỗi ghi nhật ký */
  }
}

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return NextResponse.json({ error: 'not_configured' }, { status: 503 })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (limited(ip)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  let body: { messages?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad_request' }, { status: 400 }) }
  const messages = cleanMessages(body.messages)
  if (!messages) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const [products, faqs] = await Promise.all([getProducts(), loadFaqs()])
  const system = `${SYSTEM_RULES}\n\n===== KIẾN THỨC =====\n${buildKnowledge(products, faqs)}`

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 25_000)
  try {
    const r = await fetch(API_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 600, temperature: 0.1, system, messages }),
      signal: ctrl.signal,
    })
    if (!r.ok) return NextResponse.json({ error: 'upstream_' + r.status }, { status: 502 })
    const data = (await r.json()) as { content?: { type: string; text?: string }[] }
    let text = (data.content ?? []).filter((c) => c.type === 'text').map((c) => c.text ?? '').join('\n').trim()
    if (!text) return NextResponse.json({ error: 'empty' }, { status: 502 })

    const valid = new Set(products.filter((p) => p.in_stock && p.price > 0).map((p) => p.id))
    const add = new Set<string>()
    for (const m of text.matchAll(/\[\[ADD:([^\]]*)\]\]/gi))
      m[1].split(',').map((s) => s.trim()).filter((id) => valid.has(id)).forEach((id) => add.add(id))
    const handoff = /\[\[HANDOFF\]\]/i.test(text)
    text = text.replace(/\[\[[^\]]*\]\]/g, '').replace(/\n{3,}/g, '\n\n').trim()

    logChat(messages[messages.length - 1].content, text, handoff)
    return NextResponse.json({ reply: text, add: [...add].slice(0, 6), handoff })
  } catch {
    return NextResponse.json({ error: 'upstream_error' }, { status: 502 })
  } finally {
    clearTimeout(timer)
  }
}