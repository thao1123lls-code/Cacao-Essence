'use client'
import { useState } from 'react'
import { useShop } from './ShopContext'

const EMPTY: (string | null)[] = [null, null, null, null, null, null, null]
const RANDOM = ['p15', 'p14', 'p11', 'p13', 'p12', 'p8', 'p9']
const ROWS: [number, number][] = [[0, 2], [2, 5], [5, 7]]

export default function GiftBuilder() {
  const { t, products, byId, pname, fmt, addGift, toast } = useShop()
  const [slots, setSlots] = useState<(string | null)[]>(EMPTY)
  const [msg, setMsg] = useState('')
  const choices = products.filter((p) => p.category === 'chocolate' && p.price > 0 && p.in_stock)
  const ids = slots.filter(Boolean) as string[]
  const total = ids.reduce((s, id) => s + (byId(id)?.price ?? 0), 0)

  const pick = (id: string) => {
    const k = slots.indexOf(null)
    if (k < 0) return toast(t('gb_full'))
    setSlots(slots.map((s, i) => (i === k ? id : s)))
  }
  const preview = msg || t('gb_def')
  return (
    <section id="gift" className="giftsec">
      <div className="wrap">
        <p className="eyebrow">{t('eb_g')}</p>
        <h2>{t('gb_h')}</h2>
        <p className="sub">{t('gb_s')}</p>
        <div className="gbox">
          <div className="gl">
            <div className="hc">
              {ROWS.map(([a, b]) => (
                <div className="hr" key={a}>
                  {slots.slice(a, b).map((id, j) => {
                    const i = a + j, p = id ? byId(id) : undefined
                    return (
                      <button key={i} className={'hx' + (p ? ' full' : '')} aria-label={p ? pname(p) : '+'} onClick={() => setSlots(slots.map((s, k) => (k === i ? null : s)))}>
                        {p ? <img src={p.image} alt="" /> : '+'}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
            <p className="hint">{t('gb_hint')}</p>
            <div className="gcard"><p>{preview}</p><small>Cacao Origin</small></div>
          </div>
          <div className="gr">
            <h4>{t('gb_pick')}</h4>
            <div className="gpick">
              {choices.map((p) => (
                <button key={p.id} className="gp" onClick={() => pick(p.id)}>
                  <img src={p.image} alt="" /><span><b>{pname(p)}</b><small>{fmt(p.price)}</small></span>
                </button>
              ))}
            </div>
            <label htmlFor="gmsg">{t('gb_msg')}</label>
            <input id="gmsg" maxLength={80} autoComplete="off" value={msg} placeholder={t('gb_def')} onChange={(e) => setMsg(e.target.value)} />
            <div className="gtot"><span>{t('gb_total')} · <b>{ids.length}/7</b></span><b id="gsum">{fmt(total)}</b></div>
            <div className="gbtn">
              <button className="btn" disabled={!ids.length} onClick={() => { addGift(ids, msg.trim()); setSlots(EMPTY); setMsg('') }}>{t('gb_add')}</button>
              <button className="btn ghost" onClick={() => setSlots(RANDOM.map((id) => (byId(id)?.in_stock ? id : null)))}>{t('gb_rand')}</button>
              <button className="gclr" onClick={() => setSlots(EMPTY)}>{t('gb_clear')}</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
