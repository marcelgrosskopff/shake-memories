'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, Compass } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/create', label: 'Erzählen', icon: PlusCircle },
  { href: '/feed', label: 'Stories', icon: Compass },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
      {/* Glass background */}
      <div className="absolute inset-0 bg-shake-black/80 backdrop-blur-2xl border-t border-white/[0.06]" />

      <div className="relative mx-auto flex max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-6 py-3 transition-colors active:scale-95',
                isActive ? 'text-shake-neon-pink' : 'text-shake-text-muted'
              )}
            >
              <Icon
                className={cn(
                  'h-6 w-6 transition-colors',
                  isActive && 'drop-shadow-[0_0_8px_var(--color-shake-neon-pink)]'
                )}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span className={cn(
                'text-xs transition-colors',
                isActive && 'font-medium'
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
