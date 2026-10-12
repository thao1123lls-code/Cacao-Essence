import '@/components/admin/product-admin.css'
import Link from 'next/link'
import { dateTime } from '@/lib/admin'
import {
  ACTION_COLOR, ACTION_LABEL, FIELD_LABEL, SUMMARY_FIELDS, fmtValue, type ProductHistory,
} from '@/lib/product-input'
import { createClient } from '@/lib/supabase/server'

const PAGE = 30

function Changes({ h }: { h: ProductHistory }) {
  if (h.action === 'update') {
    return (
      <ul className="hist-list">
        {h.changed_fields.map((k) => (
          <li key={k}>
            <b>{FIELD_LABEL[k] ?? k}:</b>{' '}
            <span className="hist-from">{fmtValue(k, h.old_data?.[k])}</span> → <span className="hist-to">{fmtValue(k, h.new_data?.[k])}</span>
          </li>
        ))}
      </ul>
    )
  }
  const d = (h.action === 'insert' ? h.new_data : h.old_data) ?? {}
  return (
    <span className="hist-sum">
      {h.action === 'insert' ? 'Sản phẩm mới: ' : 'Sản phẩm đã xóa: '}
      {SUMMARY_FIELDS.filter((k) => d[k] !== '' && d[k] != null).map((k) => `${FIELD_LABEL[k]} ${fmtValue(k, d[k])}`).join(' · ')}
    </span>
  )
}

export default async function ProductHistoryPage({ searchParams }: { searchParams: { id?: string; page?: string } }) {
  const page = Math.max(1, Number(searchParams.page) || 1)
  const id = (searchParams.id ?? '').trim().slice(0, 50)
  let query = createClient()
    .from('product_history')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE, page * PAGE - 1)
  if (id) query = query.eq('product_id', id)
  const { data, error, count } = await query
  const rows = (data ?? []) as ProductHistory[]
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE))
  const href = (p: number) => `/admin/products/history?${new URLSearchParams({ ...(id && { id }), page: String(p) })}`

  return (
    <>
      <div className="adm-head">
        <h1>Lịch sử sản phẩm <small style={{ fontSize: 15, color: 'var(--mute)' }}>({count ?? 0})</small></h1>
        <Link className="adm-btn ln" href="/admin/products">← Về danh sách sản phẩm</Link>
      </div>
      {id && (
        <div className="hist-chip">Đang lọc theo sản phẩm <b>{id}</b> <Link className="adm-btn ln" href="/admin/products/history">Xem tất cả</Link></div>
      )}
      {error ? (
        <div className="adm-note" style={{ margin: 0, maxWidth: 'none' }}>
          Chưa đọc được lịch sử. Hãy chạy <code>supabase/product-history.sql</code> trong SQL Editor.
        </div>
      ) : (
        <div className="adm-tw">
          <table className="adm-tbl">
            <thead><tr><th>Thời gian</th><th>Người thực hiện</th><th>Thao tác</th><th>Sản phẩm</th><th>Thay đổi</th></tr></thead>
            <tbody>
              {rows.map((h) => (
                <tr key={h.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{dateTime(h.created_at)}</td>
                  <td>{h.changed_by_email ?? <small>SQL Editor / hệ thống</small>}</td>
                  <td><span className="hist-badge" style={{ background: ACTION_COLOR[h.action] }}>{ACTION_LABEL[h.action]}</span></td>
                  <td>
                    <b>{h.product_name}</b><br />
                    <Link className="hist-pid" href={`/admin/products/history?id=${encodeURIComponent(h.product_id)}`}>{h.product_id}</Link>
                  </td>
                  <td><Changes h={h} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <div className="adm-empty">Chưa có thay đổi nào được ghi lại.</div>}
        </div>
      )}
      <div className="adm-pager">
        {page > 1 && <Link className="adm-btn ln" href={href(page - 1)}>← Trước</Link>}
        <span>Trang {page}/{pages}</span>
        {page < pages && <Link className="adm-btn ln" href={href(page + 1)}>Sau →</Link>}
      </div>
    </>
  )
}