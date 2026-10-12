import Link from 'next/link'
import { ProductRow } from '@/components/admin/Client'
import { AddProductButton } from '@/components/admin/ProductForm'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'

export default async function ProductsPage() {
  const sb = createClient()
  const [{ data: ps }, { data: items }] = await Promise.all([
    sb.from('products').select('*').order('sort'),
    sb.from('order_items').select('product_id, qty, orders!inner(status)').neq('orders.status', 'cancelled').not('product_id', 'is', null).limit(20000),
  ])
  const sold = new Map<string, number>()
  ;(items ?? []).forEach((i) => sold.set(i.product_id as string, (sold.get(i.product_id as string) ?? 0) + i.qty))
  return (
    <>
      <div className="adm-head">
        <h1>Sản phẩm</h1>
        <div className="pm-tools">
          <Link className="adm-btn ln" href="/admin/products/history">Lịch sử thay đổi</Link>
          <AddProductButton />
        </div>
      </div>
      <p style={{ color: 'var(--mute)', marginTop: -8 }}>Sửa nhanh giá hoặc “Còn hàng” rồi bấm Lưu, hoặc bấm Sửa để chỉnh toàn bộ thông tin. Trang cửa hàng cập nhật trong vòng 1 phút. Giá 0đ nghĩa là “liên hệ báo giá”.</p>
      <div className="adm-tw">
        <table className="adm-tbl">
          <thead><tr><th>Sản phẩm</th><th>Giá (đ)</th><th>Còn hàng</th><th>Đã bán</th><th /><th /></tr></thead>
          <tbody>{((ps ?? []) as Product[]).map((p) => <ProductRow key={p.id} p={p} sold={sold.get(p.id) ?? 0} />)}</tbody>
        </table>
      </div>
    </>
  )
}