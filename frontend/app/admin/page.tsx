import { UsageChart } from '@/components/UsageChart'

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-12">
      <h1 className="text-4xl font-bold">管理后台</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="card"><h2 className="text-lg font-semibold">用户总数</h2><p className="mt-4 text-4xl font-bold">128</p></div>
        <div className="card"><h2 className="text-lg font-semibold">企业总数</h2><p className="mt-4 text-4xl font-bold">24</p></div>
        <div className="card"><h2 className="text-lg font-semibold">订单收入</h2><p className="mt-4 text-4xl font-bold">$12,600</p></div>
      </div>
      <UsageChart />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card"><h2 className="text-xl font-semibold">用户管理</h2><p className="mt-2 text-slate-300">支持查看、启停、角色调整。</p></div>
        <div className="card"><h2 className="text-xl font-semibold">订单管理</h2><p className="mt-2 text-slate-300">支持订阅状态和支付流水追踪。</p></div>
      </div>
    </main>
  )
}
