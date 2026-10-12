'use client'
import { useEffect, useRef, useState } from 'react'
import { useShop } from './ShopContext'

const MAPS = [
  { q: 'Cacao Trọng Đức, Phú Hòa, Định Quán, Đồng Nai', vi: 'Cacao Trọng Đức · Phú Hòa, Định Quán', en: 'Trong Duc Cacao · Phu Hoa, Dinh Quan' },
  { q: 'BunGo Thế giới Ca Cao, Thành phố Hồ Chí Minh', vi: 'BunGo Thế giới Ca Cao · TP. Hồ Chí Minh', en: 'BunGo Cacao World · Ho Chi Minh City' },
]

const TXT = {
  vi: {
    eb: 'Kết nối với chúng tôi', h: 'Liên hệ',
    co: 'CÔNG TY TNHH CA CAO TRỌNG ĐỨC',
    addr: 'Địa chỉ', addrV: 'Số 12, Khu dân cư 16, Ấp 4, Xã Phú Hòa, Tp. Đồng Nai, Việt Nam',
    tel: 'Điện thoại', fax: 'Fax', hot: 'Hotline', agri: 'Phòng nông nghiệp (cây giống)', mail: 'Email', web: 'Website',
    openMap: 'Mở trong Google Maps',
    fh: 'Thông tin liên hệ',
    fs: 'Quý khách có thể liên hệ với chúng tôi bằng cách điền thông tin vào mẫu bên dưới. Chúng tôi sẽ liên hệ với quý khách trong thời gian sớm nhất hoặc gọi điện thoại để được tư vấn.',
    name: 'Họ và tên', phone: 'Điện thoại', email: 'Email', msg: 'Nội dung',
    pn: 'Vui lòng nhập tên bạn', pp: 'Ví dụ: 0912 345 678', pe: 'Vui lòng nhập email bạn (không bắt buộc)', pm: 'Vui lòng nhập nội dung',
    send: 'Gửi thông tin', sending: 'Đang gửi…',
    ok: 'Cảm ơn bạn! Chúng tôi đã nhận thông tin và sẽ liên hệ sớm nhất.',
    demo: 'Cảm ơn bạn! (Chế độ demo: chưa kết nối cơ sở dữ liệu nên tin nhắn chưa được lưu.)',
    errInvalid: 'Vui lòng nhập họ tên, số điện thoại hợp lệ và nội dung (ít nhất 5 ký tự).',
    errSend: 'Chưa gửi được. Bạn thử lại sau hoặc gọi trực tiếp cho chúng tôi nhé.',
    errRate: 'Bạn gửi hơi nhiều lần. Vui lòng thử lại sau ít phút.',
    req: 'bắt buộc',
  },
  en: {
    eb: 'Get in touch', h: 'Contact',
    co: 'TRONG DUC CACAO CO., LTD.',
    addr: 'Address', addrV: 'No. 12, Residential Area 16, Hamlet 4, Phu Hoa Commune, Dong Nai, Vietnam',
    tel: 'Phone', fax: 'Fax', hot: 'Hotline', agri: 'Agriculture dept. (seedlings)', mail: 'Email', web: 'Website',
    openMap: 'Open in Google Maps',
    fh: 'Contact form',
    fs: 'Fill in the form below and we will get back to you as soon as possible, or call you to advise.',
    name: 'Full name', phone: 'Phone', email: 'Email', msg: 'Message',
    pn: 'Your name', pp: 'e.g. 0912 345 678', pe: 'Your email (optional)', pm: 'How can we help?',
    send: 'Send', sending: 'Sending…',
    ok: 'Thank you! We have received your message and will contact you shortly.',
    demo: 'Thank you! (Demo mode: no database connected, so the message was not saved.)',
    errInvalid: 'Please enter your name, a valid phone number and a message (at least 5 characters).',
    errSend: 'Could not send. Please try again later or call us directly.',
    errRate: 'Too many attempts. Please try again in a few minutes.',
    req: 'required',
  },
}

