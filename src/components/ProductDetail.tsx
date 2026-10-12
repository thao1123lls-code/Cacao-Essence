'use client'
import Link from 'next/link'
import { T } from '@/lib/i18n'
import { productInfo } from '@/lib/product-info'
import type { Product } from '@/lib/types'
import { useShop } from './ShopContext'

const D = {
  vi: {
    home: 'Trang chủ', coll: 'Bộ sưu tập', in: 'Còn hàng', call: 'Gọi tư vấn', quote: 'Nhận báo giá',
    info: 'Thông tin sản phẩm', weight: 'Khối lượng', ingredients: 'Thành phần', shelf: 'Hạn sử dụng', storage: 'Hướng dẫn bảo quản',
    na: 'Đang cập nhật', hint: 'Một số thông tin đang được cập nhật. Vui lòng gọi hotline để được tư vấn chi tiết.',
    related: 'Sản phẩm cùng loại', back: '← Tiếp tục mua sắm',
  },
  en: {
    home: 'Home', coll: 'Collection', in: 'In stock', call: 'Call us', quote: 'Get a quote',
    info: 'Product details', weight: 'Net weight', ingredients: 'Ingredients', shelf: 'Shelf life', storage: 'Storage instructions',
    na: 'Coming soon', hint: 'Some details are being updated. Please call our hotline for more information.',
    related: 'You may also like', back: '← Keep shopping',
  },
}
const HOTLINE = { href: 'tel:0965724545', label: '0965.72.4545' }

const svg = (d: string) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
)
const ICONS = {
  weight: svg('M5 8h14l1.5 12h-17zM9 8a3 3 0 0 1 6 0'),
  ingredients: svg('M5 19c0-8 5-13 14-14 0 9-5 14-13 14M5 19l7-7'),
  shelf: svg('M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 10h16M9 3v4M15 3v4'),
  storage: svg('M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8'),
}

export default function ProductDetail({ product: p }: { product: Product }) {
  const { L, pname, fmt, addProduct, askChat, products } = useShop()
  const d = D[L]
  const info = productInfo(p, L)
  const specs = [
    { k: 'weight', label: d.weight, v: info.weight },
    { k: 'ingredients', label: d.ingredients, v: info.ingredients },
    { k: 'shelf', label: d.shelf, v: info.shelfLife },
    { k: 'storage', label: d.storage, v: info.storage },
  ] as const
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4)

  return (
    <main id="top" className="pd">
      <div className="wrap">
        <div className="crumb" role="navigation" aria-label="Breadcrumb">
          <Link href="/">{d.home}</Link><span aria-hidden="true">›</span>
          <Link href="/#products">{d.coll}</Link><span aria-hidden="true">›</span>
          <span aria-current="page">{pname(p)}</span>
        </div>

        <article className="pd-grid">
          <div className="pd-img">
            {p.brand.includes('OCOP') && <span className="oc">OCOP</span>}
            <img src={p.image} alt={pname(p)} width={440} height={330} />
          </div>
          <div className="pd-main">
            <p className="br">{p.brand}</p>
            <h1>{pname(p)}</h1>
            <div className="pd-price">
              <span className="price">{p.price ? fmt(p.price) : T[L].contact}</span>
              <span className={'pd-stock ' + (p.in_stock ? 'ok' : 'no')}>{p.in_stock ? d.in : T[L].out}</span>
            </div>
            {info.weight && <p className="pd-weight">{d.weight}: <b>{info.weight}</b></p>}
            <div className="pd-cta">
              {!p.in_stock ? (
                <button className="btn" disabled>{T[L].out}</button>
              ) : p.price ? (
                <button className="btn" onClick={() => addProduct(p.id)}>{T[L].add}</button>
              ) : (
                <button className="btn" onClick={() => askChat(T[L].quoteq + pname(p))}>{d.quote}</button>
              )}
              <a className="btn ghost" href={HOTLINE.href}>{d.call} {HOTLINE.label}</a>
            </div>
          </div>
        </article>

        <section className="pd-info" aria-labelledby="pd-info-h">
          <h2 id="pd-info-h">{d.info}</h2>
          <dl className="pd-specs">
            {specs.map((s) => (
              <div className={'pd-spec' + (s.v ? '' : ' na')} key={s.k}>
                <span className="ic">{ICONS[s.k]}</span>
                <dt>{s.label}</dt>
                <dd>{s.v ?? d.na}</dd>
              </div>
            ))}
          </dl>
          {specs.some((s) => !s.v) && <p className="pd-hint">{d.hint}</p>}
        </section>

        {related.length > 0 && (
          <section className="pd-rel" aria-labelledby="pd-rel-h">
            <h2 id="pd-rel-h">{d.related}</h2>
            <div className="grid shown">
              {related.map((r, i) => (
                <article className="pc" key={r.id} style={{ '--i': i } as React.CSSProperties}>
                  <div className="ph">
                    <Link href={`/san-pham/${r.id}`} tabIndex={-1} aria-hidden="true"><img src={r.image} alt="" width={440} height={330} loading="lazy" /></Link>
                  </div>
                  <div className="pb">
                    <p className="br">{r.brand}</p>
                    <h3><Link href={`/san-pham/${r.id}`}>{pname(r)}</Link></h3>
                    <div className="row"><span className="price">{r.price ? fmt(r.price) : T[L].contact}</span></div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
        <p className="pd-back"><Link href="/#products">{d.back}</Link></p>
      </div>
    </main>
  )
}
