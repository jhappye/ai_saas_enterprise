'use client'

import axios from 'axios'
import { FormEvent, useState } from 'react'

import { saveSession } from '@/lib/auth'
import { api } from '@/lib/api'

const initialForm = {
  company_name: '',
  company_slug: '',
  full_name: '',
  email: '',
  password: '',
}

export default function SignupPage() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/signup', form)
      saveSession(data)
      window.location.href = '/app'
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.detail ?? '注册失败，请检查输入或稍后再试')
        : '注册失败，请稍后再试'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <form className="card space-y-4" onSubmit={submit}>
        <h1 className="text-3xl font-bold">注册企业账号</h1>
        <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="企业名称" required />
        <input value={form.company_slug} onChange={(e) => setForm({ ...form, company_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="企业标识 slug（如 acme-ai）" required />
        <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="姓名" required />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="邮箱" type="email" required />
        <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="密码（至少 8 位）" type="password" minLength={8} required />
        {error && <p className="rounded-xl border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">{error}</p>}
        <button disabled={loading} className="btn w-full disabled:cursor-not-allowed disabled:opacity-60">{loading ? '注册中...' : '注册并开通'}</button>
      </form>
    </main>
  )
}
