'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import ThemeToggle from '@/components/UI/ThemeToggle'

export default function PublicNav() {
  const { user, logout } = useAuth()

  return (
    <nav className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur-md dark:border-paper/10 dark:bg-midnight/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-lg italic tracking-wide text-ink-soft dark:text-paper">
          みちへしらない
          <span className="ml-2 hidden text-xs not-italic uppercase tracking-widest2 text-ink-muted dark:text-ink-faint sm:inline">
            Unknown Roads
          </span>
        </Link>

        <div className="flex items-center gap-5 text-sm">
          <Link href="/all" className="text-ink-muted transition-colors hover:text-ink-soft dark:text-ink-faint dark:hover:text-paper">
            Journal
          </Link>
          <Link href="/aboutme" className="text-ink-muted transition-colors hover:text-ink-soft dark:text-ink-faint dark:hover:text-paper">
            About
          </Link>

          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link href="/admin/dashboard" className="text-ink-muted transition-colors hover:text-ink-soft dark:text-ink-faint dark:hover:text-paper">
                  Admin
                </Link>
              )}
              <button
                onClick={logout}
                className="text-ink-muted transition-colors hover:text-ink-soft dark:text-ink-faint dark:hover:text-paper"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="border-b border-ink-soft/40 pb-0.5 text-ink-soft transition-colors hover:border-ember hover:text-ember dark:border-paper/30 dark:text-paper"
            >
              Login
            </Link>
          )}

          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
