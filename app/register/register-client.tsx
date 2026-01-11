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
      <div className="max-w-md w-full space-y-6">
        <h2 className="text-center text-3xl font-bold">新規登録</h2>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            placeholder="ユーザー名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
          />

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
            {isLoading ? '登録中…' : '登録'}
          </button>
        </form>

        <p className="text-center text-sm">
          すでにアカウントをお持ちですか？{' '}
          <Link
            href={`/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
            className="underline"
          >
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
