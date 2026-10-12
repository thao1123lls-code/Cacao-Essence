'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { AX, MP } from '@/lib/i18n'
import Cacao3D from './Cacao3D'
import HexField from './HexField'
import JourneySvg from './JourneySvg'
import PolicyList from './Policies'
import { useShop } from './ShopContext'

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const on = () => {
      const d = document.documentElement
      if (ref.current) ref.current.style.width = (d.scrollTop / (d.scrollHeight - d.clientHeight)) * 100 + '%'
    }
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return <div id="sp" ref={ref} />
}

function Count({ to }: { to: number }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(to); return }
    let raf = 0
    const t0 = performance.now()
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 1500)
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [to])
  return <>{v}</>
}

function Sparks() {
  return (
    <div className="sparks" aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => (
        <i key={i} style={{ left: `${(i * 37 + 11) % 100}%`, '--d': `${7 + ((i * 7) % 9)}s`, '--dl': `${-((i * 13) % 14)}s`, '--s': `${5 + ((i * 5) % 7)}px`, '--dx': `${i % 2 ? 40 : -40}px` } as React.CSSProperties} />
      ))}
    </div>
  )
}

const NAV: [string, string][] = [
  ['#about', 'n0'], ['#products', 'n1'], ['#sourcing', 'n8'], ['#gift', 'n6'], ['#journey', 'n2'], ['#map', 'n3'], ['#certs', 'n7'], ['#contact', 'n4'],
]

export function Header() {
  const { L, setL, t, count, ui, setUi } = useShop()
  const [stuck, setStuck] = useState(false)
  // Ở trang con (vd. chi tiết sản phẩm) menu phải trỏ về trang chủ: "/#products"
  const home = usePathname() === '/'
  const to = (h: string) => (home ? h : '/' + h)
  useEffect(() => {
    const on = () => setStuck(window.scrollY > 30)
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className={stuck ? 'stuck' : ''}>
      <div className="wrap">
        <Link className="brand" href={to('#top')}>
          <img src="/images/emb.webp" alt="Logo Trọng Đức Cacao" />
          <span><b>Cacao Origin</b><small>Trọng Đức Cacao</small></span>
        </Link>
        <nav id="nav" className={ui.nav ? 'open' : ''} onClick={(e) => (e.target as HTMLElement).tagName === 'A' && setUi({ nav: false })}>
          {NAV.map(([href, k]) => <Link key={href} href={to(href)}>{t(k)}</Link>)}
        </nav>
        <div className="hact">
          <button className="lg" aria-label="Language" onClick={() => setL(L === 'vi' ? 'en' : 'vi')}>{L === 'vi' ? 'EN' : 'VI'}</button>
          <button className="cartbtn" onClick={() => setUi({ drawer: true })}>{t('cartb')} <b key={count} className="bump">{count}</b></button>
          <button className={'burger' + (ui.nav ? ' x2' : '')} aria-label="Menu" aria-expanded={ui.nav} onClick={() => setUi({ nav: !ui.nav })}><span /></button>
        </div>
      </div>
    </header>
  )
}

export function Hero() {
  const { t, products } = useShop()
  const tilt = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--rx', ((e.clientX - r.left) / r.width - 0.5) * 14 + 'deg')
    e.currentTarget.style.setProperty('--ry', (0.5 - (e.clientY - r.top) / r.height) * 14 + 'deg')
  }
  const untilt = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--rx', '0deg')
    e.currentTarget.style.setProperty('--ry', '0deg')
  }
  return (
    <div className="hero">
      <HexField />
      <Sparks />
      <div className="wrap">
        <div>
          <span className="pill">Sản phẩm OCOP · Đồng Nai</span>
          <h1>Cacao Origin<span>Bản sắc từ hạt đến quà</span></h1>
          <p className="lead">Từ vườn cacao Đồng Nai đến bột cacao Vinchoco và sô-cô-la Bungo. Vị đậm đà, mộc mạc và nguyên bản, để thưởng thức hay làm quà tặng.</p>
          <a className="btn" href="#products">Mua ngay</a>
          <a className="btn ghost" href="#journey">Khám phá</a>
          <div className="hstats">
            <div><b><Count to={2005} /></b><span>{t('st1')}</span></div>
            <div><b><Count to={products.length} /></b><span>{t('st2')}</span></div>
            <div><b>OCOP</b><span>{t('st3')}</span></div>
          </div>
        </div>
        <div className="stage" onPointerMove={tilt} onPointerLeave={untilt}>
          <svg className="hexring" viewBox="0 0 200 200" aria-hidden="true">
            <polygon points="100,4 183,52 183,148 100,196 17,148 17,52" fill="#f6ecd6" stroke="#5a2a17" strokeOpacity=".35" strokeWidth=".8" />
            <polygon points="100,16 173,58 173,142 100,184 27,142 27,58" fill="none" stroke="#b4562b" strokeOpacity=".5" strokeWidth=".6" strokeDasharray="2 3" />
          </svg>
          <Cacao3D />
          <span className="badge a">Sản phẩm OCOP</span>
          <span className="badge b">Từ năm 2005</span>
        </div>
      </div>
    </div>
  )
}

