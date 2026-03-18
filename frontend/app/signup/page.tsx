export default function SignupPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <div className="card space-y-4">
        <h1 className="text-3xl font-bold">注册企业账号</h1>
        <input className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="企业名称" />
        <input className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="企业标识 slug" />
        <input className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="姓名" />
        <input className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="邮箱" />
        <input className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="密码" type="password" />
        <button className="btn w-full">注册并开通</button>
      </div>
    </main>
  )
}
