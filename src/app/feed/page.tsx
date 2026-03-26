'use client'

import { motion } from 'framer-motion'
import { useStories } from '@/hooks/use-stories'
import { StoryCard } from '@/components/story/story-card'
import { Loader2 } from 'lucide-react'

export default function FeedPage() {
  const { data: stories, isLoading, error } = useStories()

  return (
    <div className="min-h-dvh px-5 pt-0 pb-8">
      {/* Header — clean, branded */}
      <div className="sticky top-0 z-20 -mx-5 mb-6 border-b border-white/5 bg-shake-black/90 backdrop-blur-lg px-5 py-4">
        <h1 className="text-xl font-bold">
          <span className="gradient-text">Shake</span>
          <span className="text-shake-text"> Stories</span>
        </h1>
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
          <h2 className="text-lg font-medium text-shake-text">Oops, da ging was schief</h2>
          <p className="mt-2 text-base text-shake-text-muted">
            Stories konnten nicht geladen werden.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full bg-shake-neon-pink px-6 py-2.5 text-sm font-medium text-white active:opacity-90 transition-opacity"
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
          <h2 className="text-lg font-medium text-shake-text">Noch keine Stories</h2>
          <p className="mt-2 text-base text-shake-text-muted">
            Sei der/die Erste und erzähle deine Shake-Erinnerung!
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
