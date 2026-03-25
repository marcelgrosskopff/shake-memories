'use client'

import { motion } from 'framer-motion'
import { CLUB_TIMELINE } from '@/types'

type TimelineEntry = (typeof CLUB_TIMELINE)[number]

export function TimelineItem({ item, index }: { item: TimelineEntry; index: number }) {
  const isLeft = index % 2 === 0

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -40 : 40, scale: 0.95 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: 0.1, type: 'spring', stiffness: 100 }}
      className={`relative flex items-center gap-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* Content */}
      <div
        className={`glass-card shine-sweep flex-1 rounded-2xl p-4 ${
          isLeft ? 'text-right' : 'text-left'
        }`}
      >
        <div className="mb-1 text-xs font-bold tracking-wider text-shake-neon-pink uppercase">
          {item.year}
        </div>
        <div className="text-lg font-bold text-shake-text">{item.name}</div>
        <div className="mt-1 text-sm text-shake-text-muted leading-relaxed">{item.description}</div>
      </div>

      {/* Center dot with pulse */}
      <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center">
        {/* Outer pulse ring */}
        <div className="absolute h-5 w-5 rounded-full bg-shake-neon-pink/20 dot-pulse" />
        {/* Inner dot */}
        <div className="relative h-3 w-3 rounded-full bg-shake-neon-pink shadow-[0_0_12px_var(--color-shake-neon-pink),0_0_24px_rgba(255,45,120,0.3)]" />
      </div>

      {/* Spacer for the other side */}
      <div className="flex-1" />
    </motion.div>
  )
}
