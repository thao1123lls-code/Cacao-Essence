'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { T, type Lang } from '@/lib/i18n'
import type { CartLine, Product } from '@/lib/types'

interface Ui { drawer: boolean; chat: boolean; checkout: boolean; nav: boolean }
interface Shop {
  L: Lang
  setL: (l: Lang) => void
  t: (key: string) => string
  products: Product[]
  byId: (id: string) => Product | undefined
  pname: (p: Product) => string
  fmt: (n: number) => string
  lines: CartLine[]
  count: number
  total: number
  addProduct: (id: string) => void
  addMany: (ids: string[]) => void
  addGift: (ids: string[], msg: string) => void
  remove: (key: string) => void
  clear: () => void
  toast: (m: string) => void
  ui: Ui
  setUi: (patch: Partial<Ui>) => void
  pendingChat: string
  askChat: (q: string) => void
  clearPending: () => void
}

const Ctx = createContext<Shop | null>(null)
export const useShop = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useShop must be used inside <ShopProvider>')
  return c
}

export function ShopProvider({ products, children }: { products: Product[]; children: ReactNode }) {
  const [L, setL] = useState<Lang>('vi')
  const [lines, setLines] = useState<CartLine[]>([])
  const [msg, setMsg] = useState('')
  const [ui, setUiState] = useState<Ui>({ drawer: false, chat: false, checkout: false, nav: false })
  const [pendingChat, setPending] = useState('')

  const setUi = useCallback((p: Partial<Ui>) => setUiState((u) => ({ ...u, ...p })), [])
  const t = useCallback((k: string) => (T[L][k] as string) ?? k, [L])
  const byId = useCallback((id: string) => products.find((p) => p.id === id), [products])
  const pname = useCallback((p: Product) => (L === 'vi' ? p.name_vi : p.name_en), [L])
  const fmt = useCallback(
    (n: number) => n.toLocaleString(L === 'vi' ? 'vi-VN' : 'en-US') + (L === 'vi' ? 'đ' : '₫'),
    [L],
  )
  const toast = useCallback((m: string) => {
    setMsg(m)
    window.setTimeout(() => setMsg(''), 1800)
  }, [])

  const addProduct = useCallback(
    (id: string) => {
      const p = products.find((x) => x.id === id)
      if (!p) return
      if (!p.in_stock) return toast(T[L].out)
      setLines((ls) => {
        const i = ls.findIndex((l) => l.productId === id)
        if (i >= 0) return ls.map((l, j) => (j === i ? { ...l, qty: l.qty + 1 } : l))
        return [...ls, { key: 'p:' + id, productId: id, name: { vi: p.name_vi, en: p.name_en }, price: p.price, qty: 1 }]
      })
      toast(T[L].added)
    },
    [products, L, toast],
  )
  const addMany = useCallback((ids: string[]) => ids.forEach(addProduct), [addProduct])
  const addGift = useCallback(
    (ids: string[], m: string) => {
      const price = ids.reduce((s, id) => s + (products.find((p) => p.id === id)?.price ?? 0), 0)
      const names = ids.map((id) => products.find((p) => p.id === id)?.name_vi ?? '').join(', ')
      setLines((ls) => [
        ...ls,
        {
          key: 'g:' + Date.now(),
          gift: { ids, msg: m },
          name: { vi: `Hộp quà sô-cô-la (${ids.length})`, en: `Chocolate gift box (${ids.length})` },
          price,
          qty: 1,
          note: [m, names].filter(Boolean).join(' · '),
        },
      ])
      toast(T[L].added)
    },
    [products, L, toast],
  )
  const remove = useCallback((key: string) => setLines((ls) => ls.filter((l) => l.key !== key)), [])
  const clear = useCallback(() => setLines([]), [])
  const askChat = useCallback((q: string) => {
    setPending(q)
    setUiState((u) => ({ ...u, chat: true }))
  }, [])

  useEffect(() => {
    const small = window.innerWidth <= 820
    document.body.classList.toggle('lock', ui.drawer || ui.checkout || (small && (ui.chat || ui.nav)))
  }, [ui])

  const value = useMemo<Shop>(
    () => ({
      L, setL, t, products, byId, pname, fmt, lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      total: lines.reduce((s, l) => s + l.price * l.qty, 0),
      addProduct, addMany, addGift, remove, clear, toast, ui, setUi, pendingChat, askChat,
      clearPending: () => setPending(''),
    }),
    [L, t, products, byId, pname, fmt, lines, addProduct, addMany, addGift, remove, clear, toast, ui, setUi, pendingChat, askChat],
  )
  return (
    <Ctx.Provider value={value}>
      {children}
      <div className={'toast' + (msg ? ' on' : '')} role="status">{msg}</div>
    </Ctx.Provider>
  )
}
