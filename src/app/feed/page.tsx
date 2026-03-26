'use client'

import { motion } from 'framer-motion'
import { useStories } from '@/hooks/use-stories'
import { StoryCard } from '@/components/story/story-card'
import { Loader2 } from 'lucide-react'

export default function FeedPage() {
  const { data: stories, isLoading, error } = useStories()

  return (
    <div className="min-h-dvh px-4 pt-0 pb-8">
      {/* Branded header */}
      <div className="sticky top-0 z-20 -mx-4 mb-4 border-b border-white/5 bg-shake-black/90 backdrop-blur-lg px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{'\u{1FA69}'}</span>
            <h1 className="text-xl font-bold">
              <span className="gradient-text text-flicker">Shake</span>
              <span className="text-shake-text"> Stories</span>
            </h1>
          </div>
          <span className="text-xs text-shake-text-muted/40">seit 1989</span>
        </div>
      </div>

      {/* Pull-to-refresh hint */}
      <div className="mb-3 text-center">
        <span className="text-[10px] text-shake-text-muted/30">{'\u{2193}'} Zum Aktualisieren runterziehen</span>
      </div>

      {isLoading ? (
        <div className="flex min-h-[50dvh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-shake-neon-pink" />
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex min-h-[50dvh] flex-col items-center justify-center text-center"
        >
          <div className="text-5xl">{'\u{1F635}'}</div>
          <h2 className="mt-4 text-lg font-medium">Oops, da ging was schief</h2>
          <p className="mt-1 text-sm text-shake-text-muted">
            Stories konnten nicht geladen werden. Versuch es nochmal!
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-full bg-shake-neon-pink px-6 py-2 text-sm font-medium text-white"
          >
            Nochmal versuchen
          </button>
        </motion.div>
      ) : !stories || stories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex min-h-[50dvh] flex-col items-center justify-center text-center"
        >
          <div className="text-5xl">{'\u{1FA69}'}</div>
          <h2 className="mt-4 text-lg font-medium">Noch keine Stories</h2>
          <p className="mt-1 text-sm text-shake-text-muted">
            Sei der/die Erste und erz&auml;hle deine Shake-Erinnerung!
          </p>
        </motion.div>
      ) : (
        <div className="mx-auto max-w-lg space-y-4">
          {stories.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: i * 0.08,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <StoryCard story={story} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
