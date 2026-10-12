'use client'
import { useEffect } from 'react'
import Certificates from './Certificates'
import Contact from './Contact'
import GiftBuilder from './GiftBuilder'
import Products from './Products'
import RawMaterial from './RawMaterial'
import Services from './Services'
import { About, Benefits, FlavorMap, Hero, Journey, Marquee } from './Sections'

/** Nội dung trang chủ. Header, Footer, giỏ hàng và chatbot nằm trong ShopShell (layout). */
export default function Store() {
  useEffect(() => {
    // Hiệu ứng hiện dần khi cuộn
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return
      const el = e.target as HTMLElement
      el.classList.add('shown'); io.unobserve(el)
      window.setTimeout(() => { el.style.transitionDelay = '' }, 1600)
    }), { threshold: 0.12 })
    document.querySelectorAll<HTMLElement>('h2,.sub,.about .wrap>*,.bnf .wrap>div,.gbox>div,.fc,#map .wrap>*,.certs .wrap>*,#sourcing .wrap>*,#services .wrap>*,#contact .wrap>*').forEach((el) => {
      const idx = el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : 0
      el.style.transitionDelay = Math.min(idx, 5) * 90 + 'ms'
      el.classList.add('rv'); io.observe(el)
    })
    document.querySelectorAll('.grid').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return (
    <main id="top">
      <Hero /><Marquee /><Benefits /><About /><Products /><Marquee variant="b" /><Services /><RawMaterial /><Journey /><GiftBuilder /><FlavorMap /><Certificates /><Contact />
    </main>
  )
}
