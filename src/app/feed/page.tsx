'use client'

import { motion } from 'framer-motion'
import { useStories } from '@/hooks/use-stories'
import { StoryCard } from '@/components/story/story-card'
import { Loader2, Sparkles } from 'lucide-react'

export default function FeedPage() {
  const { data: stories, isLoading, error } = useStories()

  return (
    <div className="min-h-dvh px-4 pt-6">
      <div className="mb-6 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-shake-neon-pink" />
        <h1 className="text-xl font-bold">Stories</h1>
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
          <div className="text-5xl">😵</div>
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
          <div className="text-5xl">🪩</div>
          <h2 className="mt-4 text-lg font-medium">Noch keine Stories</h2>
          <p className="mt-1 text-sm text-shake-text-muted">
            Sei der/die Erste und erzähle deine Shake-Erinnerung!
          </p>
        </motion.div>
      ) : (
        <div className="mx-auto max-w-lg space-y-4 pb-8">
          {stories.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <StoryCard story={story} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
