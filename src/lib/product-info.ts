import type { Lang } from './i18n'
import type { Product } from './types'

export interface ProductInfo {
  weight: string | null
  ingredients: string | null
  shelfLife: string | null
  storage: string | null
}

const clean = (v?: string | null) => (v && v.trim() ? v.trim() : null)

/** Khối lượng nằm sẵn trong tên ("250g", "1kg") nên dùng làm giá trị dự phòng khi cột `weight` chưa có dữ liệu. */
function weightFromName(name: string): string | null {
  const m = name.match(/(\d+(?:[.,]\d+)?)\s*(kg|g)\b/i)
  return m ? `${m[1]}${m[2].toLowerCase()}` : null
}

/** Gom các trường chi tiết của sản phẩm theo ngôn ngữ; trường nào thiếu trả về null để UI hiện placeholder. */
export function productInfo(p: Product, L: Lang): ProductInfo {
  const pick = (vi?: string | null, en?: string | null) => clean(L === 'vi' ? vi : en) ?? clean(vi)
  return {
    weight: clean(p.weight) ?? weightFromName(p.name_vi),
    ingredients: pick(p.ingredients_vi, p.ingredients_en),
    shelfLife: pick(p.shelf_life_vi, p.shelf_life_en),
    storage: pick(p.storage_vi, p.storage_en),
  }
}
