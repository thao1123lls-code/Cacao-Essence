'use client'
import '../admin.css'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const sb = createClient()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sb) return setErr('Chưa cấu hình Supabase. Xem README để thiết lập biến môi trường.')
    setBusy(true); setErr('')
    const { error } = await sb.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) return setErr('Email hoặc mật khẩu không đúng.')
    router.push('/admin'); router.refresh()
  }
  return (
    <div className="adm adm-center">
      <form className="adm-box" onSubmit={submit}>
        <h1>Cacao Origin</h1>
        <p>Đăng nhập khu vực quản trị</p>
        <label htmlFor="em">Email</label>
        <input id="em" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="pw">Mật khẩu</label>
        <input id="pw" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <p className="adm-err" style={{ margin: '12px 0 0' }}>{err}</p>}
        <button className="adm-btn" disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
      </form>
    </div>
  )
}
