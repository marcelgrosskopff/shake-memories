'use client'

import { motion } from 'framer-motion'
import { CLUB_TIMELINE } from '@/types'

type TimelineEntry = (typeof CLUB_TIMELINE)[number]

export function TimelineItem({ item, index }: { item: TimelineEntry; index: number }) {
  const isLeft = index % 2 === 0

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`relative flex items-center gap-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* Content */}
      <div
        className={`flex-1 rounded-2xl border border-shake-light/30 bg-shake-dark/80 p-4 backdrop-blur-sm ${
          isLeft ? 'text-right' : 'text-left'
        }`}
      >
        <div className="text-xs font-medium text-shake-neon-pink">{item.year}</div>
        <div className="text-lg font-bold text-shake-text">{item.name}</div>
        <div className="mt-1 text-sm text-shake-text-muted">{item.description}</div>
      </div>

      {/* Center dot */}
      <div className="relative z-10 flex h-4 w-4 shrink-0 items-center justify-center">
        <div className="h-3 w-3 rounded-full bg-shake-neon-pink shadow-[0_0_10px_var(--color-shake-neon-pink)]" />
      </div>

      {/* Spacer for the other side */}
      <div className="flex-1" />
    </motion.div>
  )
}
