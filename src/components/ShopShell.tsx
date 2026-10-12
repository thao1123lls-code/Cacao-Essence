'use client'
import { useEffect, type ReactNode } from 'react'
import type { Product } from '@/lib/types'
import Chatbot from './Chatbot'
import { CartDrawer, Checkout } from './CartCheckout'
import { ShopProvider, useShop } from './ShopContext'
import { Footer, Header, ScrollProgress } from './Sections'
import { BadgeStrip, TopBar } from './TopBar'

/** Khung dùng chung cho mọi trang cửa hàng: giỏ hàng, chatbot, header, footer. Đặt ở layout nên giỏ hàng không mất khi chuyển trang. */
function Frame({ children }: { children: ReactNode }) {
  const { ui, setUi } = useShop()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setUi({ drawer: false, chat: false, checkout: false, nav: false })
    const onResize = () => window.innerWidth > 820 && setUi({ nav: false })
    window.addEventListener('keydown', onKey); window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize) }
  }, [setUi])
  return (
    <>
      <ScrollProgress />
      <TopBar />
      <BadgeStrip />
      <Header />
      {children}
      <Footer />
      <div id="ov" className={(ui.drawer || ui.nav ? 'on' : '') + (ui.drawer ? ' dr' : '')} onClick={() => setUi({ drawer: false, nav: false })} />
      <CartDrawer /><Checkout /><Chatbot />
    </>
  )
}

export default function ShopShell({ products, children }: { products: Product[]; children: ReactNode }) {
  return <ShopProvider products={products}><Frame>{children}</Frame></ShopProvider>
}
