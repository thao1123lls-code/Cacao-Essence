import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from '@/lib/env'

export const runtime = 'nodejs'

// Giới hạn: tối đa 5 lần gửi / 10 phút / IP (bộ nhớ tạm của server, đủ chặn spam đơn giản)
const hits = new Map<string, number[]>()
function limited(ip: string) {
  const now = Date.now()
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 600_000)
  arr.push(now)
  hits.set(ip, arr)
  if (hits.size > 5000) hits.clear()
  return arr.length > 5
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (limited(ip)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  let b: Record<string, unknown>
  try { b = await req.json() } catch { return NextResponse.json({ error: 'bad_request' }, { status: 400 }) }

  // Bẫy bot: ô ẩn "website" phải để trống; người thật không thể điền form trong dưới 3 giây.
  const bot = str(b.website, 50) !== '' || !(Number(b.elapsed) >= 3000)
  if (bot) return NextResponse.json({ ok: true }) // giả vờ thành công để bot không dò ra

  const name = str(b.name, 120), phone = str(b.phone, 30), email = str(b.email, 160), message = str(b.message, 2000)
  const phoneOk = /^[+\d][\d\s.()-]{7,}$/.test(phone) && phone.replace(/\D/g, '').length >= 9
  const emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const links = (message.match(/https?:\/\//gi) ?? []).length
  if (name.length < 2 || !phoneOk || !emailOk || message.length < 5 || links > 1)
    return NextResponse.json({ error: 'invalid' }, { status: 400 })

  if (!isSupabaseConfigured) return NextResponse.json({ ok: true, demo: true })
  try {
    const sb = createServerClient(SUPABASE_URL!, SUPABASE_KEY!, { cookies: { getAll: () => [], setAll: () => {} } })
    const { error } = await sb.rpc('submit_contact', { p_name: name, p_phone: phone, p_email: email, p_message: message })
    if (error) return NextResponse.json({ error: 'save_failed' }, { status: 502 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'save_failed' }, { status: 502 })
  }
}
