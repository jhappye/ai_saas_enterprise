export default function SigninPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="card space-y-4">
        <h1 className="text-3xl font-bold">登录</h1>
        <input className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="邮箱" />
        <input className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3" placeholder="密码" type="password" />
        <button className="btn w-full">登录</button>
      </div>
    </main>
  )
}
