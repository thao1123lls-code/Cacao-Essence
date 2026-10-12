import { createClient } from '@/lib/supabase/server'
import { PAYMENT_LABEL, STATUS_META, type Order } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data, error } = await createClient()
    .from('orders').select('*, order_items(*)').order('created_at', { ascending: false }).limit(5000)
  if (error) return new Response(error.message, { status: 403 })
  const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = [['Mã đơn', 'Thời gian', 'Khách hàng', 'Điện thoại', 'Địa chỉ', 'Sản phẩm', 'Tổng tiền', 'Trạng thái', 'Thanh toán']]
  ;(data as Order[]).forEach((o) =>
    rows.push([
      o.code, new Date(o.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }), o.customer_name, o.phone, o.address,
      (o.order_items ?? []).map((i) => `${i.name} x${i.qty}`).join('; '), String(o.total), STATUS_META[o.status].label, PAYMENT_LABEL[o.payment],
    ]),
  )
  const csv = '\ufeff' + rows.map((r) => r.map(cell).join(',')).join('\r\n')
  return new Response(csv, {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="don-hang-cacao-origin.csv"' },
  })
}
