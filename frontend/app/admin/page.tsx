'use client'

import { useEffect, useState } from 'react'

import { getStoredUser } from '@/lib/auth'
import { api } from '@/lib/api'
import { UsageChart } from '@/components/UsageChart'

interface DashboardMetrics {
  total_users: number
  total_orders: number
  total_revenue: number
  active_subscription: string | null
  tenant_slug: string
}

export default function AdminPage() {
  const [data, setData] = useState<DashboardMetrics | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const user = getStoredUser()
    if (!user) {
      window.location.href = '/signin'
      return
    }
    if (!['owner', 'admin'].includes(user.role)) {
      window.location.href = '/app'
      return
    }
    api.get('/admin/dashboard')
      .then(({ data }) => setData(data))
      .catch(() => setError('管理后台数据加载失败，请检查登录状态或后端服务'))
  }, [])

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-12">
      <h1 className="text-4xl font-bold">管理后台</h1>
      {error && <p className="rounded-xl border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-200">{error}</p>}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="card"><h2 className="text-lg font-semibold">用户总数</h2><p className="mt-4 text-4xl font-bold">{data?.total_users ?? 0}</p></div>
        <div className="card"><h2 className="text-lg font-semibold">订单总数</h2><p className="mt-4 text-4xl font-bold">{data?.total_orders ?? 0}</p></div>
        <div className="card"><h2 className="text-lg font-semibold">订单收入</h2><p className="mt-4 text-4xl font-bold">${data?.total_revenue?.toFixed(2) ?? '0.00'}</p></div>
      </div>
      <UsageChart />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card"><h2 className="text-xl font-semibold">当前租户</h2><p className="mt-2 text-slate-300">{data?.tenant_slug ?? '-'}</p></div>
        <div className="card"><h2 className="text-xl font-semibold">活跃订阅</h2><p className="mt-2 text-slate-300">{data?.active_subscription ?? 'Free / 未激活'}</p></div>
      </div>
    </main>
  )
}
