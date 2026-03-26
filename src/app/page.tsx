'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { CLUB_TIMELINE } from '@/types'
import { TimelineItem } from '@/components/ui/timeline-item'
import { DiscoBall } from '@/components/ui/disco-ball'

export default function HomePage() {
  return (
    <div className="relative min-h-dvh">
      {/* Hero Section */}
      <section className="relative flex min-h-dvh flex-col items-center justify-center px-5 text-center">
        {/* Atmospheric glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-shake-neon-pink/5 via-shake-black to-shake-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,45,120,0.08),transparent_60%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          {/* Disco ball with pink glow behind */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto mb-4"
          >
            <div className="absolute inset-0 -m-8 rounded-full bg-[radial-gradient(circle,rgba(255,45,120,0.12),transparent_70%)]" />
            <DiscoBall size="lg" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-4 text-6xl font-bold tracking-tight sm:text-8xl"
          >
            <span className="gradient-text text-flicker">Shake</span>
            <br />
            <span className="text-shake-text">Memories</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mx-auto mb-2 max-w-md text-lg text-shake-text-muted"
          >
            35 Jahre Clubkultur in Rothis
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mx-auto mb-10 max-w-sm text-sm text-shake-text-muted/70"
          >
            Einfach anders. Seit 1989.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <Link
              href="/create"
              className="pulse-neon inline-flex items-center justify-center rounded-full bg-shake-neon-pink px-8 py-4 text-lg font-semibold text-white active:opacity-90 transition-opacity"
            >
              Dini Gschicht
            </Link>
            <Link
              href="/feed"
              className="glass inline-flex items-center justify-center rounded-full px-8 py-4 text-lg font-semibold text-shake-text active:border-white/20 transition-colors"
            >
              Stories lesa
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Timeline Section */}
      <section className="relative px-5 py-20">
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2">
          <div className="h-full w-full bg-gradient-to-b from-shake-neon-pink/30 via-white/5 to-transparent" />
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center text-4xl font-bold"
        >
          Die <span className="gradient-text">Timeline</span>
        </motion.h2>

        <div className="mx-auto max-w-lg space-y-12">
          {CLUB_TIMELINE.map((item, index) => (
            <TimelineItem key={item.year} item={item} index={index} />
          ))}
        </div>
      </section>

      {/* Stats Section — typographic, no emoji */}
      <section className="px-5 py-20">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12 text-center text-3xl font-bold"
        >
          In <span className="gradient-text">Zahlen</span>
        </motion.h2>
        <div className="mx-auto grid max-w-lg grid-cols-2 gap-4">
          {[
            { value: '35+', label: 'Jahre' },
            { value: '1.5M', label: 'Besucher' },
            { value: '1000+', label: 'Events' },
            { value: '\u221E', label: 'Erinnerungen' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 text-center"
            >
              <div className="text-4xl font-bold gradient-text">{stat.value}</div>
              <div className="mt-2 text-xs uppercase tracking-widest text-shake-text-muted">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-5 pb-32 pt-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-md"
        >
          <div className="relative mx-auto mb-6">
            <div className="absolute inset-0 -m-6 rounded-full bg-[radial-gradient(circle,rgba(255,45,120,0.1),transparent_70%)]" />
            <DiscoBall size="sm" className="mx-auto" />
          </div>
          <h2 className="mb-4 text-3xl font-bold">
            Dini Erinnerung <span className="gradient-text">zählt</span>
          </h2>
          <p className="mb-8 text-base text-shake-text-muted">
            Ob legendäri Nacht, erschti Liebi, oder bsoffeni G&apos;schichta &ndash;
            jedi Erinnerung macht&apos;s Shake unvergesslich.
          </p>
          <Link
            href="/create"
            className="pulse-neon inline-flex items-center rounded-full bg-shake-neon-pink px-8 py-4 text-lg font-semibold text-white active:opacity-90 transition-opacity"
          >
            Jetzt erzähla
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
