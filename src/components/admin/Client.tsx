'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { updateOrderStatus, updateProduct } from '@/app/admin/actions'
import { createClient } from '@/lib/supabase/client'
import { PAYMENT_LABEL, STATUS_META, type Order, type OrderStatus, type Product } from '@/lib/types'
import { RowActions } from './ProductForm'
const money = (n: number) => Math.round(n).toLocaleString('vi-VN') + 'đ'
const when = (iso: string) => new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })

const LINKS = [['/admin', 'Tổng quan'], ['/admin/orders', 'Đơn hàng'], ['/admin/customers', 'Khách hàng'], ['/admin/products', 'Sản phẩm'], ['/admin/chatbot', 'Chatbot'], ['/admin/contacts', 'Liên hệ']]
export function AdminNav() {
  const path = usePathname()
  return (
    <nav className="adm-nav">
      {LINKS.map(([href, label]) => (
        <Link key={href} href={href} className={path === href || (href !== '/admin' && path.startsWith(href)) ? 'sel' : ''}>{label}</Link>
      ))}
    </nav>
  )
}

export function SignOut() {
  const router = useRouter()
  return (
    <button className="adm-ghost" onClick={async () => { await createClient()?.auth.signOut(); router.push('/admin/login'); router.refresh() }}>
      Đăng xuất
    </button>
  )
}

/** Tự làm mới dữ liệu khi có đơn mới (Supabase Realtime). */
export function RealtimeRefresh() {
  const router = useRouter()
  const [note, setNote] = useState('')
  useEffect(() => {
    const sb = createClient()
    if (!sb) return
    const ch = sb.channel('orders-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (p) => {
        if (p.eventType === 'INSERT') { setNote('Có đơn hàng mới!'); window.setTimeout(() => setNote(''), 5000) }
        router.refresh()
      })
      .subscribe()
    return () => { sb.removeChannel(ch) }
  }, [router])
  return note ? <div className="adm-toast">🔔 {note}</div> : null
}

export function OrderRow({ order }: { order: Order }) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [err, setErr] = useState('')
  const [pending, start] = useTransition()
  const change = (s: OrderStatus) => {
    const old = status
    setStatus(s); setErr('')
    start(async () => {
      const r = await updateOrderStatus(order.id, s)
      if (r.error) { setStatus(old); setErr(r.error) }
    })
  }
  const color = STATUS_META[status].color
  return (
    <>
      <tr className="adm-click" onClick={() => setOpen(!open)}>
        <td><b>{order.code}</b></td>
        <td>{when(order.created_at)}</td>
        <td>{order.customer_name}<br /><small>{order.phone}</small></td>
        <td>{money(order.total)}</td>
        <td onClick={(e) => e.stopPropagation()}>
          <select value={status} disabled={pending} onChange={(e) => change(e.target.value as OrderStatus)} style={{ borderColor: color, color, fontWeight: 600 }}>
            {(Object.keys(STATUS_META) as OrderStatus[]).map((k) => <option key={k} value={k}>{STATUS_META[k].label}</option>)}
          </select>
          {err && <small className="adm-err"> {err}</small>}
        </td>
      </tr>
      {open && (
        <tr className="adm-detail">
          <td colSpan={5}>
            <b>Địa chỉ:</b> {order.address}<br />
            <b>Thanh toán:</b> {PAYMENT_LABEL[order.payment]}
            {order.note && <><br /><b>Ghi chú:</b> {order.note}</>}
            <ul>
              {order.order_items?.map((i) => (
                <li key={i.id}>{i.name} × {i.qty} = {money(i.qty * i.unit_price)}{i.note && <em> ({i.note})</em>}</li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </>
  )
}

export function ProductRow({ p, sold }: { p: Product; sold: number }) {
  const [price, setPrice] = useState(String(p.price))
  const [stock, setStock] = useState(p.in_stock)
  const [msg, setMsg] = useState('')
  const [pending, start] = useTransition()
  const dirty = Number(price) !== p.price || stock !== p.in_stock
  const save = () => start(async () => {
    const r = await updateProduct(p.id, { price: Number(price), in_stock: stock })
    setMsg(r.error ? r.error : 'Đã lưu')
    window.setTimeout(() => setMsg(''), 2500)
  })
  return (
    <tr>
      <td><img className="adm-thumb" src={p.image} alt="" />{p.name_vi}</td>
      <td><input type="number" min={0} step={1000} value={price} onChange={(e) => setPrice(e.target.value)} /></td>
      <td><input type="checkbox" checked={stock} onChange={(e) => setStock(e.target.checked)} style={{ width: 20, height: 20 }} /></td>
      <td>{sold}</td>
      <td><button className="adm-btn" disabled={!dirty || pending} onClick={save}>Lưu</button> <small>{msg}</small></td>
      <td><RowActions p={p} /></td>     
    </tr>
  )
}
     