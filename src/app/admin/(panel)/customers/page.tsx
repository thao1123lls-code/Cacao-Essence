import { dateTime, money } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import type { Customer } from '@/lib/types'

export default async function CustomersPage({ searchParams }: { searchParams: { q?: string } }) {
  const sb = createClient()
  const [{ data: cs }, { data: os }] = await Promise.all([
    sb.from('customers').select('*').limit(2000),
    sb.from('orders').select('customer_id,total,status,created_at').limit(10000),
  ])
  const agg = new Map<string, { n: number; spent: number; last: string }>()
  ;(os ?? []).forEach((o) => {
    if (!o.customer_id) return
    const a = agg.get(o.customer_id) ?? { n: 0, spent: 0, last: '' }
    a.n++
    if (o.status !== 'cancelled') a.spent += o.total
    if (o.created_at > a.last) a.last = o.created_at
    agg.set(o.customer_id, a)
  })
  const q = (searchParams.q ?? '').toLowerCase().trim()
  const rows = ((cs ?? []) as Customer[])
    .map((c) => ({ c, a: agg.get(c.id) ?? { n: 0, spent: 0, last: '' } }))
    .filter(({ c }) => !q || (c.name + c.phone).toLowerCase().includes(q))
    .sort((x, y) => y.a.spent - x.a.spent)

  return (
    <>
      <div className="adm-head"><h1>Khách hàng <small style={{ fontSize: 15, color: 'var(--mute)' }}>({rows.length})</small></h1></div>
      <form className="adm-filter"><input name="q" placeholder="Tìm theo tên hoặc số điện thoại…" defaultValue={searchParams.q ?? ''} /><button className="adm-btn">Tìm</button></form>
      <div className="adm-tw">
        <table className="adm-tbl">
          <thead><tr><th>Khách hàng</th><th>Số điện thoại</th><th>Địa chỉ gần nhất</th><th>Số đơn</th><th>Tổng chi tiêu</th><th>Đơn gần nhất</th></tr></thead>
          <tbody>
            {rows.map(({ c, a }) => (
              <tr key={c.id}><td><b>{c.name}</b></td><td>{c.phone}</td><td>{c.address}</td><td>{a.n}</td><td>{money(a.spent)}</td><td>{a.last ? dateTime(a.last) : '—'}</td></tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <div className="adm-empty">Chưa có khách hàng.</div>}
      </div>
    </>
  )
}
