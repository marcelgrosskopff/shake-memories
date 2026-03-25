'use client'

import { cn } from '@/lib/utils'

const PARTICLES = Array.from({ length: 30 }).map((_, i) => ({
  id: i,
  size: 1 + Math.random() * 3,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: 6 + Math.random() * 10,
  delay: Math.random() * 8,
  floatX: -30 + Math.random() * 60,
  floatY: -60 - Math.random() * 80,
  scale: 0.5 + Math.random() * 1.5,
  color: ['rgba(255,45,120,0.5)', 'rgba(0,212,255,0.4)', 'rgba(180,77,255,0.4)', 'rgba(255,215,0,0.3)', 'rgba(255,255,255,0.2)'][i % 5],
}))

export function Particles({ className }: { className?: string }) {
  return (
    <div
      className={cn('pointer-events-none fixed inset-0 z-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            '--particle-size': `${p.size}px`,
            '--particle-color': p.color,
            '--particle-duration': `${p.duration}s`,
            '--particle-delay': `${p.delay}s`,
            '--float-x': `${p.floatX}px`,
            '--float-y': `${p.floatY}px`,
            '--float-scale': p.scale,
            left: `${p.x}%`,
            top: `${p.y}%`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
