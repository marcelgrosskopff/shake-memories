'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, LayoutGrid, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/feed', label: 'Stories', icon: Sparkles },
  { href: '/create', label: 'Erzählen', icon: PlusCircle },
  { href: '/canvas', label: 'Canvas', icon: LayoutGrid },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-shake-light/30 bg-shake-black/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          const isCreate = item.href === '/create'

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-4 py-3 text-xs transition-colors',
                isActive ? 'text-shake-neon-pink' : 'text-shake-text-muted',
                isCreate && !isActive && 'text-shake-neon-pink'
              )}
            >
              <Icon
                className={cn(
                  'h-6 w-6',
                  isCreate && 'h-7 w-7',
                  isActive && 'drop-shadow-[0_0_8px_var(--color-shake-neon-pink)]'
                )}
              />
              <span className={cn(isActive && 'font-medium')}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
