import { Suspense } from 'react'
import RegisterClient from './register-client'

export const dynamic = 'force-dynamic'

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterClient />
    </Suspense>
  )
}
