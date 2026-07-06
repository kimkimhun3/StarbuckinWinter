'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function RegisterClient() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await register(email, password, name, redirectTo)
      router.push(redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8] px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-light text-[#2F2F2F] mb-2">新規登録</h2>
          <div className="w-10 h-px bg-[#3D3D3D] mx-auto"></div>
        </div>

        {error && <p className="text-[#A63A32] text-sm text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            placeholder="ユーザー名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-white border border-[#D4CFC4] rounded-sm text-[#2F2F2F] placeholder:text-[#9D9D9D] focus:outline-none focus:border-[#3D3D3D] transition-colors"
          />

          <input
            type="email"
            required
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-white border border-[#D4CFC4] rounded-sm text-[#2F2F2F] placeholder:text-[#9D9D9D] focus:outline-none focus:border-[#3D3D3D] transition-colors"
          />

          <input
            type="password"
            required
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-white border border-[#D4CFC4] rounded-sm text-[#2F2F2F] placeholder:text-[#9D9D9D] focus:outline-none focus:border-[#3D3D3D] transition-colors"
          />

          <button
            disabled={isLoading}
            className="w-full bg-[#3D3D3D] text-white p-3 rounded-sm hover:bg-[#2B2B28] transition-colors disabled:opacity-50 text-sm tracking-wide"
          >
            {isLoading ? '登録中…' : '登録'}
          </button>
        </form>

        <p className="text-center text-sm text-[#5D5D5D]">
          すでにアカウントをお持ちですか？{' '}
          <Link
            href={`/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
            className="text-[#3D3D3D] border-b border-[#3D3D3D] hover:text-[#5D5D5D] hover:border-[#5D5D5D] transition-colors"
          >
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
