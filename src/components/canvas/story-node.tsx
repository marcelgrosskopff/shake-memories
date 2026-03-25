'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { Story } from '@/types'
import { truncate } from '@/lib/utils'

function StoryNodeComponent({ data }: NodeProps) {
  const story = data as unknown as Story

  return (
    <div className="w-48 rounded-xl border border-shake-light/30 bg-shake-dark/90 p-3 shadow-lg backdrop-blur-sm transition-all hover:border-shake-neon-pink/50 hover:shadow-[0_0_15px_rgba(255,45,120,0.15)]">
      <Handle type="target" position={Position.Top} className="!bg-shake-neon-blue !w-2 !h-2" />

      {/* Media thumbnail */}
      {story.media_urls && story.media_urls.length > 0 && (
        <div className="mb-2 aspect-video overflow-hidden rounded-lg">
          <img
            src={story.media_urls[0]}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Author */}
      <div className="flex items-center gap-1.5 mb-1">
        <div className="h-5 w-5 rounded-full bg-shake-neon-pink/20 flex items-center justify-center text-[10px]">
          🪩
        </div>
        <span className="text-xs font-medium text-shake-text">
          {story.author_name || 'Anonym'}
        </span>
      </div>

      {/* Text preview */}
      <p className="text-[11px] leading-snug text-shake-text-muted">
        {truncate(story.content_text, 80)}
      </p>

      {/* Reaction badges */}
      {story.reactions_count && Object.keys(story.reactions_count).length > 0 && (
        <div className="mt-1.5 flex gap-1">
          {Object.entries(story.reactions_count).slice(0, 3).map(([type, count]) => (
            <span key={type} className="text-[10px] opacity-70">
              {type === 'heart' ? '❤️' : type === 'fire' ? '🔥' : '😂'}{String(count)}
            </span>
          ))}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-shake-neon-pink !w-2 !h-2" />
    </div>
  )
}

export const StoryNode = memo(StoryNodeComponent)
