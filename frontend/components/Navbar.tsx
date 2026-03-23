'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { clearSession, getStoredUser, UserSummary } from '@/lib/auth'

export function Navbar() {
  const [user, setUser] = useState<UserSummary | null>(null)

  useEffect(() => {
    setUser(getStoredUser())
  }, [])

  const logout = () => {
    clearSession()
    setUser(null)
    window.location.href = '/signin'
  }

  return (
    <header className="border-b border-slate-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold">AI SaaS Enterprise</Link>
        <nav className="flex items-center gap-4 text-sm text-slate-300">
          <Link href="/pricing">定价</Link>
          {user ? (
            <>
              <Link href="/app">控制台</Link>
              {['owner', 'admin'].includes(user.role) && <Link href="/admin">后台</Link>}
              <button onClick={logout} className="rounded-xl border border-slate-700 px-3 py-2">退出</button>
            </>
          ) : (
            <>
              <Link href="/signin">登录</Link>
              <Link href="/signup" className="btn">开始试用</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
