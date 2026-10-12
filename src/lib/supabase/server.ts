import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SUPABASE_KEY, SUPABASE_URL } from '../env'

/** Client dùng ở Server Component / Server Action / Route Handler (có phiên đăng nhập qua cookie). */
export function createClient() {
  const store = cookies()
  return createServerClient(SUPABASE_URL!, SUPABASE_KEY!, {
    cookies: {
      getAll() {
        return store.getAll()
      },
      setAll(list: { name: string; value: string; options: CookieOptions }[]) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options))
        } catch {
          /* gọi từ Server Component: middleware sẽ làm mới phiên */
        }
      },
    },
  })
}
