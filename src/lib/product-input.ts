import type { Category, Product } from './types'

/** Dữ liệu form thêm / sửa sản phẩm. */
export interface ProductInput {
  category: Category
  name_vi: string
  name_en: string
  brand: string
  price: number
  in_stock: boolean
  image: string
  sort: number // 0 = tự xếp cuối danh sách
  weight: string
  ingredients_vi: string
  ingredients_en: string
  shelf_life_vi: string
  shelf_life_en: string
  storage_vi: string
  storage_en: string
}

export const CATEGORY_LABEL: Record<Category, string> = { powder: 'Bột ca cao', chocolate: 'Sô-cô-la' }

export const EMPTY_INPUT: ProductInput = {
  category: 'chocolate', name_vi: '', name_en: '', brand: '', price: 0, in_stock: true, image: '', sort: 0,
  weight: '', ingredients_vi: '', ingredients_en: '', shelf_life_vi: '', shelf_life_en: '', storage_vi: '', storage_en: '',
}

export function toInput(p?: Product): ProductInput {
  if (!p) return { ...EMPTY_INPUT }
  return {
    category: p.category, name_vi: p.name_vi, name_en: p.name_en, brand: p.brand, price: p.price,
    in_stock: p.in_stock, image: p.image, sort: p.sort,
    weight: p.weight ?? '', ingredients_vi: p.ingredients_vi ?? '', ingredients_en: p.ingredients_en ?? '',
    shelf_life_vi: p.shelf_life_vi ?? '', shelf_life_en: p.shelf_life_en ?? '',
    storage_vi: p.storage_vi ?? '', storage_en: p.storage_en ?? '',
  }
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const orNull = (s: string) => (s ? s : null)

export type Cleaned = Omit<ProductInput, 'weight' | 'ingredients_vi' | 'ingredients_en' | 'shelf_life_vi' | 'shelf_life_en' | 'storage_vi' | 'storage_en'> & {
  weight: string | null; ingredients_vi: string | null; ingredients_en: string | null
  shelf_life_vi: string | null; shelf_life_en: string | null; storage_vi: string | null; storage_en: string | null
}

/** Kiểm tra và làm sạch dữ liệu từ trình duyệt (chạy ở máy chủ, không tin dữ liệu gửi lên). */
export function cleanProductInput(raw: unknown): { ok: true; data: Cleaned } | { ok: false; error: string } {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const category = r.category === 'powder' || r.category === 'chocolate' ? r.category : null
  if (!category) return { ok: false, error: 'Danh mục không hợp lệ.' }
  const name_vi = str(r.name_vi, 200)
  if (name_vi.length < 2) return { ok: false, error: 'Tên sản phẩm (tiếng Việt) cần ít nhất 2 ký tự.' }
  const price = Number(r.price)
  if (!Number.isInteger(price) || price < 0 || price > 100_000_000) return { ok: false, error: 'Giá phải là số nguyên từ 0 đến 100.000.000.' }
  const sort = Number(r.sort ?? 0)
  if (!Number.isInteger(sort) || sort < 0 || sort > 9999) return { ok: false, error: 'Thứ tự phải là số nguyên từ 0 đến 9999.' }
  const image = str(r.image, 300)
  if (image && !(image.startsWith('/') || /^https?:\/\//i.test(image))) return { ok: false, error: 'Đường dẫn ảnh phải bắt đầu bằng / hoặc https://' }
  return {
    ok: true,
    data: {
      category, name_vi, name_en: str(r.name_en, 200) || name_vi, brand: str(r.brand, 120), price,
      in_stock: Boolean(r.in_stock), image, sort,
      weight: orNull(str(r.weight, 40)),
      ingredients_vi: orNull(str(r.ingredients_vi, 1000)), ingredients_en: orNull(str(r.ingredients_en, 1000)),
      shelf_life_vi: orNull(str(r.shelf_life_vi, 300)), shelf_life_en: orNull(str(r.shelf_life_en, 300)),
      storage_vi: orNull(str(r.storage_vi, 500)), storage_en: orNull(str(r.storage_en, 500)),
    },
  }
}

/* ---------------- Lịch sử thay đổi ---------------- */

export interface ProductHistory {
  id: string
  product_id: string
  product_name: string
  action: 'insert' | 'update' | 'delete'
  changed_fields: string[]
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  changed_by: string | null
  changed_by_email: string | null
  created_at: string
}

export const ACTION_LABEL = { insert: 'Thêm mới', update: 'Chỉnh sửa', delete: 'Xóa' } as const
export const ACTION_COLOR = { insert: '#4e7a38', update: '#2f6fa5', delete: '#b3261e' } as const

export const FIELD_LABEL: Record<string, string> = {
  category: 'Danh mục', name_vi: 'Tên (VI)', name_en: 'Tên (EN)', brand: 'Thương hiệu', price: 'Giá',
  in_stock: 'Tình trạng', image: 'Ảnh', sort: 'Thứ tự', weight: 'Khối lượng',
  ingredients_vi: 'Thành phần (VI)', ingredients_en: 'Thành phần (EN)', shelf_life_vi: 'Hạn dùng (VI)',
  shelf_life_en: 'Hạn dùng (EN)', storage_vi: 'Bảo quản (VI)', storage_en: 'Bảo quản (EN)', id: 'Mã',
}

/** Định dạng một giá trị để hiện trong bảng lịch sử. */
export function fmtValue(key: string, v: unknown): string {
  if (v === null || v === undefined || v === '') return '(trống)'
  if (key === 'price') return Math.round(Number(v)).toLocaleString('vi-VN') + 'đ'
  if (key === 'in_stock') return v ? 'Còn hàng' : 'Hết hàng'
  if (key === 'category') return CATEGORY_LABEL[v as Category] ?? String(v)
  const s = String(v)
  return s.length > 80 ? s.slice(0, 80) + '…' : s
}

/** Các trường tóm tắt khi thêm mới / xóa. */
export const SUMMARY_FIELDS = ['category', 'price', 'in_stock', 'brand'] as const