import Link from 'next/link'
import { Donut, RevenueChart, TopProducts } from '@/components/admin/Charts'
import { dateTime, money } from '@/lib/admin'
import { buildStats } from '@/lib/stats'
import { createClient } from '@/lib/supabase/server'
import { STATUS_META, type Order } from '@/lib/types'

function Delta({ v }: { v: number }) {
  const cls = Math.abs(v) < 0.5 ? 'flat' : v > 0 ? 'up' : 'down'
  return <span className={`d ${cls}`}>{v > 0 ? '▲' : v < 0 ? '▼' : '•'} {Math.abs(v).toFixed(1)}% so với kỳ trước</span>
}

export default async function Dashboard({ searchParams }: { searchParams: { range?: string } }) {
  const days = [7, 30, 90].includes(Number(searchParams.range)) ? Number(searchParams.range) : 30
  const sb = createClient()
  const since = new Date(Date.now() - 2 * days * 864e5).toISOString()
  const [{ data }, { count: totalCustomers }, { count: newCustomers }] = await Promise.all([
    sb.from('orders').select('*, order_items(*)').gte('created_at', since).order('created_at', { ascending: false }).limit(5000),
    sb.from('customers').select('id', { count: 'exact', head: true }),
    sb.from('customers').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - days * 864e5).toISOString()),
  ])
  const orders = (data ?? []) as Order[]
  const s = buildStats(orders, days)
  const recent = orders.slice(0, 8)

  return (
    <>
      <div className="adm-head">
        <h1>Tổng quan</h1>
        <div className="adm-range">
          {[7, 30, 90].map((d) => <Link key={d} href={`/admin?range=${d}`} className={d === days ? 'sel' : ''}>{d} ngày</Link>)}
        </div>
      </div>

      <div className="adm-kpis">
        <div className="adm-kpi"><small>Doanh thu</small><b>{money(s.revenue)}</b><Delta v={s.revenueDelta} /></div>
        <div className="adm-kpi"><small>Số đơn (không tính đơn hủy)</small><b>{s.orders}</b><Delta v={s.ordersDelta} /></div>
        <div className="adm-kpi"><small>Giá trị đơn trung bình</small><b>{money(s.aov)}</b><Delta v={s.aovDelta} /></div>
        <div className="adm-kpi"><small>Khách hàng ({days} ngày)</small><b>{s.customers}</b><span className="d flat">{newCustomers ?? 0} khách mới · tổng {totalCustomers ?? 0}</span></div>
      </div>

      <div className="adm-grid">
        <div className="adm-card"><h3>Doanh thu và số đơn theo ngày</h3><RevenueChart data={s.daily} /></div>
        <div className="adm-card"><h3>Trạng thái đơn hàng</h3><Donut data={s.status} /></div>
      </div>
      <div className="adm-grid">
        <div className="adm-card"><h3>Sản phẩm bán chạy (theo doanh thu)</h3><TopProducts data={s.topProducts} /></div>
        <div className="adm-card"><h3>Hình thức thanh toán</h3><Donut data={s.payment} /></div>
      </div>

      <div className="adm-grid" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <div className="adm-card">
          <h3>Đơn hàng mới nhất {s.pending > 0 && <small style={{ color: 'var(--pod)', fontFamily: 'inherit', fontSize: 13 }}>· {s.pending} đơn chờ xử lý</small>}</h3>
          <div className="adm-tw">
            <table className="adm-tbl">
              <thead><tr><th>Mã đơn</th><th>Thời gian</th><th>Khách hàng</th><th>Tổng</th><th>Trạng thái</th></tr></thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id}>
                    <td><b>{o.code}</b></td><td>{dateTime(o.created_at)}</td><td>{o.customer_name}</td><td>{money(o.total)}</td>
                    <td><span style={{ color: STATUS_META[o.status].color, fontWeight: 600 }}>{STATUS_META[o.status].label}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!recent.length && <div className="adm-empty">Chưa có đơn hàng nào.</div>}
          </div>
          <div style={{ padding: '10px 4px' }}><Link href="/admin/orders" className="adm-btn ln">Xem tất cả đơn hàng</Link></div>
        </div>
        <div className="adm-card">
          <h3>Khách hàng chi tiêu nhiều nhất</h3>
          <table className="adm-tbl">
            <thead><tr><th>Khách hàng</th><th>Đơn</th><th>Chi tiêu</th></tr></thead>
            <tbody>
              {s.topCustomers.map((c) => <tr key={c.phone}><td>{c.name}<br /><small>{c.phone}</small></td><td>{c.orders}</td><td>{money(c.spent)}</td></tr>)}
            </tbody>
          </table>
          {!s.topCustomers.length && <div className="adm-empty">Chưa có dữ liệu.</div>}
        </div>
      </div>
    </>
  )
}