const RIBBONS = {
  a: [
    ['NGUYÊN BẢN', 'ĐỒNG NAI', 'SẢN PHẨM OCOP', 'TỪ HẠT ĐẾN QUÀ', 'TINH HOA TỪ ĐẤT VIỆT'],
    ['Cacao Origin', 'Vinchoco', 'Bungo', 'Trọng Đức Cacao', 'Since 2005'],
  ],
  b: [
    ['VỊ ĐẬM ĐÀ', 'MỘC MẠC', 'NGUYÊN CHẤT', 'LÀM QUÀ TẶNG', 'HƯƠNG CACAO ĐỒNG NAI'],
    ['Single origin', 'Bean to bar', 'Handmade in Đồng Nai', 'Pure cacao', 'OCOP'],
  ],
}

/**
 * Dải chữ khổng lồ chạy ngang trang, nghiêng nhẹ. Tốc độ tăng và đổi chiều theo lực cuộn,
 * chữ nghiêng (skew) theo vận tốc – cuộn nhanh thì dải "vút" qua.
 */
export function Marquee({ variant = 'a' }: { variant?: 'a' | 'b' }) {
  const root = useRef<HTMLDivElement>(null)
  const rows = RIBBONS[variant]
  useEffect(() => {
    const el = root.current!
    const tracks: HTMLElement[] = Array.from(el.querySelectorAll<HTMLElement>('.rt'))
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const pos = tracks.map(() => 0)
    let raf = 0, vis = true, last = performance.now(), lastY = window.scrollY, vel = 0, dir = 1
    const io = new IntersectionObserver((es) => { vis = es[0].isIntersecting })
    io.observe(el)
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now
      const y = window.scrollY
      vel += ((y - lastY) / Math.max(dt, 0.001) - vel) * 0.12; lastY = y
      if (Math.abs(vel) > 40) dir += (Math.sign(vel) - dir) * 0.08
      if (vis) {
        const boost = 1 + Math.min(Math.abs(vel) / 450, 7)
        tracks.forEach((tr, i) => {
          const half = tr.scrollWidth / 2
          const base = (i % 2 ? -1 : 1) * 70 // px/giây, hàng lẻ chạy ngược
          pos[i] = (((pos[i] - base * dir * boost * dt) % half) + half) % half
          tr.style.transform = `translate3d(${-pos[i]}px,0,0)`
        })
        el.style.setProperty('--sk', Math.max(-14, Math.min(14, -vel / 90)).toFixed(2) + 'deg')
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); io.disconnect() }
  }, [])
  return (
    <div className={'rib rib-' + variant} ref={root} aria-hidden="true">
      <div className="rb">
        {rows.map((words, r) => (
          <div className={'rr r' + r} key={r}>
            <div className="rt">
              {[0, 1, 2, 3].map((c) => words.map((w, i) => <span key={c + '-' + i}>{w}<i>✦</i></span>))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Benefits() {
  const { t } = useShop()
  return (
    <div className="bnf">
      <div className="wrap">
        <div><img src="/images/benefit-1.webp" alt="" /><h3>{t('bn1_h')}</h3><p>{t('bn1_p')}</p></div>
        <div><img src="/images/benefit-2.webp" alt="" /><h3>{t('bn2_h')}</h3><p>{t('bn2_p')}</p></div>
        <div>
          <span className="ico">
            <svg width="64" height="64" viewBox="-32 -32 64 64" fill="none" stroke="#f0c9a0" strokeWidth="2">
              <polygon points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15" />
              <path d="M-14 6V-8h16v14M2-4h8l6 6v4h-4M-14 8h20" />
              <circle cx="-8" cy="10" r="3" fill="#f0c9a0" /><circle cx="9" cy="10" r="3" fill="#f0c9a0" />
            </svg>
          </span>
          <h3>{t('bn3_h')}</h3><p>{t('bn3_p')}</p>
        </div>
      </div>
    </div>
  )
}

export function About() {
  const { t } = useShop()
  const [more, setMore] = useState(false)
  return (
    <section id="about" className="about">
      <div className="wrap">
        <div>
          <p className="eyebrow">{t('eb_a')}</p>
          <h2>{t('ab_h')}</h2>
          <p>{t('ab_p1')}</p>
          <div className="chipsrow"><span>{t('ab_c1')}</span><span>{t('ab_c2')}</span><span>{t('ab_c3')}</span><span>{t('ab_c4')}</span></div>
          <p>{t('ab_p2')}</p>
          <div className={'more' + (more ? ' open' : '')}><p>{t('ab_p3')}</p></div>
          <button className="moreb" aria-expanded={more} onClick={() => setMore(!more)}>{t(more ? 'ab_less' : 'ab_more')}</button>
        </div>
        <figure className="photo" style={{ marginBottom: 14 }}>
          <span className="yr"><span><b>2005</b><span>{t('ab_y')}</span></span></span>
          <img src="/images/gate.webp" alt="Cổng công ty TNHH Cacao Trọng Đức tại Đồng Nai" loading="lazy" />
          <figcaption>{t('ab_cap')}</figcaption>
        </figure>
      </div>
    </section>
  )
}

export function Journey() {
  const { t } = useShop()
  const [a, setA] = useState(1)
  const refs = useRef<(HTMLDivElement | null)[]>([])
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setA(Number((e.target as HTMLElement).dataset.s))),
      { rootMargin: '-45% 0px -45% 0px' },
    )
    refs.current.forEach((r) => r && io.observe(r))
    return () => io.disconnect()
  }, [])
  return (
    <section id="journey" className="dark jr">
      <div className="wrap">
        <p className="eyebrow">{t('eb_j')}</p>
        <h2>{t('jr_h')}</h2>
        <p className="sub">{t('jr_s')}</p>
        <div className="jwrap">
          <div className="jvis">
            <JourneySvg a={a} />
            <div className="jmeta"><b>0{a}</b><div className="jtrack"><i style={{ width: a * 20 + '%' }} /></div><span>05</span></div>
          </div>
          <div className="jsteps">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} ref={(el) => { refs.current[n - 1] = el }} data-s={n} className={'jstep' + (a === n ? ' act' : '')}>
                <span className="n">0{n}</span><h3>{t(`js${n}_t`)}</h3><p>{t(`js${n}_p`)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Radar({ f, r, labels }: { f: number[]; r: number; labels: string[] }) {
  const pt = (v: number, i: number): [number, number] => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 6
    return [Math.cos(a) * r * v / 5, Math.sin(a) * r * v / 5]
  }
  const poly = (v: (i: number) => number) => f.map((_, i) => pt(v(i), i).join(',')).join(' ')
  return (
    <>
      {[1, 2, 3, 4, 5].map((k) => <polygon key={k} points={poly(() => k)} fill="none" stroke="#b4562b" strokeOpacity={k === 5 ? 0.45 : 0.18} />)}
      {f.map((_, i) => {
        const q = pt(5, i), l = pt(6.1, i)
        return (
          <g key={i}>
            <line x1="0" y1="0" x2={q[0]} y2={q[1]} stroke="#b4562b" strokeOpacity=".2" />
            <text x={l[0]} y={l[1] + 4} textAnchor="middle" fontSize="11" fill="#7a5a46">{labels[i]}</text>
          </g>
        )
      })}
      <polygon points={f.map((v, i) => pt(v, i).join(',')).join(' ')} fill="#b4562b" fillOpacity=".34" stroke="#b4562b" strokeWidth="2" />
    </>
  )
}

export function FlavorMap() {
  const { L, t, byId, pname } = useShop()
  const [sel, setSel] = useState(0)
  const m = MP[sel]
  const mx = m.f.indexOf(Math.max(...m.f))
  const p = byId(m.id)
  return (
    <section id="map">
      <div className="wrap two">
        <svg id="bigradar" viewBox="-130 -125 260 250" style={{ width: '100%', maxWidth: 450, margin: 'auto' }} role="img" aria-label={t('h_m')}>
          <Radar f={m.f} r={95} labels={AX[L]} />
        </svg>
        <div>
          <p className="eyebrow">{t('eb_m')}</p>
          <h2>{t('h_m')}</h2>
          <p className="sub">{t('s_m')}</p>
          <div className="chips" style={{ padding: 0 }}>
            {MP.map((x, i) => {
              const q = byId(x.id)
              return q ? <button key={x.id} className={i === sel ? 'on' : ''} onClick={() => setSel(i)}>{pname(q)}</button> : null
            })}
          </div>
          <p style={{ color: 'var(--mute)', marginTop: 16, fontWeight: 500 }}>{t('strong')}{AX[L][mx]}{p ? ' · ' + pname(p) : ''}</p>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const { t } = useShop()
  const Row = ({ k, v }: { k: string; v: React.ReactNode }) => <><dt>{t(k)}</dt><dd>{v}</dd></>
  return (
    <footer id="footer">
      <div className="wrap ft">
        <div className="fc">
          <h4>{t('ct_h')}</h4>
          <b className="co">CÔNG TY TNHH CACAO TRỌNG ĐỨC</b>
          <dl>
            <Row k="l_addr" v="Số 12, Khu dân cư 16, Ấp 4, Xã Phú Hòa, Tp. Đồng Nai, Việt Nam" />
            <Row k="l_tel" v={<a href="tel:+842513629168">(02513) 629 168</a>} />
            <Row k="l_fax" v="(02513) 620 000" />
            <Row k="l_mst" v="3600798643" />
            <Row k="l_issue" v={t('v_issue')} />
            <Row k="l_rep" v="ĐẶNG TƯỜNG KHANH" />
          </dl>
        </div>
        <div className="fc">
          <h4>{t('hot_h')}</h4>
          <a className="hot" href="tel:0965724545"><span>{t('hl_1')}</span><b>0965.72.4545</b></a>
          <a className="hot" href="tel:0914981114"><span>{t('hl_2')}</span><b>091.498.1114</b></a>
          <a className="hot" href="tel:0987778751"><span>{t('hl_3')}</span><b>0987.778.751</b></a>
        </div>
        <div className="fc">
          <h4>{t('pol_h')}</h4>
          <PolicyList />
          <img className="bct" src="/images/badge.webp" alt="Đã thông báo Bộ Công Thương" />
        </div>
      </div>
      <div className="wrap fb">
        <img src="/images/logo.webp" alt="Trọng Đức Cacao" />
        <span>© 2026 Cacao Origin · Công ty TNHH Cacao Trọng Đức, Đồng Nai</span>
        <a href="/admin" className="adl">Quản trị</a>
      </div>
    </footer>
  )
}
