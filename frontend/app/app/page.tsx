'use client'

import axios from 'axios'
import { useEffect, useState } from 'react'

import { getStoredUser, UserSummary } from '@/lib/auth'
import { api } from '@/lib/api'

interface UsageSummary {
  requests: number
  tokens: number
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export default function UserAppPage() {
  const [user, setUser] = useState<UserSummary | null>(null)
  const [usage, setUsage] = useState<UsageSummary>({ requests: 0, tokens: 0 })
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const currentUser = getStoredUser()
    if (!currentUser) {
      window.location.href = '/signin'
      return
    }
    setUser(currentUser)
    api.get('/billing/usage').then(({ data }) => setUsage(data)).catch(() => undefined)
  }, [])

  const sendMessage = async () => {
    if (!query.trim()) return
    const text = query.trim()
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setQuery('')
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/chat', { query: text })
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }])
      const usageResp = await api.get('/billing/usage')
      setUsage(usageResp.data)
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.detail ?? 'AI 请求失败，请稍后重试')
        : 'AI 请求失败，请稍后重试'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-[2fr,1fr]">
      <section className="card">
        <h1 className="text-3xl font-bold">AI 助手</h1>
        <p className="mt-2 text-slate-400">已登录企业：{user?.tenant.name ?? '加载中...'}</p>
        <div className="mt-6 space-y-4 rounded-2xl border border-slate-800 p-4">
          <div className="max-h-[420px] space-y-3 overflow-y-auto">
            {messages.length === 0 && <p className="text-slate-400">请输入你的企业问题，系统将基于 Dify 知识库回答。</p>}
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`rounded-2xl p-4 ${message.role === 'user' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-950 text-slate-100'}`}>
                <p className="mb-1 text-xs uppercase opacity-70">{message.role === 'user' ? '你' : 'AI'}</p>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
          </div>
          <textarea value={query} onChange={(e) => setQuery(e.target.value)} className="h-40 w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="请总结我们的售后服务SOP" />
          {error && <p className="rounded-xl border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">{error}</p>}
          <button onClick={sendMessage} disabled={loading} className="btn disabled:cursor-not-allowed disabled:opacity-60">{loading ? '发送中...' : '发送'}</button>
        </div>
      </section>
      <aside className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold">租户信息</h2>
          <p className="mt-2 text-slate-300">{user?.tenant.slug ?? '-'}</p>
          <p className="text-slate-400">计划：{user?.tenant.plan ?? 'free'} · 状态：{user?.tenant.status ?? 'active'}</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold">使用统计</h2>
          <p className="mt-2 text-slate-300">请求数：{usage.requests}</p>
          <p className="text-slate-300">Tokens：{usage.tokens}</p>
        </div>
      </aside>
    </main>
  )
}
