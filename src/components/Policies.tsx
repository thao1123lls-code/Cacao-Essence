'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { POLICIES, POLICY_CFG } from '@/lib/policies'
import { useShop } from './ShopContext'

const IDS = [1, 2, 3, 4, 5, 6]
const CLOSE = { vi: 'Đóng', en: 'Close' }
const CALL = { vi: 'Gọi hotline', en: 'Call hotline' }

function PolicyModal({ n, onClose }: { n: number; onClose: () => void }) {
  const { L, t } = useShop()
  const box = useRef<HTMLDivElement>(null)
  const doc = POLICIES[L][n - 1]

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    box.current?.querySelector<HTMLElement>('.x')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); return }
      if (e.key !== 'Tab' || !box.current) return
      // Giữ phím Tab trong hộp thoại
      const f = box.current.querySelectorAll<HTMLElement>('button, a[href]')
      if (!f.length) return
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey, true)
    return () => { document.body.style.overflow = prevOverflow; document.removeEventListener('keydown', onKey, true) }
  }, [onClose])

  // Render ra <body> để không bị ảnh hưởng bởi transform của phần footer
  return createPortal(
    <div className="modal show" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mbox pol" role="dialog" aria-modal="true" aria-labelledby="pol-title" ref={box}>
        <button type="button" className="x" aria-label={CLOSE[L]} onClick={onClose}>×</button>
        <h3 id="pol-title">{t('pol' + n)}</h3>
        <p className="pol-lead">{doc.lead}</p>
        <ul className="pol-list">{doc.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
        {doc.note && <p className="pol-note">{doc.note}</p>}
        <a className="btn" href={POLICY_CFG.hotlineHref}>{CALL[L]} {POLICY_CFG.hotline}</a>
      </div>
    </div>,
    document.body,
  )
}

/** 6 mục chính sách ở footer: mỗi mục là nút bấm mở modal tóm tắt nội dung. */
export default function PolicyList() {
  const { t } = useShop()
  const [open, setOpen] = useState<number | null>(null)
  const opener = useRef<HTMLElement | null>(null)

  const close = useCallback(() => {
    setOpen(null)
    opener.current?.focus() // trả focus về nút đã bấm
  }, [])

  return (
    <>
      <ul>
        {IDS.map((n) => (
          <li key={n}>
            <button type="button" className="pol-btn" aria-haspopup="dialog" onClick={(e) => { opener.current = e.currentTarget; setOpen(n) }}>
              {t('pol' + n)}
            </button>
          </li>
        ))}
      </ul>
      {open !== null && <PolicyModal n={open} onClose={close} />}
    </>
  )
}
