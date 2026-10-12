import { redirect } from 'next/navigation'
import { isSupabaseConfigured } from './env'
import { createClient } from './supabase/server'

/** Dùng trong layout admin: bắt buộc đã đăng nhập; trả về trạng thái quyền quản trị. */
export async function getAdminSession() {
  if (!isSupabaseConfigured) return { configured: false as const }
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/admin/login')
  const { data } = await sb.from('admins').select('user_id').eq('user_id', user.id).maybeSingle()
  return { configured: true as const, email: user.email ?? '', isAdmin: Boolean(data) }
}

export const money = (n: number) => Math.round(n).toLocaleString('vi-VN') + 'đ'
export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })
