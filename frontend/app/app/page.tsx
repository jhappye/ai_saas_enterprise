'use client'

import axios from 'axios'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'

import { clearSession, getStoredUser, UserSummary } from '@/lib/auth'
import { api } from '@/lib/api'

type Tab = 'dashboard' | 'chat' | 'knowledge'

interface UsageSummary {
  requests: number
  tokens: number
}

interface Dashboard {
  total_users: number
  total_orders: number
  total_revenue: number
  total_documents: number
  total_chats: number
  avg_response_ms: number
  active_subscription: string | null
  tenant_slug: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface KnowledgeDocument {
  id: number
  filename: string
  file_size: number
  content_type: string | null
  status: string
  created_at: string
}

const navItems: { key: Tab; label: string }[] = [
  { key: 'dashboard', label: '控制台' },
  { key: 'chat', label: 'AI对话' },
  { key: 'knowledge', label: '知识库' },
]

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(2)} MB`
}

export default function UserWorkspacePage() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [user, setUser] = useState<UserSummary | null>(null)
  const [usage, setUsage] = useState<UsageSummary>({ requests: 0, tokens: 0 })
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)

  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)

  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
  const [uploading, setUploading] = useState(false)

  const [error, setError] = useState('')

  const canManageKnowledge = useMemo(() => ['owner', 'admin'].includes(user?.role ?? ''), [user?.role])

  const loadWorkspace = async () => {
    const [usageRes, adminRes, docsRes] = await Promise.all([
      api.get('/billing/usage').catch(() => ({ data: { requests: 0, tokens: 0 } })),
      api.get('/admin/dashboard').catch(() => ({ data: null })),
      api.get('/knowledge/documents').catch(() => ({ data: [] })),
    ])
    setUsage(usageRes.data)
    setDashboard(adminRes.data)
    setDocuments(docsRes.data)
  }

  useEffect(() => {
    const currentUser = getStoredUser()
    if (!currentUser) {
      window.location.href = '/signin'
      return
    }
    setUser(currentUser)
    loadWorkspace().catch(() => setError('加载工作台失败，请稍后重试'))
  }, [])

  const sendMessage = async () => {
    if (!query.trim()) return
    const text = query.trim()
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setQuery('')
    setChatLoading(true)
    setError('')

    try {
      const { data } = await api.post('/chat', { query: text })
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }])
      const usageRes = await api.get('/billing/usage')
      setUsage(usageRes.data)
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.detail ?? 'AI 请求失败，请稍后重试')
        : 'AI 请求失败，请稍后重试'
      setError(message)
    } finally {
      setChatLoading(false)
    }
  }

  const uploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!canManageKnowledge) {
      setError('仅管理员可上传知识库文档')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    setUploading(true)
    setError('')

    try {
      await api.post('/knowledge/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const docsRes = await api.get('/knowledge/documents')
      setDocuments(docsRes.data)
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.detail ?? '文档上传失败')
        : '文档上传失败'
      setError(message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const deleteDocument = async (id: number) => {
    if (!canManageKnowledge) return
    try {
      await api.delete(`/knowledge/documents/${id}`)
      setDocuments((prev) => prev.filter((doc) => doc.id !== id))
    } catch {
      setError('删除文档失败')
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-76px)] max-w-[1400px] gap-6 px-4 py-6">
      <aside className="w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">企业AI知识助手</h1>
          <p className="mt-1 text-sm text-slate-500">{user?.full_name} · {user?.tenant.name}</p>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`w-full rounded-xl px-4 py-3 text-left text-lg ${tab === item.key ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => {
            clearSession()
            window.location.href = '/signin'
          }}
          className="mt-8 w-full rounded-xl border border-slate-300 px-4 py-2 text-slate-600 hover:bg-slate-100"
        >
          退出登录
        </button>
      </aside>

      <section className="flex-1 space-y-4">
        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

        {tab === 'dashboard' && (
          <div className="space-y-4">
            <h2 className="text-4xl font-semibold">控制台概览</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="card"><p className="text-slate-500">用户总数</p><p className="mt-2 text-4xl font-bold">{dashboard?.total_users ?? 0}</p></div>
              <div className="card"><p className="text-slate-500">文档总数</p><p className="mt-2 text-4xl font-bold">{dashboard?.total_documents ?? documents.length}</p></div>
              <div className="card"><p className="text-slate-500">对话总数</p><p className="mt-2 text-4xl font-bold">{dashboard?.total_chats ?? usage.requests}</p></div>
              <div className="card"><p className="text-slate-500">本月Token用量</p><p className="mt-2 text-4xl font-bold">{usage.tokens.toLocaleString()}</p></div>
              <div className="card"><p className="text-slate-500">订单收入</p><p className="mt-2 text-4xl font-bold">${(dashboard?.total_revenue ?? 0).toFixed(2)}</p></div>
              <div className="card"><p className="text-slate-500">平均响应时间</p><p className="mt-2 text-4xl font-bold">{dashboard?.avg_response_ms ?? 0}ms</p></div>
            </div>
          </div>
        )}

        {tab === 'chat' && (
          <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
            <div className="card h-[720px] overflow-auto">
              <button className="btn w-full">+ 新建对话</button>
              <h3 className="mt-6 text-lg font-semibold">历史对话</h3>
              <ul className="mt-3 space-y-3 text-slate-500">
                {messages.length === 0 ? <li>暂无历史</li> : messages.filter((m) => m.role === 'user').map((m, i) => <li key={i}>{m.content.slice(0, 20)}</li>)}
              </ul>
            </div>
            <div className="card flex h-[720px] flex-col">
              <h3 className="text-2xl font-semibold">AI知识助手</h3>
              <div className="mt-4 flex-1 space-y-3 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
                {messages.length === 0 && <p className="text-slate-500">请输入您的问题…</p>}
                {messages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`max-w-[80%] rounded-2xl p-4 ${message.role === 'user' ? 'ml-auto bg-indigo-600 text-white' : 'bg-white text-slate-800'}`}>
                    {message.content}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder="请输入您的问题..." className="input h-24 flex-1" />
                <button onClick={sendMessage} disabled={chatLoading} className="btn h-12 self-end disabled:opacity-60">{chatLoading ? '发送中...' : '发送'}</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'knowledge' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-semibold">知识库管理</h2>
              <button onClick={() => loadWorkspace().catch(() => undefined)} className="rounded-xl border border-slate-300 px-4 py-2 text-slate-600 hover:bg-slate-100">刷新</button>
            </div>
            <label className="flex h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white text-center text-slate-500 hover:border-indigo-400 hover:text-indigo-600">
              <p className="text-2xl">拖拽文件到此处，或点击上传</p>
              <p className="mt-2 text-sm">支持 PDF / Word / Excel / Markdown，最大 {50}MB</p>
              <input type="file" className="hidden" onChange={uploadFile} disabled={uploading || !canManageKnowledge} />
            </label>
            <div className="card p-0">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-6 py-4">文件名</th>
                    <th className="px-6 py-4">类型</th>
                    <th className="px-6 py-4">大小</th>
                    <th className="px-6 py-4">处理状态</th>
                    <th className="px-6 py-4">上传时间</th>
                    <th className="px-6 py-4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b border-slate-100">
                      <td className="px-6 py-4">{doc.filename}</td>
                      <td className="px-6 py-4">{(doc.content_type || 'file').split('/').pop()?.toUpperCase()}</td>
                      <td className="px-6 py-4">{formatBytes(doc.file_size)}</td>
                      <td className="px-6 py-4">{doc.status}</td>
                      <td className="px-6 py-4">{new Date(doc.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <button className="text-rose-500 hover:text-rose-700 disabled:text-slate-300" disabled={!canManageKnowledge} onClick={() => deleteDocument(doc.id)}>
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                  {documents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-slate-400">暂无文档</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
