import { STATUS_META, type Order, type OrderStatus } from './types'

const TZ = 'Asia/Ho_Chi_Minh'
const ymd = (d: Date) => d.toLocaleDateString('sv-SE', { timeZone: TZ })
const valid = (o: Order) => o.status !== 'cancelled'
const sum = (a: Order[]) => a.reduce((s, o) => s + o.total, 0)
const pct = (cur: number, prev: number) => (prev ? ((cur - prev) / prev) * 100 : cur ? 100 : 0)

export interface Stats {
  revenue: number; revenueDelta: number
  orders: number; ordersDelta: number
  aov: number; aovDelta: number
  customers: number
  pending: number
  daily: { date: string; revenue: number; orders: number }[]
  status: { name: string; value: number; color: string }[]
  payment: { name: string; value: number; color: string }[]
  topProducts: { name: string; qty: number; revenue: number }[]
  topCustomers: { name: string; phone: string; orders: number; spent: number }[]
}

/** orders: đơn của 2 × `days` ngày gần nhất (kèm order_items), dùng để so sánh với kỳ trước. */
export function buildStats(orders: Order[], days: number): Stats {
  const now = Date.now()
  const cutCur = now - days * 864e5
  const cutPrev = now - 2 * days * 864e5
  const t = (o: Order) => new Date(o.created_at).getTime()
  const cur = orders.filter((o) => t(o) >= cutCur)
  const prev = orders.filter((o) => t(o) >= cutPrev && t(o) < cutCur)
  const vc = cur.filter(valid), vp = prev.filter(valid)
  const revenue = sum(vc), pRevenue = sum(vp)
  const aov = vc.length ? revenue / vc.length : 0
  const pAov = vp.length ? pRevenue / vp.length : 0

  const daily = Array.from({ length: days }, (_, i) => {
    const d = new Date(now - (days - 1 - i) * 864e5)
    const key = ymd(d)
    const day = vc.filter((o) => ymd(new Date(o.created_at)) === key)
    const [, m, dd] = key.split('-')
    return { date: `${dd}/${m}`, revenue: sum(day), orders: day.length }
  })

  const status = (Object.keys(STATUS_META) as OrderStatus[])
    .map((s) => ({ name: STATUS_META[s].label, value: cur.filter((o) => o.status === s).length, color: STATUS_META[s].color }))
    .filter((x) => x.value > 0)
  const payment = [
    { name: 'Thanh toán khi nhận', value: vc.filter((o) => o.payment === 'cod').length, color: '#b4562b' },
    { name: 'Chuyển khoản', value: vc.filter((o) => o.payment === 'bank').length, color: '#2f6fa5' },
  ].filter((x) => x.value > 0)

  const prod = new Map<string, { qty: number; revenue: number }>()
  vc.forEach((o) => o.order_items?.forEach((i) => {
    const p = prod.get(i.name) ?? { qty: 0, revenue: 0 }
    p.qty += i.qty; p.revenue += i.qty * i.unit_price
    prod.set(i.name, p)
  }))
  const topProducts = [...prod].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue).slice(0, 6)

  const cust = new Map<string, { name: string; phone: string; orders: number; spent: number }>()
  cur.forEach((o) => {
    const c = cust.get(o.phone) ?? { name: o.customer_name, phone: o.phone, orders: 0, spent: 0 }
    c.orders++; if (valid(o)) c.spent += o.total
    cust.set(o.phone, c)
  })
  return {
    revenue, revenueDelta: pct(revenue, pRevenue),
    orders: vc.length, ordersDelta: pct(vc.length, vp.length),
    aov, aovDelta: pct(aov, pAov),
    customers: cust.size,
    pending: cur.filter((o) => o.status === 'new').length,
    daily, status, payment, topProducts,
    topCustomers: [...cust.values()].sort((a, b) => b.spent - a.spent).slice(0, 5),
  }
}
