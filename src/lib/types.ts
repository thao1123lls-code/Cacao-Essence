export type Category = 'powder' | 'chocolate'
export type OrderStatus = 'new' | 'processing' | 'shipping' | 'done' | 'cancelled'

export interface Product {
  id: string
  category: Category
  name_vi: string
  name_en: string
  brand: string
  price: number
  in_stock: boolean
  image: string
  sort: number
  /**
   * Thông tin chi tiết cho trang sản phẩm. Tất cả là tùy chọn: cột nào chưa có dữ liệu trong DB
   * (xem supabase/product-details.sql) thì giao diện hiện "Đang cập nhật".
   */
  weight?: string | null
  ingredients_vi?: string | null
  ingredients_en?: string | null
  shelf_life_vi?: string | null
  shelf_life_en?: string | null
  storage_vi?: string | null
  storage_en?: string | null
}

/** Một dòng trong giỏ: sản phẩm thường hoặc hộp quà tự chọn. */
export interface CartLine {
  key: string
  productId?: string
  gift?: { ids: string[]; msg: string }
  name: { vi: string; en: string }
  price: number
  qty: number
  note?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  name: string
  qty: number
  unit_price: number
  note: string | null
}

export interface Order {
  id: string
  code: string
  customer_id: string | null
  customer_name: string
  phone: string
  address: string
  note: string | null
  payment: 'cod' | 'bank'
  status: OrderStatus
  total: number
  created_at: string
  order_items?: OrderItem[]
}

export interface Customer {
  id: string
  name: string
  phone: string
  address: string | null
  created_at: string
}

export const STATUS_META: Record<OrderStatus, { label: string; color: string }> = {
  new: { label: 'Mới', color: '#b4562b' },
  processing: { label: 'Đang xử lý', color: '#c98a1b' },
  shipping: { label: 'Đang giao', color: '#2f6fa5' },
  done: { label: 'Hoàn thành', color: '#4e7a38' },
  cancelled: { label: 'Đã hủy', color: '#8a7a6e' },
}
export const PAYMENT_LABEL = { cod: 'Thanh toán khi nhận hàng', bank: 'Chuyển khoản' } as const
