'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { PlusCircle, Sparkles, ChevronDown } from 'lucide-react'
import { CLUB_TIMELINE } from '@/types'
import { TimelineItem } from '@/components/ui/timeline-item'

export default function HomePage() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* Hero Section */}
      <section className="relative flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-shake-neon-pink/5 via-shake-black to-shake-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,45,120,0.08),transparent_70%)]" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          {/* Disco ball emoji as hero icon */}
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="mx-auto mb-6 text-6xl"
          >
            🪩
          </motion.div>

          <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-7xl">
            <span className="gradient-text">Shake</span>
            <br />
            <span className="text-shake-text">Memories</span>
          </h1>

          <p className="mx-auto mb-2 max-w-md text-lg text-shake-text-muted">
            35 Jahre Clubkultur in Rothis
          </p>
          <p className="mx-auto mb-10 max-w-sm text-sm text-shake-text-muted/70">
            Einfach anders. Seit 1989.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/create"
              className="pulse-neon inline-flex items-center justify-center gap-2 rounded-full bg-shake-neon-pink px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-shake-neon-pink/90"
            >
              <PlusCircle className="h-5 w-5" />
              Deine Geschichte
            </Link>
            <Link
              href="/feed"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-shake-light px-8 py-4 text-lg font-semibold text-shake-text transition-all hover:border-shake-neon-blue hover:text-shake-neon-blue"
            >
              <Sparkles className="h-5 w-5" />
              Stories lesen
            </Link>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="h-6 w-6 text-shake-text-muted" />
          </motion.div>
        </motion.div>
      </section>

      {/* Timeline Section */}
      <section className="relative px-6 py-20">
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-shake-neon-pink/50 via-shake-neon-blue/30 to-transparent" />

        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16 text-center text-3xl font-bold"
        >
          Die <span className="gradient-text">Timeline</span>
        </motion.h2>

        <div className="mx-auto max-w-lg space-y-12">
          {CLUB_TIMELINE.map((item, index) => (
            <TimelineItem key={item.year} item={item} index={index} />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-lg grid-cols-2 gap-6">
          {[
            { value: '35+', label: 'Jahre' },
            { value: '1.5M', label: 'Besucher' },
            { value: '1000+', label: 'Events' },
            { value: '∞', label: 'Erinnerungen' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-shake-light/30 bg-shake-dark/50 p-6 text-center backdrop-blur-sm"
            >
              <div className="text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="mt-1 text-sm text-shake-text-muted">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 pb-32 pt-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-md"
        >
          <h2 className="mb-4 text-2xl font-bold">Deine Erinnerung zählt</h2>
          <p className="mb-8 text-shake-text-muted">
            Ob legendäre Nacht, erste Liebe, oder &quot;bsoffene&quot; G&apos;schichten -
            jede Erinnerung macht das Shake unvergesslich.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-shake-neon-pink to-shake-neon-purple px-8 py-4 text-lg font-semibold text-white transition-all hover:opacity-90"
          >
            <PlusCircle className="h-5 w-5" />
            Jetzt erzählen
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
