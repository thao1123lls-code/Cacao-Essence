import { handleContact } from '@/app/admin/actions'
import { dateTime } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'

interface Msg { id: string; name: string; phone: string; email: string | null; message: string; handled: boolean; created_at: string }

export default async function ContactsPage() {
  const { data, error } = await createClient().from('contact_messages').select('*').order('created_at', { ascending: false }).limit(200)
  const rows = (data ?? []) as Msg[]
  const todo = rows.filter((r) => !r.handled).length
  return (
    <>
      <div className="adm-head"><h1>Tin nhắn liên hệ</h1></div>
      <p style={{ color: 'var(--mute)', marginTop: -8 }}>Khách gửi từ form “Liên hệ” trên trang chủ. Đang chờ xử lý: <b>{todo}</b>.</p>
      {error && <div className="adm-card">Chưa đọc được dữ liệu. Hãy chạy <code>supabase/contacts.sql</code> trong SQL Editor.</div>}
      <div className="adm-card">
        <div className="adm-tw">
          <table className="adm-tbl">
            <thead><tr><th>Thời gian</th><th>Khách</th><th>Liên hệ</th><th>Nội dung</th><th /></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ opacity: r.handled ? 0.55 : 1 }}>
                  <td style={{ whiteSpace: 'nowrap' }}>{dateTime(r.created_at)}</td>
                  <td>{r.name}</td>
                  <td style={{ whiteSpace: 'nowrap' }}><a href={`tel:${r.phone.replace(/[^\d+]/g, '')}`}>{r.phone}</a>{r.email && <><br /><a href={`mailto:${r.email}`}>{r.email}</a></>}</td>
                  <td style={{ maxWidth: 420, whiteSpace: 'pre-line' }}>{r.message}</td>
                  <td>
                    <form action={handleContact}>
                      <input type="hidden" name="id" value={r.id} /><input type="hidden" name="handled" value={String(r.handled)} />
                      <button className="adm-btn ln">{r.handled ? 'Mở lại' : 'Đã xử lý'}</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && !error && <div className="adm-empty">Chưa có tin nhắn nào.</div>}
        </div>
      </div>
    </>
  )
}
