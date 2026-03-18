export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="mb-4 text-cyan-400">企业级 AI SaaS 平台</p>
          <h1 className="text-5xl font-bold leading-tight">为中小企业构建可商用的知识库 AI 平台</h1>
          <p className="mt-6 text-lg text-slate-300">多租户隔离、Stripe 订阅、Dify 知识库、后台管理与生产部署能力一体化。</p>
          <div className="mt-8 flex gap-4"><a className="btn" href="/signup">立即开始</a><a className="rounded-xl border border-slate-700 px-4 py-2" href="/pricing">查看价格</a></div>
        </div>
        <div className="card">
          <h2 className="text-2xl font-semibold">产品能力</h2>
          <ul className="mt-4 space-y-3 text-slate-300">
            <li>• RAG 知识问答与 AI fallback</li>
            <li>• 企业级 RBAC 与租户隔离</li>
            <li>• 支付、订单、订阅自动开通</li>
            <li>• Docker Compose + Nginx 一键部署</li>
          </ul>
        </div>
      </section>
    </main>
  )
}
