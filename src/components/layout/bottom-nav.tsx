'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/create', label: 'Erzählen', icon: PlusCircle, isCenter: true },
  { href: '/feed', label: 'Stories', icon: Sparkles },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
      {/* Glass background */}
      <div className="absolute inset-0 bg-shake-black/70 backdrop-blur-2xl border-t border-white/[0.06]" />

      {/* Subtle top glow */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative mx-auto flex max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -mt-5 flex flex-col items-center gap-0.5"
              >
                {/* Outer glow ring */}
                <div
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-shake-neon-pink to-shake-neon-purple shadow-lg transition-all',
                    isActive
                      ? 'shadow-[0_0_12px_rgba(255,45,120,0.4)]'
                      : 'shadow-[0_0_6px_rgba(255,45,120,0.2)]'
                  )}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors',
                    isActive ? 'text-shake-neon-pink' : 'text-shake-text-muted'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-6 py-3 text-xs transition-all',
                isActive ? 'text-shake-neon-pink' : 'text-shake-text-muted'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'h-6 w-6 transition-all',
                    isActive && 'drop-shadow-[0_0_10px_var(--color-shake-neon-pink)]'
                  )}
                />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-shake-neon-pink shadow-[0_0_6px_var(--color-shake-neon-pink)]" />
                )}
              </div>
              <span className={cn('transition-all', isActive && 'font-medium')}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
