'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useShop } from './ShopContext'

type Group = 'ocop' | 'cnnt' | 'award'
type Cert = { src: string; w: number; h: number; group: Group; vi: string; en: string; subVi: string; subEn: string }

const D = '/images/certs/'
/** Danh sách chứng nhận. Thêm ảnh mới: bỏ file .webp vào public/images/certs rồi thêm một dòng ở đây. */
const CERTS: Cert[] = [
  { src: 'ocop-bot-nguyen-chat-4sao', w: 528, h: 801, group: 'ocop', vi: 'Bột cacao nguyên chất', en: 'Pure cacao powder', subVi: 'OCOP 4 sao · 2019', subEn: 'OCOP 4 stars · 2019' },
  { src: 'ocop-bungo-4sao', w: 514, h: 809, group: 'ocop', vi: 'Sô-cô-la đắng Bungo', en: 'Bungo dark chocolate', subVi: 'OCOP 4 sao · 2020', subEn: 'OCOP 4 stars · 2020' },
  { src: 'ocop-ruou-vang-3sao', w: 596, h: 853, group: 'ocop', vi: 'Rượu vang cacao', en: 'Cacao wine', subVi: 'OCOP 3 sao · 2019', subEn: 'OCOP 3 stars · 2019' },

  { src: 'cnnt-khu-vuc-bot-nguyen-chat', w: 585, h: 777, group: 'cnnt', vi: 'Bột cacao nguyên chất', en: 'Pure cacao powder', subVi: 'Cấp khu vực · 2020', subEn: 'Regional level · 2020' },
  { src: 'cnnt-tinh-bot-3in1', w: 582, h: 774, group: 'cnnt', vi: 'Bột cacao 3 in 1 Bungo', en: 'Bungo 3-in-1 cacao powder', subVi: 'Cấp tỉnh Đồng Nai · 2020', subEn: 'Dong Nai province · 2020' },
  { src: 'cnnt-huyen-bot-3in1', w: 618, h: 844, group: 'cnnt', vi: 'Bột cacao 3 in 1 Bungo', en: 'Bungo 3-in-1 cacao powder', subVi: 'Cấp huyện Định Quán · 2020', subEn: 'Dinh Quan district · 2020' },
  { src: 'cnnt-huyen-bungo', w: 568, h: 831, group: 'cnnt', vi: 'Sô-cô-la đắng Bungo', en: 'Bungo dark chocolate', subVi: 'Cấp huyện Định Quán · 2020', subEn: 'Dinh Quan district · 2020' },
  { src: 'cup-cnnt-khu-vuc', w: 581, h: 843, group: 'cnnt', vi: 'Cúp sản phẩm CNNT tiêu biểu', en: 'Typical rural industrial product trophy', subVi: 'Cục Công thương địa phương', subEn: 'Local Industry & Trade Dept.' },

  { src: 'nong-nghiep-tieu-bieu-2016', w: 800, h: 558, group: 'award', vi: 'Sản phẩm nông nghiệp tiêu biểu', en: 'Typical agricultural product', subVi: 'Hội Nông dân Việt Nam · 2016', subEn: 'Vietnam Farmers’ Union · 2016' },
  { src: 'top10-ua-chuong', w: 804, h: 597, group: 'award', vi: 'Top 10 sản phẩm ưa chuộng nhất', en: 'Top 10 most favoured products', subVi: 'Hàng Việt Nam được người tiêu dùng bình chọn', subEn: 'Vietnamese goods chosen by consumers' },
  { src: 'tai-tro-senior-football-2018', w: 787, h: 620, group: 'award', vi: 'Nhà tài trợ giải bóng đá quốc tế', en: 'Sponsor, international senior football championship', subVi: 'Nha Trang · 2018', subEn: 'Nha Trang · 2018' },
]

const TXT = {
  vi: {
    eb: 'Uy tín & chất lượng', h: 'Chứng nhận và giải thưởng',
    s: 'Những ghi nhận cho sản phẩm Cacao Trọng Đức, từ OCOP, sản phẩm công nghiệp nông thôn tiêu biểu đến hệ thống quản lý chất lượng.',
    all: 'Tất cả', ocop: 'OCOP', cnnt: 'CNNT tiêu biểu', award: 'Giải thưởng',
    q: 'Hệ thống chất lượng', qs: 'ISO 22000:2018, UTZ Certified và Hàng Việt Nam chất lượng cao 2019.',
    qalt: 'Biểu tượng ISO 22000:2018, UTZ Certified, Hàng Việt Nam chất lượng cao 2019',
    gate: 'Giấy chứng nhận chất lượng tại công ty',
    view: 'Xem lớn', close: 'Đóng', prev: 'Ảnh trước', next: 'Ảnh sau', of: '/',
  },
  en: {
    eb: 'Trust & quality', h: 'Certificates and awards',
    s: 'Recognition for Trong Duc Cacao products, from OCOP and typical rural industrial products to quality management systems.',
    all: 'All', ocop: 'OCOP', cnnt: 'Rural industry', award: 'Awards',
    q: 'Quality systems', qs: 'ISO 22000:2018, UTZ Certified and Vietnam High Quality Goods 2019.',
    qalt: 'ISO 22000:2018, UTZ Certified and Vietnam High Quality Goods 2019 logos',
    gate: 'Quality certificates at the company',
    view: 'View larger', close: 'Close', prev: 'Previous', next: 'Next', of: '/',
  },
}

