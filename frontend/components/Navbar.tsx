export function Navbar() {
  return (
    <header className="border-b border-slate-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <a href="/" className="text-xl font-bold">AI SaaS Enterprise</a>
        <nav className="flex gap-4 text-sm text-slate-300">
          <a href="/pricing">定价</a>
          <a href="/signin">登录</a>
          <a href="/signup" className="btn">开始试用</a>
        </nav>
      </div>
    </header>
  )
}
