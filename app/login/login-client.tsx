'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginClient() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password, redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F1E8] px-4">
      <div className="max-w-md w-full space-y-6">
        <h2 className="text-center text-3xl font-bold">ログイン</h2>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <input
            type="password"
            required
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <button
            disabled={isLoading}
            className="w-full bg-black text-white p-2 rounded disabled:opacity-50"
          >
            {isLoading ? 'ログイン中…' : 'ログイン'}
          </button>
        </form>

        <p className="text-center text-sm">
          アカウントをお持ちでないですか？{' '}
          <Link
            href={`/register${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
            className="underline"
          >
            新規登録
          </Link>
        </p>
      </div>
    </div>
  )
}
