import { Suspense } from 'react'
import RegisterClient from './register-client'

export const dynamic = 'force-dynamic'

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F5F1E8] text-[#5D5D5D]">Loading...</div>}>
      <RegisterClient />
    </Suspense>
  )
}
