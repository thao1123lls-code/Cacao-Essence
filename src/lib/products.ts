import { createServerClient } from '@supabase/ssr'
import { cache } from 'react'
import { SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from './env'
import { STATIC_PRODUCTS } from './products.static'
import type { Product } from './types'

/** Lấy sản phẩm từ Supabase; nếu chưa cấu hình hoặc lỗi thì dùng dữ liệu tĩnh. */
export const getProducts = cache(async (): Promise<Product[]> => {
  if (!isSupabaseConfigured) return STATIC_PRODUCTS
  try {
    const supabase = createServerClient(SUPABASE_URL!, SUPABASE_KEY!, {
      cookies: { getAll: () => [], setAll: () => {} },
    })
    const { data, error } = await supabase.from('products').select('*').order('sort')
    if (error || !data?.length) return STATIC_PRODUCTS
    return data as Product[]
  } catch {
    return STATIC_PRODUCTS
  }
})

export async function getProduct(id: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.id === id)
}
