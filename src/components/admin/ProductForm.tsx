'use client'
import './product-admin.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { createProduct, deleteProduct, updateProductFull } from '@/app/admin/actions'
import { CATEGORY_LABEL, toInput, type ProductInput } from '@/lib/product-input'
import type { Category, Product } from '@/lib/types'

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return <div className={full ? 'full' : ''}><label>{label}</label>{children}</div>
}

/** Hộp thoại dùng chung: không có `product` = thêm mới, có `product` = chỉnh sửa. */
function ProductDialog({ product, onClose }: { product?: Product; onClose: () => void }) {
  const router = useRouter()
  const [f, setF] = useState<ProductInput>(() => toInput(product))
  const [err, setErr] = useState('')
  const [pending, start] = useTransition()
  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) => setF((s) => ({ ...s, [k]: v }))
  const text = (k: keyof ProductInput, max = 200) => (
    <input type="text" maxLength={max} value={String(f[k])} onChange={(e) => set(k, e.target.value as never)} />
  )
  const area = (k: keyof ProductInput, max: number) => (
    <textarea rows={2} maxLength={max} value={String(f[k])} onChange={(e) => set(k, e.target.value as never)} />
  )

  const submit = () => start(async () => {
    setErr('')
    const r = product ? await updateProductFull(product.id, f) : await createProduct(f)
    if (r.error) return setErr(r.error)
    router.refresh()
    onClose()
  })

  return (
    <div className="pm-ov" onClick={(e) => e.target === e.currentTarget && !pending && onClose()}>
      <div className="pm-box" role="dialog" aria-modal="true">
        <h2>{product ? `Sửa sản phẩm ${product.id}` : 'Thêm sản phẩm mới'}</h2>
        <div className="pm-grid">
          <Field label="Danh mục">
            <select value={f.category} onChange={(e) => set('category', e.target.value as Category)}>
              {(Object.keys(CATEGORY_LABEL) as Category[]).map((k) => <option key={k} value={k}>{CATEGORY_LABEL[k]}</option>)}
            </select>
          </Field>
          <Field label="Thương hiệu">{text('brand', 120)}</Field>
          <Field label="Tên sản phẩm (tiếng Việt) *" full>{text('name_vi')}</Field>
          <Field label="Tên sản phẩm (tiếng Anh, bỏ trống thì lấy tên tiếng Việt)" full>{text('name_en')}</Field>
          <Field label="Giá (đ). 0 = liên hệ báo giá">
            <input type="number" min={0} step={1000} value={f.price} onChange={(e) => set('price', Number(e.target.value || 0))} />
          </Field>
          <Field label="Thứ tự hiển thị (0 = xếp cuối)">
            <input type="number" min={0} step={1} value={f.sort} onChange={(e) => set('sort', Number(e.target.value || 0))} />
          </Field>
          <Field label="Đường dẫn ảnh (vd /images/products/p22.webp hoặc https://…)" full>
            <div className="pm-img">{text('image', 300)}{f.image && <img src={f.image} alt="" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />}</div>
          </Field>
          <div className="full"><label className="pm-chk"><input type="checkbox" checked={f.in_stock} onChange={(e) => set('in_stock', e.target.checked)} /> Còn hàng</label></div>
        </div>
        <details>
          <summary>Thông tin chi tiết (không bắt buộc)</summary>
          <div className="pm-grid">
            <Field label="Khối lượng (vd 250g)" full>{text('weight', 40)}</Field>
            <Field label="Thành phần (VI)">{area('ingredients_vi', 1000)}</Field>
            <Field label="Thành phần (EN)">{area('ingredients_en', 1000)}</Field>
            <Field label="Hạn sử dụng (VI)">{area('shelf_life_vi', 300)}</Field>
            <Field label="Hạn sử dụng (EN)">{area('shelf_life_en', 300)}</Field>
            <Field label="Bảo quản (VI)">{area('storage_vi', 500)}</Field>
            <Field label="Bảo quản (EN)">{area('storage_en', 500)}</Field>
          </div>
        </details>
        {err && <p className="adm-err pm-err">{err}</p>}
        <p className="pm-hint">Mọi thay đổi được ghi vào “Lịch sử thay đổi” kèm tên tài khoản và thời gian.</p>
        <div className="pm-act">
          <button className="adm-btn ln" disabled={pending} onClick={onClose}>Hủy</button>
          <button className="adm-btn" disabled={pending} onClick={submit}>{pending ? 'Đang lưu…' : product ? 'Lưu thay đổi' : 'Thêm sản phẩm'}</button>
        </div>
      </div>
    </div>
  )
}

export function AddProductButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="adm-btn" onClick={() => setOpen(true)}>+ Thêm sản phẩm</button>
      {open && <ProductDialog onClose={() => setOpen(false)} />}
    </>
  )
}

/** Các nút Sửa / Lịch sử / Xóa ở cuối mỗi dòng sản phẩm. */
export function RowActions({ p }: { p: Product }) {
  const router = useRouter()
  const [edit, setEdit] = useState(false)
  const [err, setErr] = useState('')
  const [pending, start] = useTransition()
  const remove = () => {
    if (!window.confirm(`Xóa sản phẩm “${p.name_vi}”?\n\nSản phẩm sẽ biến mất khỏi cửa hàng. Đơn hàng cũ vẫn giữ nguyên tên và giá. Bản ghi xóa được lưu trong lịch sử.`)) return
    start(async () => {
      const r = await deleteProduct(p.id)
      if (r.error) setErr(r.error)
      else router.refresh()
    })
  }
  return (
    <>
      <div className="pm-row">
        <button className="adm-btn ln" onClick={() => setEdit(true)}>Sửa</button>
        <Link className="adm-btn ln" href={`/admin/products/history?id=${encodeURIComponent(p.id)}`}>Lịch sử</Link>
        <button className="adm-btn red" disabled={pending} onClick={remove}>Xóa</button>
      </div>
      {err && <small className="adm-err">{err}</small>}
      {edit && <ProductDialog product={p} onClose={() => setEdit(false)} />}
    </>
  )
}