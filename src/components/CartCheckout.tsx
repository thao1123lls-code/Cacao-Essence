'use client'
import { useState } from 'react'
import { CO } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import { useShop } from './ShopContext'

export function CartDrawer() {
  const { L, t, lines, total, fmt, remove, ui, setUi } = useShop()
  return (
    <aside className={'drawer' + (ui.drawer ? ' open' : '')} id="drawer" aria-label={t('cart')}>
      <button className="x" aria-label="Close" onClick={() => setUi({ drawer: false })}>×</button>
      <h3>{t('cart')}</h3>
      <div id="items">
        {lines.length === 0 && <p style={{ color: 'var(--mute)' }}>{t('empty')}</p>}
        {lines.map((l) => (
          <div className="it" key={l.key}>
            <div>
              {l.name[L]} × {l.qty}
              {l.note && <><br /><small style={{ color: 'var(--mute)' }}>“{l.note}”</small></>}
              <br /><button onClick={() => remove(l.key)}>{t('rm')}</button>
            </div>
            <div>{fmt(l.price * l.qty)}</div>
          </div>
        ))}
      </div>
      <div className="tot"><span>{t('total')}</span><span>{fmt(total)}</span></div>
      <button className="btn" onClick={() => lines.length && setUi({ drawer: false, checkout: true })}>{t('co')}</button>
    </aside>
  )
}

const ERR2 = { vi: 'Không gửi được đơn hàng. Vui lòng thử lại hoặc gọi hotline.', en: 'Could not send your order. Please try again or call our hotline.' }

export function Checkout() {
  const { L, lines, total, fmt, clear, ui, setUi } = useShop()
  const c = CO[L]
  const [f, setF] = useState({ name: '', phone: '', address: '', note: '', pay: 'cod' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [code, setCode] = useState('')
  if (!ui.checkout) return null
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value })
  const close = () => { setUi({ checkout: false }); setCode(''); setErr('') }

  const submit = async () => {
    const phone = f.phone.replace(/[\s.\-]/g, '')
    if (f.name.trim().length < 2 || f.address.trim().length < 5 || !/^(0|\+84)\d{9,10}$/.test(phone)) return setErr(c.err)
    setBusy(true); setErr('')
    const items = lines.map((l) => (l.gift ? { gift: l.gift, qty: l.qty } : { id: l.productId, qty: l.qty }))
    const sb = createClient()
    if (!sb) {
      // Chế độ demo: chưa cấu hình Supabase
      setCode('DEMO' + Date.now().toString(36).toUpperCase())
    } else {
      const { data, error } = await sb.rpc('create_order', {
        p_name: f.name.trim(), p_phone: phone, p_address: f.address.trim(), p_note: f.note.trim(), p_payment: f.pay, p_items: items,
      })
      if (error) { setBusy(false); return setErr(ERR2[L]) }
      setCode((data as { code: string }).code)
    }
    clear(); setBusy(false)
  }
  return (
    <div className="modal show" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="mbox" role="dialog" aria-modal="true">
        <button className="x" aria-label="Close" onClick={close}>×</button>
        {code ? (
          <div className="okb"><div>{c.ok}</div><b>{code}</b><div>{c.ok2}</div><button className="btn" style={{ marginTop: 14 }} onClick={close}>OK</button></div>
        ) : (
          <>
            <h3>{c.t}</h3>
            <div className="cosum">
              {lines.map((l) => <div key={l.key}><span>{l.name[L]} × {l.qty}</span><span>{fmt(l.price * l.qty)}</span></div>)}
              <div className="t"><span>{c.tot}</span><span>{fmt(total)}</span></div>
            </div>
            <label htmlFor="cn">{c.n}</label><input id="cn" autoComplete="name" value={f.name} onChange={set('name')} />
            <label htmlFor="cp">{c.p}</label><input id="cp" type="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} />
            <label htmlFor="ca">{c.a}</label><input id="ca" autoComplete="street-address" value={f.address} onChange={set('address')} />
            <label htmlFor="cm">{c.m}</label><input id="cm" value={f.note} onChange={set('note')} />
            <div className="payr">
              <label><input type="radio" name="pay" checked={f.pay === 'cod'} onChange={() => setF({ ...f, pay: 'cod' })} /> <span>{c.cod}</span></label>
              <label><input type="radio" name="pay" checked={f.pay === 'bank'} onChange={() => setF({ ...f, pay: 'bank' })} /> <span>{c.bank}</span></label>
            </div>
            <p className="err">{err}</p>
            <button className="btn" disabled={busy} onClick={submit}>{c.go}</button>
          </>
        )}
      </div>
    </div>
  )
}
