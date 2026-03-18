export default function UserAppPage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-[2fr,1fr]">
      <section className="card">
        <h1 className="text-3xl font-bold">AI 助手</h1>
        <div className="mt-6 rounded-2xl border border-slate-800 p-4">
          <p className="text-slate-400">请输入你的企业问题，系统将基于 Dify 知识库回答。</p>
          <textarea className="mt-4 h-40 w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="请总结我们的售后服务SOP" />
          <button className="btn mt-4">发送</button>
        </div>
      </section>
      <aside className="space-y-6">
        <div className="card"><h2 className="text-xl font-semibold">订阅状态</h2><p className="mt-2 text-slate-300">Pro · Active</p></div>
        <div className="card"><h2 className="text-xl font-semibold">最近记录</h2><ul className="mt-2 space-y-2 text-slate-300"><li>• 销售流程问答</li><li>• 员工手册检索</li></ul></div>
      </aside>
    </main>
  )
}
