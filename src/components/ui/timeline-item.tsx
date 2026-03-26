'use client'

import { motion } from 'framer-motion'
import { CLUB_TIMELINE } from '@/types'

type TimelineEntry = (typeof CLUB_TIMELINE)[number]

export function TimelineItem({ item, index }: { item: TimelineEntry; index: number }) {
  const isLeft = index % 2 === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`relative flex items-center gap-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
    >
      {/* Content */}
      <div
        className={`glass-card flex-1 rounded-2xl p-4 ${
          isLeft ? 'text-right' : 'text-left'
        }`}
      >
        <div className="mb-1 text-xs font-bold tracking-wider text-shake-neon-pink uppercase">
          {item.year}
        </div>
        <div className="text-lg font-bold text-shake-text">{item.name}</div>
        <div className="mt-1 text-sm text-shake-text-muted leading-relaxed">{item.description}</div>
      </div>

      {/* Center dot — solid pink, one subtle shadow */}
      <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center">
        <div className="h-3 w-3 rounded-full bg-shake-neon-pink shadow-[0_0_8px_rgba(255,45,120,0.4)]" />
      </div>

      {/* Spacer for the other side */}
      <div className="flex-1" />
    </motion.div>
  )
}
