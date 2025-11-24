import { NextRequest } from 'next/server'
import { verifyToken } from './auth'

export function getAuthUser(request: NextRequest): { userId: string; role: string } | null {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}

export function requireAuth(request: NextRequest) {
  const user = getAuthUser(request)
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

export function requireAdmin(request: NextRequest) {
  const user = requireAuth(request)
  
  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required')
  }
  
  return user
}