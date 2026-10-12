'use client'
import { useEffect, useRef, useState } from 'react'
import { T } from '@/lib/i18n'
import { useShop } from './ShopContext'

type Msg = { who: 'b' | 'u'; text: string; acts?: { label: string; ids: string[] }[] }
const CA = ['p15', 'p14', 'p11'], CB = ['p6', 'p1'], CC = ['p2', 'p7']

export default function Chatbot() {
  const { L, setL, ui, setUi, addMany, pendingChat, clearPending, byId, pname } = useShop()
  const [msgs, setMsgs] = useState<Msg[]>([{ who: 'b', text: T.vi.hi }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const end = useRef<HTMLDivElement>(null)
  const R = T[L]
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [msgs, busy, ui.chat])

  const push = (m: Msg) => setMsgs((x) => [...x, m])

  /** Dự phòng khi AI chưa cấu hình hoặc lỗi mạng: trả lời theo từ khóa. */
  const fallback = (q: string): Msg => {
    const s = q.toLowerCase(), has = (a: string[]) => a.some((w) => s.includes(w))
    const acts = (...k: [string, string[]][]) => k.map(([label, ids]) => ({ label, ids }))
    if (has(['tiếng anh', 'english']) && L === 'vi') { setL('en'); return { who: 'b', text: T.en.hi } }
    if (has(['tiếng việt', 'vietnamese']) && L === 'en') { setL('vi'); return { who: 'b', text: T.vi.hi } }
    if (has(['báo giá', 'quote'])) return { who: 'b', text: R.quote }
    if (has(['combo', 'gợi ý', 'suggest'])) return { who: 'b', text: R.combo, acts: acts([R.c1, CA], [R.c2, CB], [R.c3, CC]) }
    if (has(['đối tác', 'partner', 'business'])) return { who: 'b', text: R.partner, acts: acts([R.c1, CA]) }
    if (has(['người thân', 'family', 'friend', 'colleague', 'đồng nghiệp'])) return { who: 'b', text: R.family, acts: acts([R.c1, CA], [R.c2, CB]) }
    if (has(['quà', 'gift', 'tặng'])) return { who: 'b', text: R.gift }
    if (has(['giá', 'price', 'ship', 'giao', 'delivery', 'bao nhiêu', 'cost'])) return { who: 'b', text: R.price }
    return { who: 'b', text: R.dflt }
  }

  const ask = async (raw: string) => {
    const q = raw.trim()
    if (!q || busy) return
    const history: Msg[] = [...msgs, { who: 'u', text: q }]
    setMsgs(history)
    setBusy(true)
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.map((m) => ({ role: m.who === 'u' ? 'user' : 'assistant', content: m.text })) }),
      })
      if (!r.ok) throw new Error(String(r.status))
      const d = (await r.json()) as { reply: string; add: string[] }
      const items = d.add.map((id) => byId(id)).filter((p): p is NonNullable<typeof p> => Boolean(p))
      push({
        who: 'b',
        text: d.reply,
        acts: items.length
          ? [{ label: (L === 'vi' ? 'Thêm vào giỏ: ' : 'Add to cart: ') + items.map((p) => pname(p)).join(', '), ids: items.map((p) => p.id) }]
          : undefined,
      })
    } catch {
      push(fallback(q))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (pendingChat) { void ask(pendingChat); clearPending() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingChat])

  const send = () => { void ask(input); setInput('') }
  return (
    <>
      {!ui.chat && <button className="fab" aria-label={R.fab} onClick={() => setUi({ chat: true })}>{R.fab}</button>}
      <section className={'chat' + (ui.chat ? ' open' : '')} aria-label="Chatbot">
        <div className="ch">
          <span className="av" />
          <div className="t"><b>Cacao AI</b><small>{R.cs}</small></div>
          <div className="r">
            <button className="lang" onClick={() => { const n = L === 'vi' ? 'en' : 'vi'; setL(n); push({ who: 'b', text: T[n].hi }) }}>{L === 'vi' ? 'EN' : 'VI'}</button>
            <button className="cl" aria-label="Close" onClick={() => setUi({ chat: false })}>×</button>
          </div>
        </div>
        <div id="msgs">
          {msgs.map((m, i) => (
            <div key={i} className={'m ' + m.who}>
              {m.text}
              {m.acts?.map((a) => <button key={a.label} onClick={() => { addMany(a.ids); push({ who: 'b', text: R.yes }) }}>{a.label}</button>)}
            </div>
          ))}
          {busy && <div className="m b" aria-live="polite">…</div>}
          <div ref={end} />
        </div>
        <div className="chips" id="chips">{R.chips.map((c: string) => <button key={c} onClick={() => void ask(c)}>{c}</button>)}</div>
        <div className="in">
          <input placeholder={R.ph} value={input} disabled={busy} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send() }} />
          <button onClick={send} disabled={busy}>{R.send}</button>
        </div>
      </section>
    </>
  )
}