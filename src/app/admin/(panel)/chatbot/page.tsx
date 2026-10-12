import { deleteFaq, resolveLog, saveFaq, toggleFaq } from '@/app/admin/actions'
import { dateTime } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'

interface Faq { id: string; question: string; answer: string; active: boolean }
interface Log { id: string; question: string; answer: string; handoff: boolean; resolved: boolean; created_at: string }

export default async function ChatbotPage() {
  const sb = createClient()
  const [{ data: f }, { data: l }] = await Promise.all([
    sb.from('faqs').select('*').order('created_at', { ascending: false }),
    sb.from('chat_logs').select('*').order('created_at', { ascending: false }).limit(120),
  ])
  const faqs = (f ?? []) as Faq[]
  const logs = (l ?? []) as Log[]
  const todo = logs.filter((x) => x.handoff && !x.resolved)
  const rest = logs.filter((x) => !(x.handoff && !x.resolved)).slice(0, 30)

  return (
    <>
      <div className="adm-head"><h1>Huấn luyện chatbot</h1></div>
      <p style={{ color: 'var(--mute)', marginTop: -8, maxWidth: 780 }}>
        Chatbot trả lời dựa trên thông tin công ty, danh mục sản phẩm (giá và tồn kho thật) và <b>các câu hỏi đáp bạn thêm ở đây</b>.
        Câu nào chatbot không chắc chắn sẽ hiện ở mục “Cần bạn trả lời”. Hãy viết câu trả lời đúng và lưu lại, từ lần sau chatbot sẽ trả lời đúng ngay.
      </p>

      <div className="adm-card" style={{ marginBottom: 18 }}>
        <h3>Cần bạn trả lời ({todo.length})</h3>
        {!todo.length && <div className="adm-empty">Không có câu hỏi nào đang chờ. Chatbot đã trả lời được hết.</div>}
        {todo.map((x) => (
          <form key={x.id} action={saveFaq} style={{ borderTop: '1px solid var(--line)', padding: '14px 0' }}>
            <input type="hidden" name="log_id" value={x.id} />
            <small style={{ color: 'var(--mute)' }}>{dateTime(x.created_at)}</small>
            <label style={{ display: 'block', fontWeight: 600, margin: '4px 0' }}>Khách hỏi</label>
            <input name="question" defaultValue={x.question} required style={{ width: '100%', padding: 10, border: '1px solid var(--line)', borderRadius: 8, font: 'inherit' }} />
            <label style={{ display: 'block', fontWeight: 600, margin: '10px 0 4px' }}>Câu trả lời đúng của cửa hàng</label>
            <textarea name="answer" required rows={3} placeholder="Nhập câu trả lời chính xác…" style={{ width: '100%', padding: 10, border: '1px solid var(--line)', borderRadius: 8, font: 'inherit' }} />
            <small style={{ display: 'block', color: 'var(--mute)', margin: '6px 0' }}>Bot đã trả lời: “{x.answer.slice(0, 160)}”</small>
            <button className="adm-btn">Lưu thành câu hỏi đáp</button>{' '}
            <button className="adm-btn ln" formAction={resolveLog} type="submit" formNoValidate>Bỏ qua</button>
          </form>
        ))}
      </div>

      <div className="adm-card" style={{ marginBottom: 18 }}>
        <h3>Thêm câu hỏi đáp mới</h3>
        <form action={saveFaq}>
          <label style={{ display: 'block', fontWeight: 600, margin: '4px 0' }}>Câu hỏi (ghi như khách hay hỏi)</label>
          <input name="question" required placeholder="Ví dụ: Bột cacao 3 in 1 bảo quản được bao lâu?" style={{ width: '100%', padding: 10, border: '1px solid var(--line)', borderRadius: 8, font: 'inherit' }} />
          <label style={{ display: 'block', fontWeight: 600, margin: '10px 0 4px' }}>Câu trả lời chính xác</label>
          <textarea name="answer" required rows={3} style={{ width: '100%', padding: 10, border: '1px solid var(--line)', borderRadius: 8, font: 'inherit' }} />
          <div style={{ marginTop: 10 }}><button className="adm-btn">Thêm</button></div>
        </form>
      </div>

      <div className="adm-card" style={{ marginBottom: 18 }}>
        <h3>Câu hỏi đáp đã có ({faqs.length})</h3>
        <div className="adm-tw">
          <table className="adm-tbl">
            <thead><tr><th>Câu hỏi</th><th>Câu trả lời</th><th>Trạng thái</th><th /></tr></thead>
            <tbody>
              {faqs.map((x) => (
                <tr key={x.id} style={{ opacity: x.active ? 1 : 0.5 }}>
                  <td style={{ maxWidth: 260 }}>{x.question}</td><td style={{ maxWidth: 380 }}>{x.answer}</td>
                  <td>{x.active ? 'Đang dùng' : 'Tạm tắt'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <form action={toggleFaq} style={{ display: 'inline' }}><input type="hidden" name="id" value={x.id} /><input type="hidden" name="active" value={String(x.active)} /><button className="adm-btn ln">{x.active ? 'Tắt' : 'Bật'}</button></form>{' '}
                    <form action={deleteFaq} style={{ display: 'inline' }}><input type="hidden" name="id" value={x.id} /><button className="adm-btn ln">Xóa</button></form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!faqs.length && <div className="adm-empty">Chưa có câu hỏi đáp nào.</div>}
        </div>
      </div>

      <div className="adm-card">
        <h3>Hội thoại gần đây</h3>
        <div className="adm-tw">
          <table className="adm-tbl">
            <thead><tr><th>Thời gian</th><th>Khách hỏi</th><th>Bot trả lời</th></tr></thead>
            <tbody>{rest.map((x) => <tr key={x.id}><td>{dateTime(x.created_at)}</td><td style={{ maxWidth: 260 }}>{x.question}</td><td style={{ maxWidth: 420 }}>{x.answer}</td></tr>)}</tbody>
          </table>
          {!rest.length && <div className="adm-empty">Chưa có hội thoại.</div>}
        </div>
      </div>
    </>
  )
}