import Link from 'next/link'
import { OrderRow } from '@/components/admin/Client'
import { createClient } from '@/lib/supabase/server'
import { STATUS_META, type Order } from '@/lib/types'

const PAGE = 20

export default async function OrdersPage({ searchParams }: { searchParams: { q?: string; status?: string; page?: string } }) {
  const page = Math.max(1, Number(searchParams.page) || 1)
  const status = searchParams.status && searchParams.status in STATUS_META ? searchParams.status : ''
  const q = (searchParams.q ?? '').replace(/[,()%*]/g, ' ').trim()
  let query = createClient()
    .from('orders')
    .select('*, order_items(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE, page * PAGE - 1)
  if (status) query = query.eq('status', status)
  if (q) query = query.or(`code.ilike.%${q}%,customer_name.ilike.%${q}%,phone.ilike.%${q}%`)
  const { data, count } = await query
  const orders = (data ?? []) as Order[]
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE))
  const href = (p: number) => `/admin/orders?${new URLSearchParams({ ...(q && { q }), ...(status && { status }), page: String(p) })}`

  return (
    <>
      <div className="adm-head"><h1>Đơn hàng <small style={{ fontSize: 15, color: 'var(--mute)' }}>({count ?? 0})</small></h1>
        <a className="adm-btn ln" href="/admin/orders/export" download>Xuất CSV</a></div>
      <form className="adm-filter">
        <input name="q" placeholder="Tìm theo mã đơn, tên, số điện thoại…" defaultValue={q} />
        <select name="status" defaultValue={status}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button className="adm-btn">Lọc</button>
      </form>
      <div className="adm-tw">
        <table className="adm-tbl">
          <thead><tr><th>Mã đơn</th><th>Thời gian</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
          <tbody>{orders.map((o) => <OrderRow key={o.id} order={o} />)}</tbody>
        </table>
        {!orders.length && <div className="adm-empty">Không có đơn hàng phù hợp.</div>}
      </div>
      <div className="adm-pager">
        {page > 1 && <Link className="adm-btn ln" href={href(page - 1)}>← Trước</Link>}
        <span>Trang {page}/{pages}</span>
        {page < pages && <Link className="adm-btn ln" href={href(page + 1)}>Sau →</Link>}
      </div>
    </>
  )
}
