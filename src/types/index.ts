export type ModerationStatus = 'pending' | 'approved' | 'rejected'
export type ConnectionType = 'reply' | 'weave' | 'continuation'
export type ReactionType = 'heart' | 'fire' | 'laugh' | 'crying' | 'party'
export type MediaType = 'photo' | 'video'

export interface Story {
  id: string
  content_text: string
  media_urls: string[]
  canvas_position: { x: number; y: number; scale: number } | null
  parent_story_id: string | null
  instagram_handle: string | null
  author_name: string | null
  anonymous_id: string
  moderation_status: ModerationStatus
  created_at: string
  updated_at: string
  // joined
  reactions_count?: Record<ReactionType, number>
  connections_count?: number
  media?: Media[]
}

export interface StoryConnection {
  id: string
  from_story_id: string
  to_story_id: string
  connection_type: ConnectionType
  created_at: string
}

export interface Media {
  id: string
  story_id: string
  storage_path: string
  media_type: MediaType
  thumbnail_path: string | null
  filters_applied: Record<string, unknown> | null
  width: number | null
  height: number | null
  created_at: string
}

export interface Reaction {
  id: string
  story_id: string
  reaction_type: ReactionType
  anonymous_id: string
  created_at: string
}

export interface StoryFormData {
  content_text: string
  author_name?: string
  instagram_handle?: string
  parent_story_id?: string
  media_files?: File[]
}

export interface CanvasNode {
  id: string
  type: 'story'
  position: { x: number; y: number }
  data: Story
}

export interface CanvasEdge {
  id: string
  source: string
  target: string
  type: string
  data: StoryConnection
}

export const CLUB_TIMELINE = [
  { year: 1989, name: 'Starlight', description: 'Die Geburtsstunde - Waschmittelfabrik wird zur Disco' },
  { year: 1991, name: 'Kiew', description: 'Konzerte von Rammstein, Falco & H-Blockx' },
  { year: 1997, name: "Jimmy's Palace", description: 'Nach der Renovierung' },
  { year: 1999, name: 'A14', description: 'Neuer Name, gleiche Location' },
  { year: 2000, name: 'Dos Manos', description: '4 Jahre unter neuen Betreibern' },
  { year: 2004, name: 'K-Shake', description: 'Thomas Krobath übernimmt mit 25 - die goldenen Jahre beginnen' },
  { year: 2018, name: 'Vabrik', description: 'Neuer Name, Hommage an die Fabrik-Wurzeln' },
  { year: 2023, name: 'Shake', description: 'Zurück zum Kern - die letzte Ära' },
] as const

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  heart: '❤️',
  fire: '🔥',
  laugh: '😂',
  crying: '🥲',
  party: '🎉',
}
