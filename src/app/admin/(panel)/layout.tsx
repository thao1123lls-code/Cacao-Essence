import '../admin.css'
import Link from 'next/link'
import { AdminNav, RealtimeRefresh, SignOut } from '@/components/admin/Client'
import { getAdminSession } from '@/lib/admin'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Quản trị', robots: { index: false } }

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const s = await getAdminSession()
  if (!s.configured) {
    return (
      <div className="adm">
        <div className="adm-note">
          <h2>Chưa cấu hình Supabase</h2>
          <ol>
            <li>Tạo dự án tại supabase.com, chạy <code>supabase/schema.sql</code> rồi <code>supabase/seed.sql</code>.</li>
            <li>Sao chép <code>.env.example</code> thành <code>.env.local</code> và điền URL, anon key.</li>
            <li>Tạo tài khoản ở Authentication → Users, rồi thêm <code>user_id</code> vào bảng <code>admins</code>.</li>
          </ol>
          <Link href="/">← Về trang chủ</Link>
        </div>
      </div>
    )
  }
  if (!s.isAdmin) {
    return (
      <div className="adm adm-center">
        <div className="adm-box">
          <h1>Không có quyền truy cập</h1>
          <p>Tài khoản <b>{s.email}</b> chưa được cấp quyền quản trị. Hãy thêm user_id của tài khoản này vào bảng <code>admins</code>.</p>
          <SignOut />
        </div>
      </div>
    )
  }
  return (
    <div className="adm">
      <div className="adm-top"><b>Cacao Essence · Quản trị</b><span>{s.email}</span><Link href="/" className="adm-ghost">Xem cửa hàng</Link><SignOut /></div>
      <AdminNav />
      <main className="adm-main">{children}</main>
      <RealtimeRefresh />
    </div>
  )
}
