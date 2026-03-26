'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Story, StoryConnection, StoryFormData, ReactionType } from '@/types'
import { generateAnonymousId } from '@/lib/utils'

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Request failed')
  }
  return res.json()
}

export function useStories() {
  return useQuery<Story[]>({
    queryKey: ['stories'],
    queryFn: () => fetchJson<Story[]>('/api/stories'),
    retry: 1,
  })
}

export function useStory(id: string) {
  return useQuery<Story>({
    queryKey: ['story', id],
    queryFn: () => fetchJson(`/api/stories/${id}`),
    enabled: !!id,
  })
}

export function useStoryConnections() {
  return useQuery<StoryConnection[]>({
    queryKey: ['story-connections'],
    queryFn: () => fetchJson<StoryConnection[]>('/api/stories/connections'),
    retry: 1,
  })
}

export function useCreateStory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: StoryFormData) => {
      const anonymousId = generateAnonymousId()

      // Upload media files first if any
      let mediaUrls: string[] = []
      if (data.media_files && data.media_files.length > 0) {
        const formData = new FormData()
        data.media_files.forEach((file) => formData.append('files', file))
        formData.append('anonymous_id', anonymousId)
        const uploadResult = await fetchJson<{ urls: string[] }>('/api/upload', {
          method: 'POST',
          body: formData,
        })
        mediaUrls = uploadResult.urls
      }

      // Create the story
      return fetchJson<Story>('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_text: data.content_text,
          author_name: data.author_name,
          instagram_handle: data.instagram_handle,
          parent_story_id: data.parent_story_id,
          media_urls: mediaUrls,
          anonymous_id: anonymousId,
        }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] })
    },
  })
}

export function useReact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      storyId,
      reactionType,
    }: {
      storyId: string
      reactionType: ReactionType
    }) => {
      const anonymousId = generateAnonymousId()
      return fetchJson('/api/stories/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story_id: storyId,
          reaction_type: reactionType,
          anonymous_id: anonymousId,
        }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] })
    },
  })
}
