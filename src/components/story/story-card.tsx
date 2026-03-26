'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Story, ReactionType } from '@/types'
import { REACTION_EMOJIS } from '@/types'
import { formatDate, cn } from '@/lib/utils'
import { useReact } from '@/hooks/use-stories'
import Link from 'next/link'

export function StoryCard({ story }: { story: Story }) {
  const [showReactions, setShowReactions] = useState(false)
  const reactMutation = useReact()

  const handleReaction = (type: ReactionType) => {
    reactMutation.mutate({ storyId: story.id, reactionType: type })
    setShowReactions(false)
  }

  const reactionsCount = story.reactions_count || {}

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-shake-surface text-lg">
          {story.author_name ? story.author_name.charAt(0).toUpperCase() : '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-shake-text">
              {story.author_name || 'Anonym'}
            </span>
            {story.instagram_handle && (
              <a
                href={`https://instagram.com/${story.instagram_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-xs text-shake-neon-blue active:underline"
              >
                @{story.instagram_handle}
              </a>
            )}
          </div>
          <div className="text-xs text-shake-text-muted">
            {formatDate(story.created_at)}
          </div>
        </div>
      </div>

      {/* Media */}
      {story.media_urls && story.media_urls.length > 0 && (
        <div className={cn(
          'grid gap-0.5',
          story.media_urls.length === 1 ? 'grid-cols-1' :
          story.media_urls.length === 2 ? 'grid-cols-2' : 'grid-cols-2'
        )}>
          {story.media_urls.slice(0, 4).map((url, i) => (
            <div
              key={i}
              className={cn(
                'relative aspect-square overflow-hidden',
                story.media_urls.length === 1 && 'aspect-[4/3]',
                story.media_urls.length === 3 && i === 0 && 'row-span-2',
              )}
            >
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
              {i === 3 && story.media_urls.length > 4 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xl font-bold">
                  +{story.media_urls.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <p className="whitespace-pre-wrap text-base leading-relaxed text-shake-text">
          {story.content_text}
        </p>
      </div>

      {/* Reactions */}
      {Object.keys(reactionsCount).length > 0 && (
        <div className="flex gap-2 px-4 pb-2">
          {Object.entries(reactionsCount).map(([type, count]) => (
            <span
              key={type}
              className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs"
            >
              {REACTION_EMOJIS[type as ReactionType]} {String(count)}
            </span>
          ))}
        </div>
      )}

      {/* Actions — text-only, no icons */}
      <div className="flex items-center border-t border-white/[0.06]">
        <div className="relative">
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="px-4 py-3 text-sm text-shake-text-muted active:text-shake-neon-pink transition-colors"
          >
            Reagieren
          </button>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="glass-strong absolute bottom-full left-0 mb-2 flex gap-1 rounded-full p-1.5 shadow-xl z-50"
            >
              {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
                <button
                  key={type}
                  onClick={() => handleReaction(type as ReactionType)}
                  className="rounded-full p-2 text-2xl active:scale-110 active:bg-white/10"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        <Link
          href={`/create?reply=${story.id}`}
          className="px-4 py-3 text-sm text-shake-text-muted active:text-shake-neon-pink transition-colors"
        >
          Antworten
        </Link>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Shake Memories',
                text: `Eine Erinnerung an das Shake: "${story.content_text.slice(0, 100)}..."`,
                url: `${window.location.origin}/story/${story.id}`,
              })
            }
          }}
          className="ml-auto px-4 py-3 text-sm text-shake-text-muted active:text-shake-neon-pink transition-colors"
        >
          Teilen
        </button>
      </div>
    </div>
  )
}