type Item = { src: string; w: number; h: number; title: string; sub: string }

export function Lightbox({ items, start, onClose }: { items: Item[]; start: number; onClose: () => void }) {
  const { L } = useShop()
  const l = TXT[L]
  const [i, setI] = useState(start)
  const box = useRef<HTMLDivElement>(null)
  const touch = useRef<number | null>(null)
  const n = items.length
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    box.current?.querySelector<HTMLElement>('.lbx')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose() }
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'ArrowRight') go(1)
    }
    document.addEventListener('keydown', onKey, true)
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey, true) }
  }, [go, onClose])

  const it = items[i]
  return createPortal(
    <div
      className="lb"
      role="dialog"
      aria-modal="true"
      aria-label={it.title}
      ref={box}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        if (touch.current == null) return
        const dx = e.changedTouches[0].clientX - touch.current
        touch.current = null
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
      }}
    >
      <button type="button" className="lbx" aria-label={l.close} onClick={onClose}>×</button>
      {n > 1 && <button type="button" className="lbn lbp" aria-label={l.prev} onClick={() => go(-1)}>‹</button>}
      <figure className="lbf">
        <img key={it.src} src={it.src} alt={it.title} width={it.w} height={it.h} />
        <figcaption><b>{it.title}</b><span>{it.sub}</span><i>{i + 1} {l.of} {n}</i></figcaption>
      </figure>
      {n > 1 && <button type="button" className="lbn lbs" aria-label={l.next} onClick={() => go(1)}>›</button>}
    </div>,
    document.body,
  )
}

export default function Certificates() {
  const { L } = useShop()
  const l = TXT[L]
  const [g, setG] = useState<'all' | Group>('all')
  const [open, setOpen] = useState<number | null>(null)
  const opener = useRef<HTMLElement | null>(null)

  const list = CERTS.filter((c) => g === 'all' || c.group === g)
  const items: Item[] = list.map((c) => ({ src: `${D}${c.src}.webp`, w: c.w, h: c.h, title: L === 'vi' ? c.vi : c.en, sub: L === 'vi' ? c.subVi : c.subEn }))
  const tabs: ['all' | Group, string][] = [['all', l.all], ['ocop', l.ocop], ['cnnt', l.cnnt], ['award', l.award]]
  const close = useCallback(() => { setOpen(null); opener.current?.focus() }, [])

  return (
    <section id="certs" className="certs">
      <div className="wrap">
        <p className="eyebrow">{l.eb}</p>
        <h2>{l.h}</h2>
        <p className="sub">{l.s}</p>

        <div className="qsys">
          <img src={`${D}quality-systems.webp`} alt={l.qalt} width={1763} height={588} loading="lazy" />
          <div><h3>{l.q}</h3><p>{l.qs}</p></div>
        </div>

        <div className="chips ctabs" role="group" aria-label={l.h}>
          {tabs.map(([k, label]) => (
            <button key={k} type="button" className={g === k ? 'on' : ''} aria-pressed={g === k} onClick={() => setG(k)}>{label}</button>
          ))}
        </div>

        <ul className="cgrid">
          {list.map((c, idx) => {
            const it = items[idx]
            return (
              <li key={c.src}>
                <button type="button" className="cc" aria-label={`${l.view}: ${it.title}`} aria-haspopup="dialog" onClick={(e) => { opener.current = e.currentTarget; setOpen(idx) }}>
                  <span className="cimg"><img src={it.src} alt="" width={c.w} height={c.h} loading="lazy" /></span>
                  <span className="ccap"><b>{it.title}</b><small>{it.sub}</small></span>
                </button>
              </li>
            )
          })}
        </ul>

        <figure className="cgate">
          <img src={`${D}chung-nhan-iso-utz.webp`} alt={l.gate} width={639} height={641} loading="lazy" />
          <figcaption>{l.gate}</figcaption>
        </figure>
      </div>
      {open != null && <Lightbox items={items} start={open} onClose={close} />}
    </section>
  )
}
