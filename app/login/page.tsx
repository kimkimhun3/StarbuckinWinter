import { Suspense } from 'react'
import LoginClient from './login-client'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F5F1E8] text-[#5D5D5D]">Loading...</div>}>
      <LoginClient />
    </Suspense>
  )
}
