'use client'

import { use } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useStory } from '@/hooks/use-stories'
import { StoryCard } from '@/components/story/story-card'

export default function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: story, isLoading } = useStory(id)

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-shake-neon-pink" />
      </div>
    )
  }

  if (!story) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl">🪩</div>
        <h2 className="mt-4 text-lg font-medium">Story nicht gefunden</h2>
        <Link href="/feed" className="mt-4 text-shake-neon-pink hover:underline">
          Zurück zu den Stories
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-dvh px-4 pt-6">
      <div className="mb-4">
        <Link href="/feed" className="inline-flex items-center gap-1 text-shake-text-muted">
          <ArrowLeft className="h-5 w-5" />
          Zurück
        </Link>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg"
      >
        <StoryCard story={story} />
      </motion.div>
    </div>
  )
}
