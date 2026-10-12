'use client'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useShop } from './ShopContext'

const FB_URL = 'https://www.facebook.com/cacaobungo/'
const YT_ID = 'jhjVvstbUmQ'
const YT_START = 8 // giây

const LBL = {
  vi: { fb: 'Facebook Cacao Bungo (mở tab mới)', yt: 'Xem video giới thiệu', close: 'Đóng', cart: 'Giỏ hàng', lang: 'Tiếng Việt', title: 'Video giới thiệu Cacao Bungo' },
  en: { fb: 'Cacao Bungo on Facebook (opens in a new tab)', yt: 'Watch the intro video', close: 'Close', cart: 'Cart', lang: 'English', title: 'Cacao Bungo intro video' },
}

const FbIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-.9.4-1.7 1.8-1.7h1.6V3.8c-.3 0-1.3-.2-2.4-.2-2.5 0-4.1 1.5-4.1 4.2v2.7H7.6v3.3h2.8V22z" /></svg>
)
const YtIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15.2V8.8l5.2 3.2z" /></svg>
)
const CartIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 4h2.8l2.2 11h10.2l2-8H6.2" /><circle cx="9" cy="19.5" r="1.4" /><circle cx="17" cy="19.5" r="1.4" /></svg>
)
const FlagVN = () => (
  <svg viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#da251d" /><polygon points="15.00,4.40 16.39,8.68 20.90,8.68 17.25,11.33 18.64,15.62 15.00,12.97 11.36,15.62 12.75,11.33 9.10,8.68 13.61,8.68" fill="#ff0" /></svg>
)
const FlagUK = () => (
  <svg viewBox="0 0 60 30" aria-hidden="true">
    <clipPath id="uk-clip"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" /></clipPath>
    <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
    <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-clip)" stroke="#C8102E" strokeWidth="4" />
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
  </svg>
)

function VideoModal({ onClose }: { onClose: () => void }) {
  const { L } = useShop()
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    box.current?.querySelector<HTMLElement>('.x')?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose() } }
    document.addEventListener('keydown', onKey, true)
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey, true) }
  }, [onClose])
  return createPortal(
    <div className="modal show" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mbox vid" role="dialog" aria-modal="true" aria-label={LBL[L].title} ref={box}>
        <button type="button" className="x" aria-label={LBL[L].close} onClick={onClose}>×</button>
        <div className="vid-frame">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${YT_ID}?start=${YT_START}&autoplay=1&rel=0`}
            title={LBL[L].title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** Thanh trên cùng: Facebook, YouTube (mở video), cờ đổi ngôn ngữ, giỏ hàng. */
export function TopBar() {
  const { L, setL, count, setUi } = useShop()
  const [video, setVideo] = useState(false)
  const opener = useRef<HTMLElement | null>(null)
  const l = LBL[L]
  return (
    <div className="topbar">
      <div className="wrap">
        <a className="tb-ic" href={FB_URL} target="_blank" rel="noopener noreferrer" aria-label={l.fb}><FbIcon /></a>
        <button type="button" className="tb-ic" aria-label={l.yt} aria-haspopup="dialog" onClick={(e) => { opener.current = e.currentTarget; setVideo(true) }}><YtIcon /></button>
        <div className="tb-flags" role="group" aria-label="Language">
          <button type="button" className="tb-flag" lang="vi" aria-label="Tiếng Việt" aria-pressed={L === 'vi'} onClick={() => setL('vi')}><FlagVN /></button>
          <button type="button" className="tb-flag" lang="en" aria-label="English" aria-pressed={L === 'en'} onClick={() => setL('en')}><FlagUK /></button>
        </div>
        <button type="button" className="tb-cart" aria-label={`${l.cart} (${count})`} onClick={() => setUi({ drawer: true })}>
          <CartIcon /><b key={count} className="bump">{count}</b>
        </button>
      </div>
      {video && <VideoModal onClose={() => { setVideo(false); opener.current?.focus() }} />}
    </div>
  )
}

/** Dải huy hiệu: sản phẩm CNNT tiêu biểu, OCOP, ISO 22000:2018. */
export function BadgeStrip() {
  const { L } = useShop()
  const alt = L === 'vi'
    ? ['Sản phẩm công nghiệp nông thôn tiêu biểu', 'OCOP – Mỗi xã một sản phẩm', 'Chứng nhận ISO 22000:2018']
    : ['Typical rural industrial product', 'OCOP – One Commune One Product', 'ISO 22000:2018 certified']
  return (
    <div className="badges">
      <div className="wrap">
        <img src="/images/badges/ocop-nong-thon.webp" alt={alt[0]} width={154} height={158} />
        <img src="/images/badges/ocop.webp" alt={alt[1]} width={168} height={89} />
        <img src="/images/badges/iso-22000.webp" alt={alt[2]} width={163} height={162} />
      </div>
    </div>
  )
}
