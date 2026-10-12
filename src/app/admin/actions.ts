'use server'

import { revalidatePath } from 'next/cache'
import { cleanProductInput } from '@/lib/product-input'
import { createClient } from '@/lib/supabase/server'
import { STATUS_META, type OrderStatus } from '@/lib/types'

export async function updateOrderStatus(id: string, status: OrderStatus) {
  if (!(status in STATUS_META)) return { error: 'Trạng thái không hợp lệ' }
  const { error } = await createClient().from('orders').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin', 'layout')
  return { ok: true }
}

export async function updateProduct(id: string, patch: { price: number; in_stock: boolean }) {
  const price = Math.max(0, Math.floor(Number(patch.price) || 0))
  const { error } = await createClient().from('products').update({ price, in_stock: Boolean(patch.in_stock) }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/')
  revalidatePath('/admin/products')
  return { ok: true }
}

/* ---------- Chatbot: huấn luyện bằng câu hỏi đáp ---------- */
export async function saveFaq(fd: FormData): Promise<void> {
  const question = String(fd.get('question') ?? '').trim().slice(0, 500)
  const answer = String(fd.get('answer') ?? '').trim().slice(0, 2000)
  const logId = String(fd.get('log_id') ?? '')
  if (!question || !answer) return
  const sb = createClient()
  const { error } = await sb.from('faqs').insert({ question, answer })
  if (!error && logId) await sb.from('chat_logs').update({ resolved: true }).eq('id', logId)
  revalidatePath('/admin/chatbot')
}

export async function toggleFaq(fd: FormData): Promise<void> {
  const id = String(fd.get('id') ?? '')
  const active = fd.get('active') === 'true'
  await createClient().from('faqs').update({ active: !active }).eq('id', id)
  revalidatePath('/admin/chatbot')
}

export async function deleteFaq(fd: FormData): Promise<void> {
  await createClient().from('faqs').delete().eq('id', String(fd.get('id') ?? ''))
  revalidatePath('/admin/chatbot')
}

export async function resolveLog(fd: FormData): Promise<void> {
  await createClient().from('chat_logs').update({ resolved: true }).eq('id', String(fd.get('id') ?? ''))
  revalidatePath('/admin/chatbot')
}

export async function handleContact(fd: FormData): Promise<void> {
  await createClient().from('contact_messages').update({ handled: fd.get('handled') !== 'true' }).eq('id', String(fd.get('id') ?? ''))
  revalidatePath('/admin/contacts')
}
/* ---------- Sản phẩm: thêm / sửa / xóa ----------
 * Quyền do RLS ở Supabase quyết định (chỉ admin). Mọi thay đổi được trigger `products_history`
 * ghi vào bảng product_history (xem supabase/product-history.sql). */
type Result = { ok?: true; id?: string; error?: string }
const refreshShop = () => { revalidatePath('/', 'layout') }

export async function createProduct(raw: unknown): Promise<Result> {
  const v = cleanProductInput(raw)
  if (!v.ok) return { error: v.error }
  const sb = createClient()
  const { data: rows, error: e1 } = await sb.from('products').select('id, sort')
  if (e1) return { error: e1.message }
  // Mã mới = p + (số lớn nhất hiện có + 1), vd p21 → p22
  const maxId = Math.max(0, ...(rows ?? []).map((r) => Number(/^p(\d+)$/.exec(r.id as string)?.[1] ?? 0)))
  const maxSort = Math.max(0, ...(rows ?? []).map((r) => Number(r.sort) || 0))
  const id = `p${maxId + 1}`
  const { error } = await sb.from('products').insert({ id, ...v.data, sort: v.data.sort || maxSort + 1 })
  if (error) return { error: error.message }
  refreshShop()
  return { ok: true, id }
}

export async function updateProductFull(id: string, raw: unknown): Promise<Result> {
  const v = cleanProductInput(raw)
  if (!v.ok) return { error: v.error }
  const { data, error } = await createClient().from('products').update(v.data).eq('id', String(id)).select('id')
  if (error) return { error: error.message }
  if (!data?.length) return { error: 'Không lưu được: sản phẩm không tồn tại hoặc tài khoản không có quyền.' }
  refreshShop()
  return { ok: true, id }
}

export async function deleteProduct(id: string): Promise<Result> {
  const { data, error } = await createClient().from('products').delete().eq('id', String(id)).select('id')
  if (error) return { error: error.message }
  if (!data?.length) return { error: 'Không xóa được: sản phẩm không tồn tại hoặc tài khoản không có quyền.' }
  refreshShop()
  return { ok: true }
}