const mapSrc = (q: string, hl: string) => `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed&hl=${hl}`
const mapLink = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`

export default function Contact() {
  const { L } = useShop()
  const l = TXT[L]
  const t0 = useRef(0)
  const [st, setSt] = useState<'idle' | 'sending' | 'ok' | 'demo' | 'err'>('idle')
  const [err, setErr] = useState('')
  useEffect(() => { t0.current = Date.now() }, [])

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (st === 'sending') return
    const form = e.currentTarget
    const fd = new FormData(form)
    setSt('sending'); setErr('')
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'), phone: fd.get('phone'), email: fd.get('email'), message: fd.get('message'),
          website: fd.get('website'), elapsed: Date.now() - t0.current,
        }),
      })
      const j = await r.json().catch(() => ({}))
      if (r.ok && j.ok) { setSt(j.demo ? 'demo' : 'ok'); form.reset(); t0.current = Date.now(); return }
      setErr(r.status === 400 ? l.errInvalid : r.status === 429 ? l.errRate : l.errSend); setSt('err')
    } catch {
      setErr(l.errSend); setSt('err')
    }
  }

  return (
    <section id="contact" className="ctc">
      <div className="wrap">
        <p className="eyebrow">{l.eb}</p>
        <h2>{l.h}</h2>
        <div className="ctc-grid">
          <div className="ctc-info">
            <h3>{l.co}</h3>
            <dl>
              <dt>{l.addr}</dt><dd>{l.addrV}</dd>
              <dt>{l.tel}</dt><dd><a href="tel:+842513629168">(02513) 629 168</a></dd>
              <dt>{l.fax}</dt><dd>(02513) 620 000</dd>
              <dt>{l.hot}</dt><dd><a href="tel:0965724545">0965 724 545</a></dd>
              <dt>{l.agri}</dt><dd><a href="tel:0987778751">0987 778 751</a></dd>
              <dt>{l.mail}</dt><dd><a href="mailto:sales.cacaotrongduc@gmail.com">sales.cacaotrongduc@gmail.com</a></dd>
              <dt>{l.web}</dt><dd>www.trongduccacao.vn · www.cacaotrongduc.com</dd>
            </dl>
            {MAPS.map((m) => (
              <figure className="ctc-map" key={m.q}>
                <figcaption>
                  <span>{L === 'vi' ? m.vi : m.en}</span>
                  <a href={mapLink(m.q)} target="_blank" rel="noopener noreferrer">{l.openMap} ↗</a>
                </figcaption>
                <iframe src={mapSrc(m.q, L)} title={L === 'vi' ? m.vi : m.en} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
              </figure>
            ))}
          </div>

          <form className="ctc-form" onSubmit={submit} noValidate>
            <h3>{l.fh}</h3>
            <p className="ctc-fs">{l.fs}</p>
            <label>{l.name} <i aria-label={l.req}>*</i>
              <input name="name" type="text" autoComplete="name" required minLength={2} maxLength={120} placeholder={l.pn} />
            </label>
            <label>{l.phone} <i aria-label={l.req}>*</i>
              <input name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={30} placeholder={l.pp} />
            </label>
            <label>{l.email}
              <input name="email" type="email" autoComplete="email" maxLength={160} placeholder={l.pe} />
            </label>
            <label>{l.msg} <i aria-label={l.req}>*</i>
              <textarea name="message" rows={5} required minLength={5} maxLength={2000} placeholder={l.pm} />
            </label>
            {/* Bẫy bot: người thật không thấy ô này */}
            <div className="ctc-hp" aria-hidden="true"><label>Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label></div>
            <div className="ctc-msg" role="status" aria-live="polite">
              {st === 'ok' && <span className="ok">{l.ok}</span>}
              {st === 'demo' && <span className="ok">{l.demo}</span>}
              {st === 'err' && <span className="bad">{err}</span>}
            </div>
            <button className="btn" type="submit" disabled={st === 'sending'}>{st === 'sending' ? l.sending : l.send}</button>
          </form>
        </div>
      </div>
    </section>
  )
}
