import { createBrowserClient } from '@supabase/ssr'
import { SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from '../env'

/** Client dùng ở trình duyệt. Trả về null khi chưa cấu hình biến môi trường. */
export function createClient() {
  if (!isSupabaseConfigured) return null
  return createBrowserClient(SUPABASE_URL!, SUPABASE_KEY!)
}
