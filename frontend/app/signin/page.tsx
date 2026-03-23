'use client'

import axios from 'axios'
import { FormEvent, useState } from 'react'

import { saveSession } from '@/lib/auth'
import { api } from '@/lib/api'

export default function SigninPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      saveSession(data)
      window.location.href = '/app'
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.detail ?? '登录失败，请稍后重试')
        : '登录失败，请稍后重试'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <form className="card space-y-4" onSubmit={submit}>
        <h1 className="text-3xl font-bold">登录</h1>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="邮箱" type="email" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="密码" type="password" minLength={8} required />
        {error && <p className="rounded-xl border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">{error}</p>}
        <button disabled={loading} className="btn w-full disabled:cursor-not-allowed disabled:opacity-60">{loading ? '登录中...' : '登录'}</button>
      </form>
    </main>
  )
}
