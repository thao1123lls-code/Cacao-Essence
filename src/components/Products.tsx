'use client'
import Link from 'next/link'
import { useState } from 'react'
import { T } from '@/lib/i18n'
import type { Category } from '@/lib/types'
import { useShop } from './ShopContext'

const QUOTE_BTN = { vi: 'Nhận báo giá', en: 'Get a quote' }

export default function Products() {
  const { L, t, products, pname, fmt, addProduct, askChat } = useShop()
  const [cat, setCat] = useState<'all' | Category>('all')
  const n = (c: Category) => products.filter((p) => p.category === c).length
  const filters: ['all' | Category, string, number][] = [
    ['all', t('f_all'), products.length], ['powder', t('f_bot'), n('powder')], ['chocolate', t('f_soc'), n('chocolate')],
  ]
  return (
    <section id="products" className="tint">
      <div className="wrap">
        <p className="eyebrow">{t('eb_p')}</p>
        <h2>{t('h_p')}</h2>
        <p className="sub">{t('s_p')}</p>
        <div className="chips" id="filters" style={{ padding: 0, marginBottom: 30 }}>
          {filters.map(([k, label, c]) => (
            <button key={k} className={cat === k ? 'on' : ''} onClick={() => setCat(k)}>{label} ({c})</button>
          ))}
        </div>
        <div className="grid">
          {products.filter((p) => cat === 'all' || p.category === cat).map((p, i) => (
            <article className="pc" key={p.id} style={{ '--i': i % 6 } as React.CSSProperties}>
              <div className="ph">
                {p.brand.includes('OCOP') && <span className="oc">OCOP</span>}
                <Link href={`/san-pham/${p.id}`} tabIndex={-1} aria-hidden="true"><img src={p.image} alt="" width={440} height={330} loading="lazy" /></Link>
              </div>
              <div className="pb">
                <p className="br">{p.brand}</p>
                <h3><Link href={`/san-pham/${p.id}`}>{pname(p)}</Link></h3>
                <div className="row">
                  <span className="price">{p.price ? fmt(p.price) : t('contact')}</span>
                  {!p.in_stock ? (
                    <button className="add" disabled>{T[L].out}</button>
                  ) : p.price ? (
                    <button className="add" onClick={() => addProduct(p.id)}>{t('add')}</button>
                  ) : (
                    <button className="add" onClick={() => askChat(T[L].quoteq + pname(p))}>{QUOTE_BTN[L]}</button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
